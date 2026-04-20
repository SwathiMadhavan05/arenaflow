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
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY not set")
    
    state = get_venue_state()
    context_prompt = build_system_prompt(state)
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {
            "parts": [{"text": context_prompt}]
        },
        "contents": [
             {"role": "user", "parts": [{"text": f"Fan Section: {req.fan_section}\nMessage: {req.message}"}]}
        ]
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=15.0)
            response.raise_for_status()
            data = response.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply, "context_used": context_prompt}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# Execute the static deployment matrix coupling the Vite distribution inherently into the backend runtime 
# This automatically handles the exact cross-origin deployment resolution for Google Cloud natively!
dist_dir = os.path.join(os.path.dirname(__file__), "../frontend/dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
