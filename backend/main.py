import os
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from simulator import get_venue_state, advance_phase
from predictor import predict_next_15min
from llm_context import build_system_prompt

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    fan_section: str

@app.get("/api/state")
def read_state():
    return get_venue_state()

@app.get("/api/predict")
def read_predict():
    return predict_next_15min(get_venue_state())

@app.get("/api/washrooms")
def read_washrooms():
    return get_venue_state().get("washrooms", {})

@app.get("/api/parking")
def read_parking():
    return get_venue_state().get("parking", {})

@app.get("/api/gates")
def read_gates():
    return get_venue_state().get("entry_gates", {})

@app.post("/api/advance-phase")
def post_advance_phase():
    return advance_phase()

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    api_key = os.getenv("GOOGLE_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")
    
    state = get_venue_state()
    context_prompt = build_system_prompt(state)
    
    models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite"]
    headers = {"x-goog-api-key": api_key}
    payload = {
        "systemInstruction": {
            "parts": [{"text": context_prompt}]
        },
        "contents": [
             {"role": "user", "parts": [{"text": f"Fan Section: {req.fan_section}\nMessage: {req.message}"}]}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        last_error = "Gemini request failed"
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            try:
                response = await client.post(url, json=payload, headers=headers, timeout=15.0)
                response.raise_for_status()
                data = response.json()
                reply = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"reply": reply, "context_used": context_prompt, "model": model}
            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code if e.response is not None else 500
                last_error = e.response.text if e.response is not None else "Gemini request failed"
                if status_code in (429, 503):
                    continue
                raise HTTPException(status_code=500, detail=f"Gemini request failed: {last_error}")
            except Exception as e:
                last_error = str(e)
                break

        raise HTTPException(status_code=503, detail=f"Gemini is temporarily unavailable: {last_error}")

# Execute the static deployment matrix coupling the Vite distribution inherently into the backend runtime 
# This automatically handles the exact cross-origin deployment resolution for Google Cloud natively!
dist_dir = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
