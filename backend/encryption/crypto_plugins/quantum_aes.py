from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import hashlib
import os

def encrypt_quantum_aes(plaintext: bytes, qkd_key: bytes):
    aes_key = hashlib.sha256(qkd_key).digest()
    aesgcm = AESGCM(aes_key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)
    return ciphertext, nonce

def decrypt_quantum_aes(ciphertext: bytes, qkd_key: bytes, nonce: bytes):
    aes_key = hashlib.sha256(qkd_key).digest()
    aesgcm = AESGCM(aes_key)
    return aesgcm.decrypt(nonce, ciphertext, None)
