FROM node:18-alpine as frontend-builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install

COPY frontend . 

# Accept VITE_API_BASE_URL as build arg for production deployments
# Default to /api for local Docker Compose (Nginx proxies to backend)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build


FROM nginx:alpine as frontend

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM python:3.11-slim as backend

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY backend ./backend

RUN python backend/ingestion/mock_jira.py && \
    python backend/ingestion/mock_confluence.py && \
    python backend/ingestion/bm25_indexer.py

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]