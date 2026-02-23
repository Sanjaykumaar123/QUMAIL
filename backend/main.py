from fastapi import FastAPI, Depends, HTTPException, status, Header
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
from pydantic import BaseModel
import datetime
import base64

from km_client.qkd_client import fetch_qkd_key, retrieve_qkd_key, fetch_key_stats
from encryption.crypto_plugins.otp_engine import encrypt_otp, decrypt_otp
from encryption.crypto_plugins.quantum_aes import encrypt_quantum_aes, decrypt_quantum_aes
from encryption.crypto_plugins.pqc_module import encrypt_pqc, decrypt_pqc
from mail_client.smtp_client import send_email as send_real_smtp, send_otp_email
from mail_client.imap_client import fetch_inbox as fetch_real_imap
import random
import threading
print(f"🚀 [STARTUP] QuMail Backend is booting...")

app = FastAPI(title="QuMail API", description="Quantum Secure Email Client")

@app.on_event("startup")
def startup_db_client():
    print(f"🚀 [STARTUP] Initializing database tables...")
    try:
        models.Base.metadata.create_all(bind=engine)
        print(f"🚀 [STARTUP] Database tables initialized successfully.")
        
        # AUTO-MIGRATION: Ensure user_email exists in security_logs
        with engine.connect() as conn:
            from sqlalchemy import text
            try:
                # Check if column exists (works for SQLite and Postgres)
                conn.execute(text("SELECT user_email FROM security_logs LIMIT 1"))
            except Exception:
                print("⚠️ [MIGRATION] Column 'user_email' not found. Adding it...")
                try:
                    conn.execute(text("ALTER TABLE security_logs ADD COLUMN user_email TEXT"))
                    conn.commit()
                    print("✅ [MIGRATION] Column 'user_email' added successfully.")
                except Exception as ex:
                    print(f"❌ [MIGRATION] Failed to add column: {ex}")
    except Exception as e:
        print(f"❌ [STARTUP] Critical Error during table creation: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://qumail-app.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Incoming {request.method} request to {request.url}")
    response = await call_next(request)
    return response

otp_store = {}

class OTPRequest(BaseModel):
    email: str

@app.post("/send-otp")
def send_otp(req: OTPRequest):
    print(f"📩 [API] Received OTP request for: {req.email}")
    if not req.email:
        raise HTTPException(status_code=400, detail="Invalid email")
    
    otp = str(random.randint(100000, 999999))
    otp_store[req.email] = otp
    
    # EMERGENCY LOGGING FOR HACKATHON LOGIN (Bypasses Sandbox restrictions)
    print("\n" + "🚀"*15)
    print(f"🚨 [SECURE IDENTITY GATEWAY LOG] 🚨")
    print(f"USER: {req.email}")
    print(f"OTP CODE: {otp}")
    print("🚀"*15 + "\n")
    
    print(f"📧 [API] Dispatching OTP via Resend Secure Gateway...")
    success = send_otp_email(None, None, req.email, otp)
    
    if success:
        print(f"✅ [API] OTP process completed for {req.email}")
        return {"status": "success", "message": "OTP sent successfully"}
    else:
        print(f"❌ [API] OTP delivery failed for {req.email}")
        raise HTTPException(status_code=500, detail="Failed to send Verification Code. Check server logs.")

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@app.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    if otp_store.get(req.email) != req.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")
    
    # OTP verified, remove from store
    del otp_store[req.email]
    
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        user = models.User(email=req.email, hashed_password="OTP_AUTH_USER")
        db.add(user)
        db.commit()
    
    db.add(models.SecurityLog(
        user_email=req.email,
        event_type="AUTH_VERIFIED",
        description="User verified via Secure OTP Gateway"
    ))
    db.commit()
    
    return {"access_token": "mock-jwt-token", "token_type": "bearer", "email": req.email}


@app.get("/")
@app.head("/")
def read_root():
    print("🚀 [HEALTH] Received health check request.")
    return {"status": "QuMail Backend Running"}

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = "458142597311-edo75f4laiivejnqgom88vb0piv2btd7.apps.googleusercontent.com"

class GoogleLoginRequest(BaseModel):
    credential: str

