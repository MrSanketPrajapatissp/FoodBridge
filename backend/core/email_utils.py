from django.core.mail import send_mail; from django.conf import settings
from .models import EmailLog

def send_email_logged(to, subject, body):
  try:
    send_mail(subject,body,settings.DEFAULT_FROM_EMAIL,[to],fail_silently=False)
    EmailLog.objects.create(recipient_email=to,subject=subject,body=body,status='SENT')
    return True
  except Exception as e:
    print(f"[EMAIL ERROR] send_email_logged to {to}: {type(e).__name__}: {e}", flush=True)
    EmailLog.objects.create(recipient_email=to,subject=subject,body=body,status='FAILED',error_message=str(e))
    return False

def send_verification_email(user):
  token = user.generate_verification_token()
  url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
  
  html_body = f"""
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #059669; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">FoodBridge</h1>
    </div>
    <div style="padding: 30px; background-color: #ffffff;">
      <h2 style="color: #333333; margin-top: 0;">Verify Your Email Address</h2>
      <p style="color: #555555; line-height: 1.5;">Hi {user.full_name},</p>
      <p style="color: #555555; line-height: 1.5;">Welcome to FoodBridge! We're thrilled to have you join our mission to reduce food waste. To get started, please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="{url}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
      </div>
      <p style="color: #777777; font-size: 14px; line-height: 1.5;">Or copy and paste this link into your browser:<br>
      <a href="{url}" style="color: #059669;">{url}</a></p>
      <p style="color: #777777; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours.</p>
    </div>
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #888888; font-size: 12px; margin: 0;">&copy; 2026 FoodBridge. All rights reserved.</p>
    </div>
  </div>
  """
  
  text_body = f"Hi {user.full_name},\n\nVerify your FoodBridge account here:\n{url}\n\nExpires in 24h.\n\n— FoodBridge"
  
  try:
    print(f"\n========== VERIFICATION LINK ==========\n{url}\n=======================================\n")
    from django.core.mail import EmailMultiAlternatives
    msg = EmailMultiAlternatives("Verify your FoodBridge email", text_body, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)
    EmailLog.objects.create(recipient_email=user.email, subject="Verify your FoodBridge email", body=text_body, status='SENT')
    return True
  except Exception as e:
    print(f"[EMAIL ERROR] send_verification_email to {user.email}: {type(e).__name__}: {e}", flush=True)
    EmailLog.objects.create(recipient_email=user.email, subject="Verify your FoodBridge email", body=text_body, status='FAILED', error_message=str(e))
    return False

def send_admin_ngo_verification_email(user):
  """
  Send a professional HTML email to NGO when their account is verified.
  Called from: verify_email (auto-approve) and org_create (auto-approve) and admin_verify_ngo (manual).
  """
  org_name = user.organization.organization_name if hasattr(user, 'organization') else 'your organization'
  frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')

  html_body = f"""
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #059669; padding: 25px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px;">FoodBridge</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Food Rescue Platform</p>
    </div>
    
    <div style="padding: 35px; background-color: #ffffff;">
      <div style="background-color: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 25px;">
        <p style="font-size: 40px; margin: 0;">&#10003;</p>
        <h2 style="color: #059669; margin: 10px 0 5px 0;">NGO Profile Verified!</h2>
        <p style="color: #166534; margin: 0; font-size: 14px;">Your account is now fully activated</p>
      </div>

      <p style="color: #555555; line-height: 1.6; font-size: 15px;">Hi {user.full_name},</p>
      <p style="color: #555555; line-height: 1.6; font-size: 15px;">
        Congratulations! <strong>{org_name}</strong> has been officially verified on FoodBridge. 
        You are now ready to start claiming food donations from generous donors in your area.
      </p>

      <h3 style="color: #333; margin-top: 25px; font-size: 16px;">What you can do now:</h3>
      <ul style="color: #555555; line-height: 1.8; font-size: 14px; padding-left: 20px;">
        <li><strong>Browse available food</strong> — Find fresh donations near your location</li>
        <li><strong>Claim donations</strong> — Reserve food within your service radius</li>
        <li><strong>Get pickup codes</strong> — Coordinate with donors for food collection</li>
        <li><strong>Track your claims</strong> — View all your claimed food in one place</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{frontend_url}/donations" style="background-color: #059669; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
          Browse Available Food
        </a>
      </div>

      <p style="color: #888888; font-size: 13px; line-height: 1.5; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
        If you have any questions or face issues, contact us at support@foodbridge.org. 
        Thank you for joining our mission to reduce food waste!
      </p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #888888; font-size: 12px; margin: 0;">&copy; 2026 FoodBridge. Connecting food donors with verified NGOs.</p>
    </div>
  </div>
  """

  text_body = (
    f"Hi {user.full_name},\n\n"
    f"Congratulations! Your NGO \"{org_name}\" has been verified on FoodBridge.\n\n"
    f"You can now:\n"
    f"- Browse available food donations\n"
    f"- Claim food within your service radius\n"
    f"- Coordinate pickups with donors\n\n"
    f"Start browsing: {frontend_url}/donations\n\n"
    f"— The FoodBridge Team"
  )

  try:
    from django.core.mail import EmailMultiAlternatives
    subject = "Your NGO is Verified — Start Claiming Food on FoodBridge!"
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)
    EmailLog.objects.create(recipient_email=user.email, subject=subject, body=text_body, status='SENT')
    return True
  except Exception as e:
    print(f"[EMAIL ERROR] send_admin_ngo_verification_email to {user.email}: {type(e).__name__}: {e}", flush=True)
    EmailLog.objects.create(recipient_email=user.email, subject="NGO Verified", body=text_body, status='FAILED', error_message=str(e))
    return False

