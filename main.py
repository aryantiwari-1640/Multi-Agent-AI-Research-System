from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, ConfigDict
import json
from pipeline import stream_research_pipeline

# Initialize FastAPI app
app = FastAPI(
    title="Multi-Agent AI Research System API",
    description="API for running multi-agent research pipelines",
    version="1.0.0"
)

# Configure CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Request/Response Models ============

class ResearchRequest(BaseModel):
    """Request model for research pipeline"""
    topic: str
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "topic": "Artificial Intelligence in Healthcare"
            }
        }
    )

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    message: str

# ============ Health Check Endpoint ============

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint to verify API is running
    """
    return {
        "status": "healthy",
        "message": "Multi-Agent AI Research System API is running"
    }

# ============ Streaming Endpoint ============

@app.post("/api/research/stream", tags=["Research"])
async def stream_research(request: ResearchRequest):
    """
    Stream research results progressively as each pipeline step completes.
    """
    if not request.topic or len(request.topic.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail="Topic cannot be empty"
        )

    def event_generator():
        try:
            yield from stream_research_pipeline(request.topic)
        except Exception as e:
            yield f"data:{json.dumps({ 'type': 'error', 'message': str(e) })}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ============ Error Handlers ============

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {
        "error": exc.detail,
        "status_code": exc.status_code
    }

# ============ Root Endpoint ============

@app.get("/", tags=["Info"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "name": "Multi-Agent AI Research System API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "research_stream": "/api/research/stream",
            "api_docs": "/docs"
        }
    }

# ============ Run Server ============

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