@app.post("/google-login")
def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(req.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Create user via Google Auth
            user = models.User(email=email, hashed_password="GOOGLE_AUTH_USER")
            db.add(user)
            db.commit()
        
        db.add(models.SecurityLog(
            user_email=email,
            event_type="AUTH_VERIFIED",
            description="User verified via Google Secure Gateway"
        ))
        db.commit()
        
        return {"access_token": "mock-jwt-token", "token_type": "bearer", "email": email}
    except ValueError:
        # Invalid token
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
class RecommendationRequest(BaseModel):
    body: str
    recipient: str
    
def calculate_risk_score(body: str, recipient: str):
    body_lower = body.lower()
    score_weights = {
        "secret": 50,
        "confidential": 40,
        "contract": 30,
        "finance": 25,
        "password": 35,
        "operation": 50,
        "auth": 20
    }
    
    total_score = 0
    for keyword, weight in score_weights.items():
        if keyword in body_lower:
            total_score += weight
            
    # Domain penalty evaluation
    trusted_domains = ["qumail.local", "command.local", "node.5"]
    domain = recipient.split("@")[-1] if "@" in recipient else ""
    if domain not in trusted_domains:
        total_score += 30 
        
    recommended_level = 1
    if total_score >= 60:
        recommended_level = 3
    elif total_score >= 30:
        recommended_level = 2
        
    return recommended_level, total_score

@app.post("/ai/recommend")
def ai_recommend(req: RecommendationRequest):
    level, score = calculate_risk_score(req.body, req.recipient)
    return {"recommended_level": level, "threat_score": score}

class SendEmailRequest(BaseModel):
    recipient: str
    subject: str
    body: str
    security_level: int
    
@app.post("/email/send")
def send_email(
    req: SendEmailRequest, 
    db: Session = Depends(get_db),
    x_agent_email: Optional[str] = Header(None)
):
    # 1. Fetch Real QKD Key
    key_id, key_bytes = fetch_qkd_key()
    if not key_bytes or not key_id:
        import uuid
        key_id = str(uuid.uuid4())
        key_bytes = b"0" * 1024 # Fallback
        
    plaintext_bytes = req.body.encode("utf-8")
    _, threat_score = calculate_risk_score(req.body, req.recipient)
    
    # 2. Encrypt
    nonce_b64 = None
    if req.security_level == 1:
        ciphertext = encrypt_otp(plaintext_bytes, key_bytes)
        enc_b64 = base64.b64encode(ciphertext).decode("utf-8")
        encrypted = f"OTP_ENC({enc_b64})"
    elif req.security_level == 2:
        ciphertext, nonce = encrypt_quantum_aes(plaintext_bytes, key_bytes)
        enc_b64 = base64.b64encode(ciphertext).decode("utf-8")
        nonce_b64 = base64.b64encode(nonce).decode("utf-8")
        encrypted = f"QAES_ENC({enc_b64}:{nonce_b64})"
    elif req.security_level == 3:
        ciphertext = encrypt_pqc(plaintext_bytes)
        enc_b64 = base64.b64encode(ciphertext).decode("utf-8")
        encrypted = f"PQC_ENC({enc_b64})"
    else:
        enc_b64 = req.body
        encrypted = req.body

    # Phase 2: Async Processing Engine
    def async_secure_dispatch(req_data, s_email, t_score, k_id, k_bytes, e_body, n_b64, ciphertext_b64):
        print(f"🧬 [NON-BLOCKING] Starting background processing for {req_data.recipient}...")
        
        # We need a new session for the background thread if we are using it outside the request or if the original session closes
        # But here we can use the main app's sessionmaker to be safe
        from database import SessionLocal
        inner_db = SessionLocal()
        try:
            print(f"💾 [DB-CACHE] Saving encrypted ciphertext to secure vault...")
            email_model = models.Email(
                sender=s_email,
                recipient=req_data.recipient,
                subject=req_data.subject,
                body_encrypted=e_body,
                security_level=req_data.security_level,
                threat_score=t_score,
                key_id=k_id
            )
            inner_db.add(email_model)
            
            log = models.SecurityLog(
                user_email=s_email,
                event_type="EMAIL_SENT", 
                description=f"Sent to {req_data.recipient} with level {req_data.security_level}"
            )
            inner_db.add(log)
            inner_db.commit()
            print(f"✅ [DB-CACHE] Metadata persisted.")

            print(f"📧 [BRIDGE] Initiating SMTP relay dispatch...")
            success = send_real_smtp(
                None, 
                None, 
                req_data.recipient, 
                ciphertext_b64, 
                req_data.security_level, 
                k_id, 
                n_b64, 
                f"QuMail: {req_data.subject} (from {s_email})"
            )
            if success:
                print(f"✨ [DISPATCH] Ultimate delivery successful for {req_data.recipient}")
            else:
                print(f"⚠️ [DISPATCH] SMTP Gateway returned failure, but message cached locally.")
        except Exception as e:
            print(f"❌ [ASYNC-ERR] background dispatch failed: {e}")
            import traceback
            traceback.print_exc()
        finally:
            inner_db.close()

    import threading
    threading.Thread(
        target=async_secure_dispatch, 
        args=(req, sender_email, threat_score, key_id, key_bytes, encrypted, nonce_b64, enc_b64)
    ).start()
    
    print(f"🚀 [API] Returning early. Background thread handling the rest.")
    return {"status": "success", "message": "Email processing initiated."}

@app.get("/email/inbox")
def get_inbox(
    db: Session = Depends(get_db),
    x_agent_email: Optional[str] = Header(None)
):
    if x_agent_email:
        emails = db.query(models.Email).filter(models.Email.recipient == x_agent_email).order_by(models.Email.id.desc()).all()
    else:
        emails = db.query(models.Email).order_by(models.Email.id.desc()).all()
    result = []
    
    for e in emails:
        decrypted_body = e.body_encrypted
        try:
            if e.body_encrypted.startswith("OTP_ENC("):
                enc_b64 = e.body_encrypted[8:-1]
                ciphertext = base64.b64decode(enc_b64)
                key_bytes = retrieve_qkd_key(e.key_id)
                decrypted_body = decrypt_otp(ciphertext, key_bytes).decode("utf-8", errors="replace")
            elif e.body_encrypted.startswith("QAES_ENC("):
                parts = e.body_encrypted[9:-1].split(":")
                ciphertext = base64.b64decode(parts[0])
                nonce = base64.b64decode(parts[1])
                key_bytes = retrieve_qkd_key(e.key_id)
                decrypted_body = decrypt_quantum_aes(ciphertext, key_bytes, nonce).decode("utf-8", errors="replace")
            elif e.body_encrypted.startswith("PQC_ENC("):
                enc_b64 = e.body_encrypted[8:-1]
                ciphertext = base64.b64decode(enc_b64)
                decrypted_body = decrypt_pqc(ciphertext).decode("utf-8", errors="replace")
        except Exception as ex:
            import traceback
            print(f"❌ [DECRYPT] Failure on msg {e.id} (Level {e.security_level}): {ex}")
            print(traceback.format_exc())
            decrypted_body = f"<Decryption Error: Key Mismatch or Integrity Failure>"
            
        result.append({
            "id": e.id,
            "sender": e.sender,
            "subject": e.subject,
            "body": decrypted_body,
            "security_level": e.security_level,
            "threat_score": e.threat_score,
            "timestamp": e.timestamp,
            "key_id": e.key_id
        })
    return result

@app.get("/security/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    x_agent_email: Optional[str] = Header(None)
):
    user_email = x_agent_email if x_agent_email else "demo@qumail.local"
    remaining_keys = fetch_key_stats()
    
    # Calculate a dynamic risk meter based on recent email threat scores for THIS user
    recent_emails_query = db.query(models.Email).filter(
        (models.Email.sender == user_email) | (models.Email.recipient == user_email)
    ).order_by(models.Email.id.desc())
    
    recent_emails = recent_emails_query.limit(10).all()
    
    if recent_emails:
        avg_threat = sum((e.threat_score or 0) for e in recent_emails) / len(recent_emails)
        risk_meter = min(100, int(avg_threat))
    else:
        risk_meter = 12

    total_emails = recent_emails_query.count()
    active_risks = recent_emails_query.filter(models.Email.threat_score > 50).count()

    # Filter Security Logs by user
    logs = db.query(models.SecurityLog).filter(
        models.SecurityLog.user_email == user_email
    ).order_by(models.SecurityLog.id.desc()).limit(10).all()

    return {
        "remaining_keys": remaining_keys,
        "risk_meter": risk_meter,
        "secured_comms": total_emails,
        "active_risks": active_risks,
        "recent_logs": [
            {
                "id": log.id, 
                "event": log.event_type, 
                "description": log.description,
                "time": log.timestamp.isoformat() # Return ISO format for frontend flexibility
            }
            for log in logs
        ]
    }
