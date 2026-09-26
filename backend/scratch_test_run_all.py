import requests

auth = requests.post('http://127.0.0.1:8000/api/auth/login', json={'email':'admin@aaip.edu','password':'Admin@123'}).json()
token = auth['access_token']
headers = {'Authorization': f'Bearer {token}'}

res = requests.post('http://127.0.0.1:8000/api/ai/modules/run-all', headers=headers).json()
print("Execution Status:", res.get("status"))
print("Total Modules Executed:", res.get("total_modules"))
print("Successful Modules:", res.get("successful_modules"))
print("Overall Health Score:", res.get("overall_health_score"), "%")
print("Engine Used:", res.get("engine"))
print("Elapsed Time:", res.get("elapsed_seconds"), "s")
print("\nIndividual Module Reports:")
for m in res.get("modules", []):
    print(f"  [{m['status']}] {m['name']} -> {m['metric']} ({m['details']})")
