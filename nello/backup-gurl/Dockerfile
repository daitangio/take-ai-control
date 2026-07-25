FROM debian:trixie-slim

RUN apt update && apt install -y sqlite3=3.46.1-7+deb13u1 

COPY backupCaliforniaGurl.sh .

CMD ./backupCaliforniaGurl.sh