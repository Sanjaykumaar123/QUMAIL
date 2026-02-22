from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    recipient = Column(String, index=True)
    subject = Column(String)
    body_encrypted = Column(Text)
    security_level = Column(Integer, default=1)
    threat_score = Column(Integer, default=0)
    key_id = Column(String, nullable=True) # ID of the QKD key used
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SecurityLog(Base):
    __tablename__ = "security_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=True)
    event_type = Column(String)
    description = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SentMessage(Base):
    __tablename__ = "sent_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_email = Column(String, index=True)
    recipient_email = Column(String, index=True)
    subject = Column(String)
    security_level = Column(Integer)
    algorithm = Column(String)
    key_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
