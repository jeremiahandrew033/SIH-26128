import uuid

def test_create_animal_auto_code(client, authed_vet_client):
    f_res = client.post("/api/v1/farmers", json={"name": "Animal Test Farmer"})
    farmer_id = f_res.json()["id"]

    a_payload = {
        "farmer_id": farmer_id,
        "species": "Cattle",
        "breed": "Holstein",
        "sex": "Female",
        "approximate_age_years": 3.0
    }
    res = authed_vet_client.post("/api/v1/animals", json=a_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["species"] == "Cattle"
    assert data["animal_code"].startswith("COW-")

def test_duplicate_animal_code_rejection(client, authed_vet_client):
    f_res = client.post("/api/v1/farmers", json={"name": "Dup Test Farmer"})
    farmer_id = f_res.json()["id"]

    code = f"TEST-{uuid.uuid4().hex[:6].upper()}"
    a1 = authed_vet_client.post("/api/v1/animals", json={"farmer_id": farmer_id, "species": "Goat", "animal_code": code})
    assert a1.status_code == 201

    a2 = authed_vet_client.post("/api/v1/animals", json={"farmer_id": farmer_id, "species": "Goat", "animal_code": code})
    assert a2.status_code == 400
    assert "already exists" in a2.json()["detail"]
