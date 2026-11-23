"""
TrueTone & Passport Studio — Admin Client License Generator
Run this script to issue client activation IDs for your buyers.
"""

import sys
import time
import ctypes

SECRET_SALT = 'APP_ACCESS_TOKEN_SALT_2026_SECURE'

PLANS = {
    '1': ('1_month', '1M', '1 Month Access', 30),
    '2': ('3_months', '3M', '3 Months Access', 90),
    '3': ('6_months', '6M', '6 Months Access', 180),
    '4': ('1_year', '1Y', '1 Year Access', 365),
    '5': ('lifetime', 'LIFE', 'Lifetime Access', 0),
}

def imul(a, b):
    return ctypes.c_int32(ctypes.c_int32(a).value * ctypes.c_int32(b).value).value

def compute_signature(payload: str) -> str:
    h1 = ctypes.c_int32(0xdeadbeef).value
    h2 = ctypes.c_int32(0x41c6ce57).value
    full_str = SECRET_SALT + payload + SECRET_SALT
    for ch in full_str:
        c = ord(ch)
        h1 = imul(h1 ^ c, 2654435761)
        h2 = imul(h2 ^ c, 1597334677)

    u_h1 = ctypes.c_uint32(h1).value
    u_h2 = ctypes.c_uint32(h2).value

    step1_a = imul(h1 ^ (u_h1 >> 16), 2246822507)
    step1_b = imul(h2 ^ (u_h2 >> 13), 3266489909)
    res_h1 = step1_a ^ step1_b

    step2_a = imul(h2 ^ (u_h2 >> 16), 2246822507)
    step2_b = imul(h1 ^ (u_h1 >> 13), 3266489909)
    res_h2 = step2_a ^ step2_b

    p1 = f"{ctypes.c_uint32(res_h1).value:08x}"
    p2 = f"{ctypes.c_uint32(res_h2).value:08x}"
    return (p1 + p2)[:8].upper()

def generate_key(client_email: str, plan_choice: str, client_name: str = ""):
    if plan_choice not in PLANS:
        print("Invalid plan choice.")
        return

    plan_id, code, title, days = PLANS[plan_choice]
    normalized_email = client_email.strip().lower()

    if '@' in normalized_email:
        prefix = normalized_email.split('@')[0]
        clean_prefix = ''.join(c for c in prefix.upper() if c.isalnum())[:4] or 'USER'
        email_hash = compute_signature('EM:' + normalized_email)[:4]
        client_tag = f"{clean_prefix}{email_hash}"
    else:
        client_tag = ''.join(c for c in normalized_email.upper() if c.isalnum())[:8] or 'CLIENT'

    now_days = int(time.time() // 86400)
    expiry_days = 0 if days == 0 else now_days + days

    payload = f"{code}-{client_tag}-{expiry_days}"
    sig = compute_signature(f"{payload}:{normalized_email}")
    license_key = f"TT-{payload}-{sig}"

    expiry_label = "Never (Lifetime)" if days == 0 else f"{days} Days"
    name_display = client_name.strip() or normalized_email

    print("\n" + "=" * 65)
    print("🎉 Client License Generated Successfully!")
    print("=" * 65)
    print(f"📧 User ID (Email) : {normalized_email}")
    print(f"👤 Client Name     : {name_display}")
    print(f"📦 Plan            : {title}")
    print(f"⏳ Validity        : {expiry_label}")
    print(f"🔑 License Key     : {license_key}")
    print("=" * 65)
    print("\n📱 WhatsApp Customer Delivery Message:")
    print("-" * 65)
    print(
        f"🎉 *TrueTone & Passport Studio Pro Activated!*\n\n"
        f"👤 *Client Name:* {name_display}\n"
        f"📧 *User ID (Email):* {normalized_email}\n"
        f"📦 *Plan:* {title}\n"
        f"🔑 *License Key:* `{license_key}`\n\n"
        f"👉 *How to access:* Open the website, enter your Email ID and License Key to unlock full studio access.\n"
        f"Thank you for subscribing!"
    )
    print("-" * 65 + "\n")

if __name__ == '__main__':
    print("=" * 65)
    print("🔑 TrueTone & Passport Studio — Admin License Generator")
    print("=" * 65)
    email = input("Enter Client Email ID (User ID): ").strip()
    if not email:
        print("Email is required.")
        sys.exit(1)
    name = input("Enter Client Name / Remarks (Optional): ").strip()
    print("\nSelect Subscription Plan:")
    print("  [1] 1 Month Access (30 Days)")
    print("  [2] 3 Months Access (90 Days)")
    print("  [3] 6 Months Access (180 Days)")
    print("  [4] 1 Year Access (365 Days)")
    print("  [5] Lifetime Access (Never Expires)")
    choice = input("Enter Choice (1-5) [default 4]: ").strip() or "4"
    generate_key(email, choice, name)
