FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

RUN uv sync --no-dev --frozen
RUN DEBIAN_FRONTEND=noninteractive uv run playwright install --with-deps chromium

EXPOSE 80

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
