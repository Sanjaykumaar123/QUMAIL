from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uuid
import base64
import os

app = FastAPI(title="QKD Key Management Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import json

DB_FILE = "keys_persistence.json"

def load_db():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r") as f:
                return json.load(f)
        except:
            return {}
    return {}

def save_db(db):
    try:
        with open(DB_FILE, "w") as f:
            json.dump(db, f)
    except Exception as e:
        print(f"Error saving DB: {e}")

# Store keys in memory and file to simulate retrieval capabilities within a cluster
keys_db = load_db()
remaining_keys = 4289 - len(keys_db)

@app.get("/keys/{slave_id}")
def get_key(slave_id: str, number: int = 1):
    global remaining_keys
    keys = []
    for _ in range(number):
        key_id = str(uuid.uuid4())
        # Provide larger key to accommodate OTP size matching requirement
        key_bytes = os.urandom(1024) 
        encoded_key = base64.b64encode(key_bytes).decode("utf-8")
        
        # Storing in simulated DB layer for decryption workflow fetching
        keys_db[key_id] = encoded_key
        remaining_keys -= 1
        
        save_db(keys_db)
        
        keys.append({
            "key_id": key_id,
            "key": encoded_key
        })
    
    if number == 1:
        return keys[0]
    return {"keys": keys}

@app.get("/keys/retrieve/{key_id}")
def retrieve_key(key_id: str):
    if key_id in keys_db:
        return {"key_id": key_id, "key": keys_db[key_id]}
    return {"error": "Key not found"}

@app.get("/stats")
def get_stats():
    return {"remaining_keys": remaining_keys}
