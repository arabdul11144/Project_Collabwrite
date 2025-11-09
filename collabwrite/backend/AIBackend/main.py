from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Limit later for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GROQ API configuration
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

@app.post("/api/chat/")
async def chat(request: Request):
    data = await request.json()
    user_prompt = data.get("message", "")

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
    "model": "llama-3.1-8b-instant",  # Updated model
    "messages": [
        {"role": "system", "content": "You are a helpful AI writing assistant."},
        {"role": "user", "content": user_prompt},
    ],
}



        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response_data = response.json()

        # Debug: log full API response
        print("Groq API response:", response_data)

        # Check if response has choices
        if "choices" not in response_data:
            error_msg = response_data.get("error", {}).get("message", "Unknown Groq API error")
            return {"response": f"⚠️ Groq API error: {error_msg}"}

        ai_text = response_data["choices"][0]["message"]["content"]

    except Exception as e:
        ai_text = f"⚠️ Exception: {str(e)}"

    return {"response": ai_text}

