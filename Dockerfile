FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

COPY pyproject.toml uv.lock* ./

# Install dependencies using uv
RUN uv sync

COPY . .

EXPOSE 8000

CMD ["uv", "run", "main.py"]