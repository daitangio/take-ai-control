---
name: convert-with-markitdown
description: Convert local PDF, DOCX, PPTX, XLSX, XLS, Outlook, HTML, JSON, XML, CSV, and other MarkItDown-supported files to Markdown. Use when an agent needs readable Markdown extracted from a document or data file, optionally from an explicitly approved HTTPS source or with already-installed third-party MarkItDown plugins.
---

# Convert with MarkItDown

If present use the repository-owned `.venv` and the bundled wrapper. Prefer local files.

## Set up once

Run from the repository root:

```bash
rtk .venv/bin/python -m ensurepip --upgrade
rtk .venv/bin/python -m pip install -r .agents/skills/convert-with-markitdown/requirements.txt
```

Do not use another interpreter or install outside `.venv`.

## Convert

Print Markdown to stdout:

```bash
rtk .venv/bin/python .agents/skills/convert-with-markitdown/scripts/convert.py SOURCE
```

Write a file with `-o PATH`. Refuse an existing output unless `--force` is set.

```bash
rtk .venv/bin/python .agents/skills/convert-with-markitdown/scripts/convert.py SOURCE -o output.md
rtk .venv/bin/python .agents/skills/convert-with-markitdown/scripts/convert.py SOURCE -o output.md --force
```

For an HTTPS source, require explicit network approval with `--allow-remote`. The wrapper rejects HTTP and non-public destinations, including unsafe redirects, and limits downloads to 45 seconds and 50 MiB.

```bash
rtk .venv/bin/python .agents/skills/convert-with-markitdown/scripts/convert.py --allow-remote https://example.com/file.pdf
```

Keep third-party plugins disabled unless the task requires a plugin already installed in `.venv`; then pass `--use-plugins`. Never install a plugin implicitly.

## Limitations

Do not use this skill for Azure services, LLM/OCR processing, an MCP server, audio transcription, YouTube transcription, or batch conversion. It converts one source per invocation.
