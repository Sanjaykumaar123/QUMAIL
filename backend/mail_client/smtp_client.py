import requests
import json

RESEND_API_KEY = "re_UUat8Zs3_KELVt5f3QY3m9e8HAXn5Wd7f"
SENDER_EMAIL = "onboarding@resend.dev"

def send_email(sender_unused, password_unused, receiver, body, security_level, key_id, nonce=None, subject="QuMail Secure"):
    """
    Sends a secure email using the Resend API.
    Bypasses SMTP port blocks on Render/Vercel.
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
        "CLASSIFICATION: POST-QUANTUM SECURE\n"
        "STATUS: ENCRYPTED (ZERO-TRUST COMPLIANT)\n\n"
        "This communication is secured using Post-Quantum Cryptography.\n"
        "DECRYPT HERE: https://qumail-app.vercel.app/inbox\n\n"
        "================[ SECURE PAYLOAD ]================\n"
    )
    footer = "\n==================================================\n"
    full_body = header + formatted_json + footer

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "from": SENDER_EMAIL,
        "to": receiver,
        "subject": subject,
        "text": full_body
    }

    try:
        print(f"🚀 [RESEND] Dispatching secure email to {receiver} via API...")
        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code in [200, 201]:
            print(f"✅ [RESEND] Secure email delivered successfully (ID: {response.json().get('id')})")
            return True
        else:
            print(f"❌ [RESEND] API Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ [RESEND] Critical failure: {e}")
        return False

def send_otp_email(sender_unused, password_unused, receiver, otp):
    """
    Sends a verification code using the Resend API.
    """
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    body = f"Your QuMail Verification Code is: {otp}\n\nThis code expires in 10 minutes.\nIf you did not request this, please ignore this email."
    
    data = {
        "from": SENDER_EMAIL,
        "to": receiver,
        "subject": "QuMail Verification Code",
        "text": body
    }

    try:
        print(f"🔐 [RESEND] Dispatching OTP to {receiver} via API...")
        response = requests.post(url, headers=headers, json=data, timeout=10)
        if response.status_code in [200, 201]:
            print(f"✅ [RESEND] OTP delivered successfully (ID: {response.json().get('id')})")
            return True
        else:
            print(f"❌ [RESEND] API Error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ [RESEND] Critical failure: {e}")
        return False
