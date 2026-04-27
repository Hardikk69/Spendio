import os
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.from_phone = os.getenv('TWILIO_PHONE_NUMBER')
        
        self.is_configured = (
            self.account_sid and 
            self.account_sid != 'your_account_sid_here' and
            self.auth_token and 
            self.auth_token != 'your_auth_token_here' and
            self.from_phone and 
            self.from_phone != 'your_twilio_phone_number_here'
        )
        
        if self.is_configured:
            try:
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {str(e)}")
                self.is_configured = False
        else:
            logger.warning("Twilio not configured. SMS will print to console.")

    def send_otp(self, to_phone, code):
        message_body = f"Your Spendio verification code is: {code}. It expires in 10 minutes."
        
        if self.is_configured:
            try:
                message = self.client.messages.create(
                    body=message_body,
                    from_=self.from_phone,
                    to=to_phone
                )
                logger.info(f"SMS sent: {message.sid}")
                return True
            except Exception as e:
                logger.error(f"SMS error: {str(e)}")
                print(f"\nOTP for {to_phone}: {code}\n")
                return False
        else:
            print(f"\nOTP for {to_phone}: {code}\n")
            return True

sms_service = SMSService()
