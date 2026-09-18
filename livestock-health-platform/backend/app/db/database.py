import os
import sqlite3
import uuid
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger("livestock-platform.db")

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "livestock_phase1.db"))

class DatabaseRepository:
    def __init__(self):
        self.db_path = DB_PATH
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.executescript("""
        CREATE TABLE IF NOT EXISTS farmers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT,
            preferred_language TEXT DEFAULT 'en',
            village TEXT,
            block TEXT,
            district TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS herds (
            id TEXT PRIMARY KEY,
            farmer_id TEXT NOT NULL,
            name TEXT,
            species TEXT,
            animal_count INTEGER DEFAULT 0,
            village TEXT,
            block TEXT,
            district TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS animals (
            id TEXT PRIMARY KEY,
            farmer_id TEXT NOT NULL,
            herd_id TEXT,
            animal_code TEXT UNIQUE NOT NULL,
            species TEXT NOT NULL,
            breed TEXT,
            sex TEXT,
            date_of_birth TEXT,
            approximate_age_years REAL,
            color TEXT,
            identification_notes TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS locations (
            id TEXT PRIMARY KEY,
            latitude REAL,
            longitude REAL,
            accuracy_meters REAL,
            village TEXT,
            block TEXT,
            district TEXT,
            captured_at TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS health_reports (
            id TEXT PRIMARY KEY,
            case_id TEXT UNIQUE NOT NULL,
            farmer_id TEXT NOT NULL,
            animal_id TEXT,
            herd_id TEXT,
            report_type TEXT NOT NULL,
            description TEXT,
            symptoms TEXT DEFAULT '[]',
            duration_text TEXT,
            severity TEXT,
            location_id TEXT,
            status TEXT DEFAULT 'reported',
            client_tx_id TEXT,
            ai_prediction TEXT,
            ai_confidence REAL,
            ai_risk_level TEXT,
            ai_model_version TEXT,
            ai_processed_at TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS mortality_reports (
            id TEXT PRIMARY KEY,
            case_id TEXT UNIQUE NOT NULL,
            farmer_id TEXT NOT NULL,
            animal_id TEXT,
            herd_id TEXT,
            number_of_deaths INTEGER NOT NULL,
            suspected_cause TEXT,
            description TEXT,
            location_id TEXT,
            status TEXT DEFAULT 'reported',
            client_tx_id TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS vaccinations (
            id TEXT PRIMARY KEY,
            animal_id TEXT,
            herd_id TEXT,
            farmer_id TEXT NOT NULL,
            vaccine_name TEXT NOT NULL,
            vaccination_date TEXT,
            batch_number TEXT,
            next_due_date TEXT,
            provider TEXT,
            notes TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS treatments (
            id TEXT PRIMARY KEY,
            animal_id TEXT,
            herd_id TEXT,
            farmer_id TEXT NOT NULL,
            treatment_name TEXT NOT NULL,
            treatment_date TEXT,
            dosage TEXT,
            provider TEXT,
            notes TEXT,
            created_at TEXT,
            updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS case_attachments (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            uploaded_at TEXT,
            created_at TEXT
        );

        CREATE TABLE IF NOT EXISTS ivr_call_logs (
            id TEXT PRIMARY KEY,
            phone_number TEXT NOT NULL,
            farmer_id TEXT,
            call_type TEXT,
            menu_selection INTEGER,
            case_id TEXT,
            status TEXT,
            duration_seconds INTEGER,
            created_at TEXT
        );
        """)
        
        # Schema migration checks for existing DB files
        try:
            cursor.execute("ALTER TABLE health_reports ADD COLUMN client_tx_id TEXT;")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE mortality_reports ADD COLUMN client_tx_id TEXT;")
        except Exception:
            pass
        for col, col_type in [("ai_prediction", "TEXT"), ("ai_confidence", "REAL"), ("ai_risk_level", "TEXT"), ("ai_model_version", "TEXT"), ("ai_processed_at", "TEXT")]:
            try:
                cursor.execute(f"ALTER TABLE health_reports ADD COLUMN {col} {col_type};")
            except Exception:
                pass
        
        # Phase 2 IVR schema extensions
        for table in ["health_reports", "mortality_reports"]:
            for col, col_type, default_val in [("source", "TEXT", "'APP'"), ("priority", "TEXT", "'NORMAL'"), ("caller_phone", "TEXT", "NULL")]:
                try:
                    cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type} DEFAULT {default_val};")
                except Exception:
                    pass

        conn.commit()
        conn.close()
        logger.info(f"Database initialized persistently at {self.db_path}")

db_repo = DatabaseRepository()
