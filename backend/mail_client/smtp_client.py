import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import json
import uuid

def send_email(sender, password, receiver, body, security_level, key_id, nonce=None, subject="QuMail Secure"):
    msg = MIMEMultipart()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = receiver

    algorithms = {
        1: "OTP (One-Time Pad)",
        2: "Quantum-AES-256-GCM",
        3: "PQC (Kyber-1024)"
    }
    
    # Format the encrypted payload as JSON to ensure structural preservation over standard SMTP
    payload = {
        "qumail_secure_payload": True,
        "security_level": security_level,
        "algorithm": algorithms.get(security_level, "UNENCRYPTED"),
        "key_id": key_id,
        "ciphertext": body
    }
    
    if nonce:
        payload["nonce"] = nonce

    formatted_json = json.dumps(payload, indent=2)
    
    header = (
        "🔐 QuMail Secure Message\n"
        "This email is quantum-encrypted.\n"
        "Open in QuMail to decrypt.\n\n"
        "--- ENCRYPTED PAYLOAD ---\n"
    )
    
    formatted_body = header + formatted_json

    msg.attach(MIMEText(formatted_body, 'plain'))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
            return True
    except Exception as e:
        print(f"Failed to send actual email: {e}")
        return False

def send_otp_email(sender, password, receiver, otp):
    msg = MIMEMultipart()
    msg['Subject'] = "QuMail Verification Code"
    msg['From'] = sender
    msg['To'] = receiver

    body = f"Your QuMail Verification Code is {otp}.\nPlease enter this securely to proceed."
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender, password)
            server.send_message(msg)
            return True
    except Exception as e:
        print(f"Failed to send OTP: {e}")
        return False
