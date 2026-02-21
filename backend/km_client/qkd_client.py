import requests
import base64

def fetch_qkd_key(slave_id="slave1"):
    try:
        response = requests.get(f"http://localhost:8001/keys/{slave_id}?number=1", timeout=3)
        data = response.json()
        key_id = data.get("key_id")
        key_b64 = data.get("key")
        key_bytes = base64.b64decode(key_b64)
        return key_id, key_bytes
    except Exception as e:
        print(f"Error fetching QKD key: {e}")
        return None, None
        
def retrieve_qkd_key(key_id):
    try:
        response = requests.get(f"http://localhost:8001/keys/retrieve/{key_id}", timeout=3)
        data = response.json()
        if "key" in data:
            return base64.b64decode(data["key"])
    except Exception as e:
        print(f"Error retrieving QKD key {key_id}: {e}")
    return b"\x00" * 1024 # Fallback

def fetch_key_stats():
    try:
        response = requests.get("http://localhost:8001/stats", timeout=3)
        return response.json().get("remaining_keys", 4289)
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return 4289
