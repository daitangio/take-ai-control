
FROM ghcr.io/chopratejas/headroom:latest
COPY zscaler-root-ca.pem /usr/local/share/ca-certificates/zscaler-root-ca.crt
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    update-ca-certificates
RUN headroom update -y
ENTRYPOINT ["python3", "-m", "headroom.cli", "proxy"]
CMD ["--host", "0.0.0.0", "--port", "8787"]