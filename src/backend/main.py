from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import time
from typing import Dict, List

app = FastAPI(
    title="DevNest AI Open Source",
    description="Free and Open Source AI Coding Assistant",
    version="1.0.0"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting storage
request_times: Dict[str, List[float]] = {}

class ChatRequest(BaseModel):
    message: str

def check_rate_limit(user_ip: str):
    """Free tier: 10 requests per hour"""
    current_time = time.time()
    if user_ip not in request_times:
        request_times[user_ip] = []
    
    # Remove requests older than 1 hour
    request_times[user_ip] = [t for t in request_times[user_ip] if current_time - t < 3600]
    
    if len(request_times[user_ip]) >= 10:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Free tier: 10 requests/hour")
    
    request_times[user_ip].append(current_time)
    return 10 - len(request_times[user_ip])

@app.post("/chat")
async def chat(request: ChatRequest, user_ip: str = "127.0.0.1"):
    """Free AI chat endpoint with rate limiting"""
    try:
        remaining = check_rate_limit(user_ip)
        
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "tinyllama:latest",
                "prompt": f"Answer this coding question: {request.message}",
                "stream": False
            },
            timeout=30
        )
        
        if response.status_code == 200:
            return {
                "response": response.json()["response"],
                "remaining_requests": remaining,
                "status": "success"
            }
        else:
            return {
                "response": "Error: AI service unavailable",
                "remaining_requests": remaining,
                "status": "error"
            }
            
    except HTTPException as e:
        raise e
    except Exception as e:
        return {
            "response": f"Error: {str(e)}",
            "remaining_requests": remaining,
            "status": "error"
        }

@app.get("/health")
async def health():
    return {
        "status": "OK", 
        "version": "1.0.0", 
        "tier": "open-source",
        "features": ["ai_chat", "rate_limiting", "self_hosted"],
        "rate_limit": "10 requests/hour"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to DevNest AI Open Source",
        "documentation": "https://github.com/your-username/devnest-ai",
        "endpoints": {
            "chat": "POST /chat",
            "health": "GET /health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)