#!/usr/bin/env python3
"""Safely convert one local file or explicitly allowed HTTPS resource to Markdown."""

from __future__ import annotations

import argparse
import ipaddress
import socket
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlsplit

MAX_BYTES = 50 * 1024 * 1024
TIMEOUT_SECONDS = 45.0
MAX_REDIRECTS = 10
CHUNK_SIZE = 64 * 1024
LOCAL_EXTENSIONS = {
    ".atom",
    ".csv",
    ".docx",
    ".epub",
    ".htm",
    ".html",
    ".ipynb",
    ".json",
    ".markdown",
    ".md",
    ".msg",
    ".pdf",
    ".pptx",
    ".rss",
    ".text",
    ".tsv",
    ".txt",
    ".xhtml",
    ".xls",
    ".xlsx",
    ".xml",
    ".yaml",
    ".yml",
    ".zip",
}


class ConversionError(Exception):
    """A user-facing conversion error."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert one local file or approved HTTPS source to Markdown."
    )
    parser.add_argument("source", metavar="SOURCE", help="local file or HTTPS URL")
    parser.add_argument("-o", "--output", type=Path, help="write Markdown to PATH")
    parser.add_argument("--force", action="store_true", help="overwrite an existing output")
    parser.add_argument(
        "--allow-remote", action="store_true", help="permit an HTTPS source"
    )
    parser.add_argument(
        "--use-plugins",
        action="store_true",
        help="enable MarkItDown plugins already installed in .venv",
    )
    return parser.parse_args()


def require_dependencies():
    try:
        import requests
        from markitdown import MarkItDown
    except ImportError as exc:
        raise ConversionError(
            "missing dependencies; run: .venv/bin/python -m pip install -r "
            ".agents/skills/convert-with-markitdown/requirements.txt"
        ) from exc
    return MarkItDown, requests


def validate_https_url(url: str) -> None:
    parsed = urlsplit(url)
    if parsed.scheme.lower() != "https":
        raise ConversionError("remote sources must use HTTPS")
    if not parsed.hostname:
        raise ConversionError("remote source has no hostname")
    if parsed.username is not None or parsed.password is not None:
        raise ConversionError("remote URLs must not contain credentials")

    try:
        addresses = {
            info[4][0]
            for info in socket.getaddrinfo(
                parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM
            )
        }
    except (OSError, ValueError) as exc:
        raise ConversionError(f"cannot resolve remote host: {parsed.hostname}") from exc

    if not addresses:
        raise ConversionError(f"cannot resolve remote host: {parsed.hostname}")
    for address in addresses:
        ip = ipaddress.ip_address(address.split("%", 1)[0])
        if not ip.is_global:
            raise ConversionError(f"remote host resolves to a non-public address: {ip}")


def fetch_https(url: str, requests):
    deadline = time.monotonic() + TIMEOUT_SECONDS
    session = requests.Session()
    current_url = url

    try:
        for redirect_count in range(MAX_REDIRECTS + 1):
            validate_https_url(current_url)
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise ConversionError("remote request exceeded the 30-second limit")

            try:
                response = session.get(
                    current_url,
                    allow_redirects=False,
                    stream=True,
                    timeout=remaining,
                )
            except requests.RequestException as exc:
                raise ConversionError(f"remote request failed: {exc}") from exc

            if response.is_redirect or response.is_permanent_redirect:
                location = response.headers.get("Location")
                response.close()
                if not location:
                    raise ConversionError("remote redirect has no Location header")
                if redirect_count == MAX_REDIRECTS:
                    raise ConversionError("remote request exceeded 10 redirects")
                current_url = urljoin(current_url, location)
                continue

            try:
                response.raise_for_status()
                length = response.headers.get("Content-Length")
                if length is not None:
                    try:
                        if int(length) > MAX_BYTES:
                            raise ConversionError("remote response exceeds the 50 MiB limit")
                    except ValueError as exc:
                        raise ConversionError("remote response has an invalid Content-Length") from exc

                content = bytearray()
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if time.monotonic() > deadline:
                        raise ConversionError("remote request exceeded the 30-second limit")
                    if chunk:
                        content.extend(chunk)
                        if len(content) > MAX_BYTES:
                            raise ConversionError("remote response exceeds the 50 MiB limit")
                response._content = bytes(content)
                response._content_consumed = True
                return response
            except requests.RequestException as exc:
                response.close()
                raise ConversionError(f"remote request failed: {exc}") from exc
            except Exception:
                response.close()
                raise
    finally:
        session.close()

    raise ConversionError("remote request failed")


def convert(args: argparse.Namespace) -> str:
    MarkItDown, requests = require_dependencies()
    converter = MarkItDown(enable_plugins=args.use_plugins)
    parsed = urlsplit(args.source)

    try:
        if parsed.scheme:
            if parsed.scheme.lower() != "https":
                raise ConversionError("remote sources must use HTTPS")
            if not args.allow_remote:
                raise ConversionError("remote sources require --allow-remote")
            response = fetch_https(args.source, requests)
            result = converter.convert_response(response)
        else:
            source = Path(args.source)
            if not source.exists():
                raise ConversionError(f"source does not exist: {source}")
            if not source.is_file():
                raise ConversionError(f"source is not a file: {source}")
            if not args.use_plugins and source.suffix.lower() not in LOCAL_EXTENSIONS:
                raise ConversionError(
                    f"unsupported local format: {source.suffix or '(no extension)'}"
                )
            result = converter.convert_local(source)
    except ConversionError:
        raise
    except Exception as exc:
        raise ConversionError(f"conversion failed: {exc}") from exc

    text = getattr(result, "text_content", None)
    if not isinstance(text, str):
        raise ConversionError("conversion returned no Markdown content")
    return text


def write_result(text: str, output: Path | None, force: bool) -> None:
    if output is None:
        sys.stdout.write(text)
        return

    mode = "w" if force else "x"
    try:
        with output.open(mode, encoding="utf-8") as stream:
            stream.write(text)
    except FileExistsError as exc:
        raise ConversionError(f"output already exists: {output}; use --force") from exc
    except OSError as exc:
        raise ConversionError(f"cannot write output: {output}: {exc}") from exc


def main() -> int:
    args = parse_args()
    try:
        text = convert(args)
        write_result(text, args.output, args.force)
    except ConversionError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
