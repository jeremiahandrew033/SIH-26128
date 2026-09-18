import io

def test_upload_attachment_validation(client):
    f_res = client.post("/api/v1/farmers", json={"name": "Attach Farmer"})
    farmer_id = f_res.json()["id"]

    a_res = client.post("/api/v1/animals", json={"farmer_id": farmer_id, "species": "Cattle"})
    animal_id = a_res.json()["id"]

    hr_res = client.post("/api/v1/health-reports", json={
        "farmer_id": farmer_id,
        "animal_id": animal_id,
        "report_type": "illness"
    })
    case_id = hr_res.json()["case_id"]

    # Valid JPEG image upload
    fake_image = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00")
    files = {"file": ("test_cow.jpg", fake_image, "image/jpeg")}

    res = client.post(f"/api/v1/health-reports/{case_id}/attachments", files=files)
    assert res.status_code == 201
    data = res.json()
    assert data["case_id"] == case_id
    assert "/uploads/" in data["file_path"]

def test_invalid_file_type_rejection(client):
    fake_txt = io.BytesIO(b"Hello text file")
    files = {"file": ("malicious.exe", fake_txt, "application/octet-stream")}

    res = client.post("/api/v1/health-reports/LIV-TEST-0001/attachments", files=files)
    assert res.status_code == 400
    assert "Invalid file type" in res.json()["detail"]
