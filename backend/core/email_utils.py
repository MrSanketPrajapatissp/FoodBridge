from django.core.mail import send_mail; from django.conf import settings

def send_email_logged(to, subject, body, EmailLog=None):
  try:
    send_mail(subject,body,settings.DEFAULT_FROM_EMAIL,[to],fail_silently=False)
    if EmailLog: EmailLog.objects.create(recipient_email=to,subject=subject,status='SENT')
    return True
  except Exception as e:
    if EmailLog: EmailLog.objects.create(recipient_email=to,subject=subject,status='FAILED',error_message=str(e))
    return False

def send_verification_email(user):
  token = user.generate_verification_token()
  url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
  return send_email_logged(user.email,"Verify your FoodBridge email",
    f"Hi {user.full_name},\n\nVerify here:\n{url}\n\nExpires in 24h.\n\n— FoodBridge")
