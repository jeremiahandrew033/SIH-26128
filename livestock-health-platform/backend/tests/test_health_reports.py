def test_create_health_report_case_id(client):
    f_res = client.post("/api/v1/farmers", json={"name": "Health Test Farmer"})
    farmer_id = f_res.json()["id"]

    a_res = client.post("/api/v1/animals", json={"farmer_id": farmer_id, "species": "Cattle"})
    animal_id = a_res.json()["id"]

    hr_payload = {
        "farmer_id": farmer_id,
        "animal_id": animal_id,
        "report_type": "illness",
        "symptoms": ["Fever-like signs", "Reduced feeding"],
        "severity": "moderate",
        "description": "High temperature observed"
    }

    res = client.post("/api/v1/health-reports", json=hr_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["case_id"].startswith("LIV-")
    assert data["status"] == "reported"
    assert "Fever-like signs" in data["symptoms"]

    case_id = data["case_id"]
    fetch_res = client.get(f"/api/v1/health-reports/{case_id}")
    assert fetch_res.status_code == 200
    assert fetch_res.json()["case_id"] == case_id

def test_invalid_health_report_rejection(client):
    f_res = client.post("/api/v1/farmers", json={"name": "Rejection Farmer"})
    farmer_id = f_res.json()["id"]

    # Missing both animal_id and herd_id
    res = client.post("/api/v1/health-reports", json={
        "farmer_id": farmer_id,
        "report_type": "illness"
    })
    assert res.status_code == 400
