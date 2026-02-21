def encrypt_otp(plaintext: bytes, key: bytes):
    if len(key) < len(plaintext):
        raise Exception(f"QKD key too short. Need {len(plaintext)}, got {len(key)}")
    return bytes([p ^ k for p, k in zip(plaintext, key)])

def decrypt_otp(ciphertext: bytes, key: bytes):
    return bytes([c ^ k for c, k in zip(ciphertext, key)])
