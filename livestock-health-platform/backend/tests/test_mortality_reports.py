def test_mortality_report_creation(client, authed_vet_client):
    f_res = client.post("/api/v1/farmers", json={"name": "Mortality Farmer"})
    farmer_id = f_res.json()["id"]

    a_res = authed_vet_client.post("/api/v1/animals", json={"farmer_id": farmer_id, "species": "Goat"})
    animal_id = a_res.json()["id"]

    m_payload = {
        "farmer_id": farmer_id,
        "animal_id": animal_id,
        "number_of_deaths": 1,
        "suspected_cause": "Bloat",
        "description": "Found dead in morning"
    }

    res = authed_vet_client.post("/api/v1/mortality-reports", json=m_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["case_id"].startswith("LIV-")
    assert "suspected mortality" in data["disclaimer"].lower()

def test_invalid_mortality_count_rejection(client, authed_vet_client):
    f_res = client.post("/api/v1/farmers", json={"name": "Zero Mortality Farmer"})
    farmer_id = f_res.json()["id"]

    res = authed_vet_client.post("/api/v1/mortality-reports", json={
        "farmer_id": farmer_id,
        "number_of_deaths": 0
    })
    assert res.status_code == 422 or res.status_code == 400
