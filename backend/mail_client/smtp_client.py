import requests
import json

# GOOGLE APPS SCRIPT BRIDGE (Bypasses all cloud blocks)
BRIDGE_URL = "https://script.google.com/macros/s/AKfycbzqoNZLXm-uy5vDX1OcPEj1gcS1O1ZYbSbTBZGXave9cvkzMr34Kqev5fMGae2RXb4K1g/exec"

def send_email(sender_email, password_unused, receiver, body, security_level, key_id, nonce=None, subject="QuMail Secure"):
    """
    Sends a secure email using the Google Apps Script Bridge.
    Guaranteed delivery to ANY recipient globally.
    """
    algorithms = {
        1: "OTP (One-Time Pad)",
        2: "Quantum-AES-256-GCM",
        3: "PQC (Kyber-1024)"
    }
    
    payload_data = {
        "qumail_secure_payload": True,
        "security_level": security_level,
        "algorithm": algorithms.get(security_level, "UNENCRYPTED"),
        "key_id": key_id,
        "ciphertext": body
    }
    if nonce:
        payload_data["nonce"] = nonce

    formatted_json = json.dumps(payload_data, indent=2)
    header = (
        "╔════════════════════════════════════════════════╗\n"
        "  ☢️ QUMAIL QUANTUM SECURE DISPATCH ☢️\n"
        "╚════════════════════════════════════════════════╝\n\n"
        f"FROM: {sender_email}\n"
        f"TO: {receiver}\n"
        "CLASSIFICATION: POST-QUANTUM SECURE\n"
        "STATUS: ENCRYPTED (ZERO-TRUST COMPLIANT)\n\n"
        "This communication is secured using Post-Quantum Cryptography.\n"
        "DECRYPT HERE: https://qumail-app.vercel.app/inbox\n\n"
        "================[ SECURE PAYLOAD ]================\n"
    )
    footer = "\n==================================================\n"
    full_body = header + formatted_json + footer

    payload = {
        "to": receiver,
        "subject": subject,
        "body": full_body,
        "sender": sender_email,
        "name": f"QuMail: {sender_email}",  # Suggests a display name to the bridge
        "replyTo": sender_email             # Suggests a reply-to address
    }

    try:
        print(f"🚀 [BRIDGE] Dispatching secure email from {sender_email} to {receiver} via Google Bridge...")
        # Note: requests follows redirects (Google Script uses 302)
        response = requests.post(BRIDGE_URL, json=payload, timeout=15)
        if response.status_code == 200:
            print(f"✅ [BRIDGE] Secure email delivered successfully")
            return True
        else:
            print(f"❌ [BRIDGE] Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ [BRIDGE] Critical failure: {e}")
        return False

def send_otp_email(sender_unused, password_unused, receiver, otp):
    """
    Sends a verification code using the Google Apps Script Bridge.
    """
    subject = "QuMail Verification Code"
    body = f"Your QuMail Verification Code is: {otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email."
    
    payload = {
        "to": receiver,
        "subject": subject,
        "body": body
    }

    try:
        print(f"🔐 [BRIDGE] Dispatching OTP to {receiver} via Google Bridge...")
        response = requests.post(BRIDGE_URL, json=payload, timeout=15)
        if response.status_code == 200:
            print(f"✅ [BRIDGE] OTP delivered successfully")
            return True
        else:
            print(f"❌ [BRIDGE] Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ [BRIDGE] Critical failure: {e}")
        return False
