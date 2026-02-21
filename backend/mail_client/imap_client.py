import imaplib
import email
import json

def fetch_inbox(user, password):
    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com")
        mail.login(user, password)
        mail.select("inbox")
        
        # Fetching latest 5 emails as an example
        result, data = mail.search(None, "ALL")
        mail_ids = data[0].split()[-5:]
        emails = []
        for i in mail_ids:
            typ, msg_data = mail.fetch(i, '(RFC822)')
            for response_part in msg_data:
                if isinstance(response_part, tuple):
                    msg = email.message_from_bytes(response_part[1])
                    subject = msg['subject']
                    sender = msg['from']
                    # Simplified body fetch
                    body = ""
                    if msg.is_multipart():
                        for part in msg.walk():
                            if part.get_content_type() == "text/plain":
                                body = part.get_payload(decode=True).decode()
                                break
                    else:
                        body = msg.get_payload(decode=True).decode()
                        
                    # Safely handle QuMail structured JSON envelopes
                    try:
                        structured = json.loads(body)
                        if structured.get("qumail_secure_payload"):
                            body = structured["ciphertext"]
                        else:
                            body = "RAW_UNENCRYPTED_GMAIL_MESSAGE:\n" + body
                    except:
                         body = "RAW_UNENCRYPTED_GMAIL_MESSAGE:\n" + body
                        
                    emails.append({"subject": subject, "sender": sender, "body": body})
        return emails
    except Exception as e:
        print(f"Failed to fetch real email: {e}")
        return []
