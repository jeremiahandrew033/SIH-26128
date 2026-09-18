def test_create_and_get_farmer(client):
    payload = {
        "name": "Test Farmer",
        "phone": "+919998887770",
        "preferred_language": "en",
        "village": "Test Village",
        "block": "Test Block",
        "district": "Test District"
    }
    res = client.post("/api/v1/farmers", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["name"] == "Test Farmer"
    assert "id" in data

    farmer_id = data["id"]
    get_res = client.get(f"/api/v1/farmers/{farmer_id}")
    assert get_res.status_code == 200
    assert get_res.json()["phone"] == "+919998887770"