def send_admin_ngo_rejection_email(user, reason):
  return send_email_logged(user.email, "FoodBridge NGO Account Application Status",
    f"Hi {user.full_name},\n\nUnfortunately, your NGO application was rejected. Reason: {reason}")


def send_contact_exchange_email(to_email, to_name, role, food_title, otp_code,
                                 other_name, other_phone, other_email,
                                 pickup_address, distance_km):
  """
  Send a premium contact exchange email when a donation is claimed.
  
  - role='NGO'   -> NGO receives donor's contact + OTP
  - role='DONOR' -> Donor receives NGO's contact + pickup info
  """
  if role == 'NGO':
    subject = f'Donation Claimed — Contact Details for "{food_title}"'
    your_role = 'NGO'
    other_role = 'Donor'
    otp_section = f"""
      <div style="background-color: #059669; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <p style="margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Your Pickup OTP Code</p>
        <p style="margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">{otp_code}</p>
        <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Show this code to the donor at pickup</p>
      </div>
    """
  else:
    subject = f'Your Donation "{food_title}" Has Been Claimed'
    your_role = 'Donor'
    other_role = 'NGO'
    otp_section = f"""
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>The NGO will show you an OTP code at pickup.</strong>
          Enter it in your dashboard to confirm the handover.
        </p>
      </div>
    """

  distance_text = f"{distance_km} km away" if distance_km else "distance unknown"

  html_body = f"""
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #059669; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">FoodBridge</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 14px;">Food Rescue Platform</p>
    </div>
    
    <div style="padding: 30px; background-color: #ffffff;">
      <h2 style="color: #333333; margin-top: 0;">Hi {to_name},</h2>
      <p style="color: #555555; line-height: 1.6;">
        {'You have successfully claimed' if role == 'NGO' else 'Great news! Your donation'} 
        <strong>"{food_title}"</strong> 
        {'from a generous donor' if role == 'NGO' else 'has been claimed by an NGO'}.
      </p>

      {otp_section}

      <!-- Contact Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 16px;">{other_role} Contact Information</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; width: 80px;">Name</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 14px;">{other_name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; border-top: 1px solid #eee;">Phone</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 14px; border-top: 1px solid #eee;">
              <a href="tel:+91{other_phone}" style="color: #059669; text-decoration: none;">+91 {other_phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888; font-size: 13px; border-top: 1px solid #eee;">Email</td>
            <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 14px; border-top: 1px solid #eee;">
              <a href="mailto:{other_email}" style="color: #059669; text-decoration: none;">{other_email}</a>
            </td>
          </tr>
        </table>
      </div>

      <!-- Pickup Details -->
      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">Pickup Details</h4>
        <p style="color: #78350f; margin: 0; font-size: 13px; line-height: 1.5;">
          <strong>Address:</strong> {pickup_address}<br>
          <strong>Distance:</strong> {distance_text}
        </p>
      </div>

      <p style="color: #777777; font-size: 13px; line-height: 1.5; margin-top: 25px;">
        Please coordinate directly using the contact details above. 
        Remember to complete the OTP verification at pickup to confirm the handover.
      </p>
    </div>
    
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #888888; font-size: 12px; margin: 0;">&copy; 2026 FoodBridge. Connecting food donors with verified NGOs.</p>
    </div>
  </div>
  """

  text_body = (
    f"Hi {to_name},\n\n"
    f"{'You claimed' if role == 'NGO' else 'Your donation'} \"{food_title}\" {'from a donor' if role == 'NGO' else 'was claimed by an NGO'}.\n\n"
    f"{'OTP Code: ' + otp_code if role == 'NGO' else 'The NGO will show you an OTP at pickup.'}\n\n"
    f"{other_role} Contact:\n"
    f"  Name:  {other_name}\n"
    f"  Phone: +91 {other_phone}\n"
    f"  Email: {other_email}\n\n"
    f"Pickup: {pickup_address} ({distance_text})\n\n"
    f"— FoodBridge"
  )

  try:
    from django.core.mail import EmailMultiAlternatives
    msg = EmailMultiAlternatives(subject, text_body, settings.DEFAULT_FROM_EMAIL, [to_email])
    msg.attach_alternative(html_body, "text/html")
    msg.send(fail_silently=False)
    EmailLog.objects.create(recipient_email=to_email, subject=subject, body=text_body, status='SENT')
    return True
  except Exception as e:
    print(f"[EMAIL ERROR] send_contact_exchange_email to {to_email}: {type(e).__name__}: {e}", flush=True)
    EmailLog.objects.create(recipient_email=to_email, subject=subject, body=text_body, status='FAILED', error_message=str(e))
    return False
