"""
FastAPI wrapper around the multi-agent pipeline (No Pydantic version).

Exposes one endpoint the React frontend calls:
    POST /api/chat   { "message": "..." }  ->
        { "search_results": "...", "reader_results": "...",
          "report": "...", "feedback": "..." }
"""

import os
import traceback

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Multi-Agent Pipeline API")

allowed_origins = [ 
    os.getenv("FRONTEND_ORIGIN")
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in allowed_origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _to_text(value) -> str:
    """Some pipeline steps (writer_chain/critic_chain) may return a
    LangChain message object instead of a plain string. Normalize
    everything to plain text so the API always returns strings."""
    if value is None:
        return ""
    if hasattr(value, "content"):
        return value.content
    return str(value)


def run_agent_pipeline(query: str) -> dict:
    from pipeline import run_research_pipeline
    result = run_research_pipeline(query)
    return {
        "search_results": _to_text(result.get("search_results", "")),
        "reader_results": _to_text(result.get("reader_results", "")),
        "report": _to_text(result.get("report", "")),
        "feedback": _to_text(result.get("feedback", "")),
    }


@app.get("/")
def health():
    return {"status": "ok", "service": "multi-agent-pipeline-api"}


@app.post("/api/chat")
async def chat(request: Request):
    # Manually parse the raw JSON body — no Pydantic model to do it for us
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Manual validation — checking that "message" key exists and is a string
    message = body.get("message")

    if not isinstance(message, str):
        raise HTTPException(status_code=400, detail="'message' must be a string")

    message = message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="message must not be empty")

    try:
        result = run_agent_pipeline(message)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    # Manually building the response dict — no ChatResponse class needed
    return {
        "search_results": result.get("search_results", ""),
        "reader_results": result.get("reader_results", ""),
        "report": result.get("report", ""),
        "feedback": result.get("feedback", ""),
    }