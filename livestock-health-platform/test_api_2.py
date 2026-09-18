import httpx
import json

payload = {
    "farmer_id": "123",
    "report_type": "illness",
}

try:
    response = httpx.post("http://localhost:8000/api/v1/health-reports", json=payload)
    print("STATUS:", response.status_code)
    print("BODY:", response.text)
except Exception as e:
    print("ERROR:", e)
