import os
import requests
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
# Set your Google API key
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
print("api="+ str(GOOGLE_API_KEY))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"]
)

@app.post("/summarize")
def summarize(text: dict):
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return {"error": "Google API key not set"}, 500

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    print(url)
    try:
        response = requests.post(url, json=text, timeout=30) # Add a 30-second timeout
        print(f"Received response from Google API - Status Code: {response.status_code}")
        print(f"Received response from Google API - Body: {response.text}")
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
        return response.json()
    except requests.exceptions.Timeout:
        print("Error: Google API request timed out after 30 seconds.")
        return {"error": "Google API request timed out"}, 504
    except requests.exceptions.RequestException as e:
        print(f"Error communicating with Google API: {e}")
        return {"error": f"Failed to communicate with Google API: {e}"}, 500

app.mount("/", StaticFiles(directory="C:/Users/RJ/LegalSummarizer/frontend", html=True), name="frontend")