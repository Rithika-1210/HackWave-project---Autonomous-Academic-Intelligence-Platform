import urllib.request
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/login',
    data=json.dumps({'email': 'admin@aaip.edu', 'password': 'Admin@2026!'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as r:
        data = json.loads(r.read().decode())
        print("LOGIN VERIFIED! User:", data['user']['full_name'], "| Role:", data['user']['role'], "| Token:", data['access_token'][:15] + "...")
except Exception as e:
    print("Login error:", e)
