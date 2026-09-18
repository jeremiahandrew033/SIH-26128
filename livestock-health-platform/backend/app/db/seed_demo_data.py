"""
Seed Script for Phase 1 Demo Data
AI-Enabled Livestock Health, Disease Surveillance & Management Platform

Populates 3 Farmers, 4 Herds, 10 Animals, 6 Health Reports, 2 Mortality Reports,
8 Vaccination Records, and 5 Treatment Records tagged clearly as DEMO DATA.
Supports optional --reset flag to purge old demo records before seeding.
"""

import sys
import os
import uuid
import json
import datetime
import argparse

# Ensure root path is accessible
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.db.database import db_repo

def seed(reset: bool = False):
    print(f"[Seed] Seeding Phase 1 DEMO DATA into database (Reset={reset})...")
    conn = db_repo.get_connection()
    cursor = conn.cursor()

    if reset:
        print("[Seed] Resetting existing demo data...")
        tables = ["health_reports", "mortality_reports", "vaccinations", "treatments", "animals", "herds", "farmers", "locations"]
        for tbl in tables:
            cursor.execute(f"DELETE FROM {tbl}")
        conn.commit()

    now = datetime.datetime.utcnow().isoformat()

    # 1. Locations
    loc1_id = "loc11111-1111-1111-1111-111111111111"
    loc2_id = "loc22222-2222-2222-2222-222222222222"
    loc3_id = "loc33333-3333-3333-3333-333333333333"

    locations_data = [
        (loc1_id, 17.4833, 78.2167, 12.5, "Rampur", "Amberpet", "Hyderabad", now, now),
        (loc2_id, 17.3984, 78.5583, 10.0, "Lakshmipur", "Uppal", "Hyderabad", now, now),
        (loc3_id, 17.4486, 78.3908, 15.0, "Madhapur", "Serilingampally", "Hyderabad", now, now)
    ]

    for loc in locations_data:
        cursor.execute("""
            INSERT OR REPLACE INTO locations (id, latitude, longitude, accuracy_meters, village, block, district, captured_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, loc)

    # 2. Farmers (3 Farmers as per specification)
    farmer1_id = "f1111111-1111-1111-1111-111111111111"
    farmer2_id = "f2222222-2222-2222-2222-222222222222"
    farmer3_id = "f3333333-3333-3333-3333-333333333333"

    farmers_data = [
        (farmer1_id, "Ravi Kumar", "+919876543210", "en", "Rampur", "Amberpet", "Hyderabad", now),
        (farmer2_id, "Suresh Reddy", "+919876543211", "te", "Lakshmipur", "Uppal", "Hyderabad", now),
        (farmer3_id, "Anitha Devi", "+919876543212", "hi", "Madhapur", "Serilingampally", "Hyderabad", now)
    ]

    for f in farmers_data:
        cursor.execute("""
            INSERT OR REPLACE INTO farmers (id, name, phone, preferred_language, village, block, district, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, f)

    # 3. Herds (4 Herds)
    herd1_id = "h1111111-1111-1111-1111-111111111111"
    herd2_id = "h2222222-2222-2222-2222-222222222222"
    herd3_id = "h3333333-3333-3333-3333-333333333333"
    herd4_id = "h4444444-4444-4444-4444-444444444444"

    herds_data = [
        (herd1_id, farmer1_id, "Rampur Cattle Dairy Herd A", "Cattle", 4, "Rampur", "Amberpet", "Hyderabad", now, now),
        (herd2_id, farmer1_id, "Rampur Goat Unit", "Goat", 3, "Rampur", "Amberpet", "Hyderabad", now, now),
        (herd3_id, farmer2_id, "Lakshmipur Buffalo Unit", "Buffalo", 2, "Lakshmipur", "Uppal", "Hyderabad", now, now),
        (herd4_id, farmer3_id, "Madhapur Sheep & Goat Unit", "Sheep", 1, "Madhapur", "Serilingampally", "Hyderabad", now, now)
    ]

    for h in herds_data:
        cursor.execute("""
            INSERT OR REPLACE INTO herds (id, farmer_id, name, species, animal_count, village, block, district, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, h)

    # 4. Animals (10 Animals as per spec: COW-0001, COW-0002, COW-0003, COW-0004, BUF-0001, BUF-0002, GOAT-0001, GOAT-0002, GOAT-0003, SHP-0001)
    a1_id = "a1111111-1111-1111-1111-111111111111"
    a2_id = "a2222222-2222-2222-2222-222222222222"
    a3_id = "a3333333-3333-3333-3333-333333333333"
    a4_id = "a4444444-4444-4444-4444-444444444444"
    a5_id = "a5555555-5555-5555-5555-555555555555"
    a6_id = "a6666666-6666-6666-6666-666666666666"
    a7_id = "a7777777-7777-7777-7777-777777777777"
    a8_id = "a8888888-8888-8888-8888-888888888888"
    a9_id = "a9999999-9999-9999-9999-999999999999"
    a10_id = "a1010101-1010-1010-1010-101010101010"

    animals_data = [
        (a1_id, farmer1_id, herd1_id, "COW-0001", "Cattle", "Holstein Friesian", "Female", "2023-03-15", 3.0, "Black & White", "Tag #401", now, now),
        (a2_id, farmer1_id, herd1_id, "COW-0002", "Cattle", "Gir", "Female", "2022-06-10", 4.0, "Reddish Brown", "Left horn curved", now, now),
        (a3_id, farmer1_id, herd1_id, "COW-0003", "Cattle", "Sahiwal", "Male", "2024-01-20", 2.0, "Light Brown", "Bull calf", now, now),
        (a4_id, farmer1_id, herd1_id, "COW-0004", "Cattle", "Crossbreed", "Female", "2021-08-05", 5.0, "White", "Tag #404", now, now),
        (a5_id, farmer2_id, herd3_id, "BUF-0001", "Buffalo", "Murrah", "Female", "2021-11-11", 5.0, "Jet Black", "Ring horns", now, now),
        (a6_id, farmer2_id, herd3_id, "BUF-0002", "Buffalo", "Nili-Ravi", "Female", "2022-04-18", 4.0, "Black with white forehead", "Wall eyes", now, now),
        (a7_id, farmer1_id, herd2_id, "GOAT-0001", "Goat", "Osmanabadi", "Female", "2024-05-12", 2.0, "Black", "Bearded ewe", now, now),
        (a8_id, farmer1_id, herd2_id, "GOAT-0002", "Goat", "Black Bengal", "Male", "2024-02-01", 1.5, "Dark Grey", "Young buck", now, now),
        (a9_id, farmer1_id, herd2_id, "GOAT-0003", "Goat", "Jamnapari", "Female", "2023-09-09", 2.5, "White & Brown", "Long ears", now, now),
        (a10_id, farmer3_id, herd4_id, "SHP-0001", "Sheep", "Deccani", "Female", "2023-11-30", 2.0, "Black Face", "Polled ewe", now, now)
    ]

    for a in animals_data:
        cursor.execute("""
            INSERT OR REPLACE INTO animals (id, farmer_id, herd_id, animal_code, species, breed, sex, date_of_birth, approximate_age_years, color, identification_notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, a)

    # 5. Health Reports (6 Health Reports as per spec)
    h1_case = "LIV-2026-000101"
    h2_case = "LIV-2026-000102"
    h3_case = "LIV-2026-000103"
    h4_case = "LIV-2026-000104"
    h5_case = "LIV-2026-000105"
    h6_case = "LIV-2026-000106"

    reports_data = [
        (str(uuid.uuid4()), h1_case, farmer1_id, a2_id, herd1_id, "illness", "Reduced feeding and skin lesions noticed on back and neck.", json.dumps(["Reduced feeding", "Skin lesions"]), "2 days", "moderate", loc1_id, "reported", now, now),
        (str(uuid.uuid4()), h2_case, farmer1_id, a1_id, herd1_id, "abnormal_behavior", "Cow showing abnormal behavior and agitation during milking.", json.dumps(["Abnormal behavior"]), "1 day", "mild", loc1_id, "under_review", now, now),
        (str(uuid.uuid4()), h3_case, farmer2_id, a5_id, herd3_id, "illness", "Buffalo walking with visible stiffness and lameness in left hind leg.", json.dumps(["Lameness"]), "3 days", "moderate", loc2_id, "reported", now, now),
        (str(uuid.uuid4()), h4_case, farmer1_id, a8_id, herd2_id, "illness", "Young goat exhibiting lethargy and weakness.", json.dumps(["Weakness"]), "2 days", "mild", loc1_id, "closed", now, now),
        (str(uuid.uuid4()), h5_case, farmer1_id, a3_id, herd1_id, "illness", "Bull calf coughing continuously and showing mild nasal discharge.", json.dumps(["Coughing", "Nasal discharge"]), "4 days", "moderate", loc1_id, "reported", now, now),
        (str(uuid.uuid4()), h6_case, farmer1_id, a9_id, herd2_id, "illness", "Goat off feed since yesterday morning.", json.dumps(["Reduced feeding"]), "1 day", "mild", loc1_id, "closed", now, now)
    ]

    for r in reports_data:
        cursor.execute("""
            INSERT OR REPLACE INTO health_reports (id, case_id, farmer_id, animal_id, herd_id, report_type, description, symptoms, duration_text, severity, location_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, r)

    # 6. Mortality Reports (2 Mortality Reports as per spec)
    m1_case = "MORT-2026-00001"
    m2_case = "MORT-2026-00002"

    mortality_data = [
        (str(uuid.uuid4()), m1_case, farmer1_id, None, herd2_id, 2, "Sudden weakness", "Two goats in Rampur goat unit collapsed suddenly.", loc1_id, "reported", now, now),
        (str(uuid.uuid4()), m2_case, farmer2_id, a6_id, herd3_id, 1, "Severe bloat", "One buffalo calf died in Lakshmipur after acute digestive swelling.", loc2_id, "closed", now, now)
    ]

    for m in mortality_data:
        cursor.execute("""
            INSERT OR REPLACE INTO mortality_reports (id, case_id, farmer_id, animal_id, herd_id, number_of_deaths, suspected_cause, description, location_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, m)

    # 7. Vaccinations (8+ Vaccination records as per spec)
    vaccinations_data = [
        (str(uuid.uuid4()), a1_id, herd1_id, farmer1_id, "FMD Vaccine", "2025-10-01", "FMD-2025-B4", "2026-04-01", "Government Veterinary Clinic", "Annual FMD booster dose", now, now),
        (str(uuid.uuid4()), a2_id, herd1_id, farmer1_id, "LSD Vaccine", "2025-11-15", "LSD-994", "2026-11-15", "Dr. Sharma", "Lumpy Skin Disease preventive dose", now, now),
        (str(uuid.uuid4()), a3_id, herd1_id, farmer1_id, "HS Vaccine", "2025-08-20", "HS-882", "2026-08-20", "Government Veterinary Clinic", "Haemorrhagic Septicaemia vaccination", now, now),
        (str(uuid.uuid4()), a4_id, herd1_id, farmer1_id, "FMD Vaccine", "2025-10-01", "FMD-2025-B4", "2026-04-01", "Government Veterinary Clinic", "Routine booster", now, now),
        (str(uuid.uuid4()), a5_id, herd3_id, farmer2_id, "FMD Vaccine", "2025-09-10", "FMD-2025-B2", "2026-03-10", "Uppal Mobile Vet Unit", "Buffalo herd vaccination campaign", now, now),
        (str(uuid.uuid4()), a6_id, herd3_id, farmer2_id, "HS Vaccine", "2025-09-10", "HS-771", "2026-09-10", "Uppal Mobile Vet Unit", "Routine immunisation", now, now),
        (str(uuid.uuid4()), a7_id, herd2_id, farmer1_id, "PPR Vaccine", "2025-06-05", "PPR-303", "2027-06-05", "Rampur Veterinary Dispensary", "Peste des Petits Ruminants vaccine", now, now),
        (str(uuid.uuid4()), a10_id, herd4_id, farmer3_id, "PPR Vaccine", "2025-07-12", "PPR-404", "2027-07-12", "Serilingampally Vet Officer", "Sheep PPR vaccination", now, now)
    ]

    for v in vaccinations_data:
        cursor.execute("""
            INSERT OR REPLACE INTO vaccinations (id, animal_id, herd_id, farmer_id, vaccine_name, vaccination_date, batch_number, next_due_date, provider, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, v)

    # 8. Treatments (5 Treatment records as per spec)
    treatments_data = [
        (str(uuid.uuid4()), a1_id, herd1_id, farmer1_id, "Supportive care", "2026-01-10", "Single dose", "Dr. Sharma", "Dehydration prevention and electrolyte rest", now, now),
        (str(uuid.uuid4()), a2_id, herd1_id, farmer1_id, "Wound care", "2026-02-01", "Topical spray", "Rampur Vet Assistant", "Cleaned and disinfected skin lesions", now, now),
        (str(uuid.uuid4()), a5_id, herd3_id, farmer2_id, "Mineral supplementation", "2026-01-18", "Oral bolus", "Uppal Vet Clinic", "Calcium and vitamin bolus administered", now, now),
        (str(uuid.uuid4()), a7_id, herd2_id, farmer1_id, "Supportive care", "2026-02-14", "Oral liquid", "Rampur Vet Assistant", "Oral rehydration solution given", now, now),
        (str(uuid.uuid4()), a10_id, herd4_id, farmer3_id, "Wound care", "2026-02-20", "Topical ointment", "Serilingampally Vet Officer", "Minor hoof cleansing and antiseptic application", now, now)
    ]

    for t in treatments_data:
        cursor.execute("""
            INSERT OR REPLACE INTO treatments (id, animal_id, herd_id, farmer_id, treatment_name, treatment_date, dosage, provider, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, t)

    conn.commit()
    conn.close()
    print("[Seed] Phase 1 DEMO DATA seeded successfully!")
    print("       • Farmers: 3 (Ravi Kumar, Suresh Reddy, Anitha Devi)")
    print("       • Herds: 4 | Animals: 10")
    print("       • Health Cases: 6 | Mortality Cases: 2")
    print("       • Vaccinations: 8 | Treatments: 5")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed demo data for Livestock Health Platform")
    parser.add_argument("--reset", action="store_true", help="Purge existing records before seeding")
    args = parser.parse_args()
    seed(reset=args.reset)
