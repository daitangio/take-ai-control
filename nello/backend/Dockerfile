FROM python:3.14-trixie


WORKDIR /app/nello
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src src
# /app/nello/nello.db
CMD uvicorn src.main:app --port 6502 --reload
