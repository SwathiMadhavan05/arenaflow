# Stage 1: Build Frontend UI Matrix natively
FROM node:22 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Initialize FastAPI Simulation Engine 
FROM python:3.9-slim
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./

# Hydrate the backend payload exactly matching the static mounts
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose internal execution binding natively mapping to Cloud Run ingress
EXPOSE 8080
ENV PORT=8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
