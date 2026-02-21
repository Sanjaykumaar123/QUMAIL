def encrypt_pqc(plaintext: bytes, public_key: bytes = b'mock_pk'):
    # In a full deployment, map to liboqs Kyber512 encapsulation
    # For testing, applying wrapper overlay structure mimicking PQC encapsulation
    return b"PQC_HEADER:" + plaintext

def decrypt_pqc(ciphertext: bytes, private_key: bytes = b'mock_sk'):
    if ciphertext.startswith(b"PQC_HEADER:"):
        return ciphertext[len(b"PQC_HEADER:"):]
    return ciphertext
