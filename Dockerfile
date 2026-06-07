FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

COPY requirements.txt .

# Install dependencies using uv
RUN uv pip install --system -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uv", "run", "main.py"]