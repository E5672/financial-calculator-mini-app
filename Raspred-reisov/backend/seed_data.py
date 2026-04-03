"""
Seed script — realistic Moscow-area test data.
Run: python seed_data.py
Or called automatically by main.py on first start.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime
from app.database import engine, SessionLocal, Base
from app.models.machine import Machine
from app.models.route import Route
from app.models.user import User


def run_seed(db=None):
    close_after = db is None
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

    try:
        now = datetime.utcnow()

        # ── USERS ────────────────────────────────────────────────────────────
        users = [
            User(name="Логист 1",     email="logist1@company.ru",    role="logist",     is_active=True),
            User(name="Логист 2",     email="logist2@company.ru",    role="logist",     is_active=True),
            User(name="Механик",      email="mechanic@company.ru",   role="mechanic",   is_active=True),
            User(name="Диспетчер",    email="dispatcher@company.ru", role="dispatcher", is_active=True),
        ]
        db.add_all(users)

        # ── MACHINES ─────────────────────────────────────────────────────────
        machines = [
            Machine(
                name="КАМАЗ-1", plate_number="А001АА797",
                status="available", capacity_tons=10.0,
                gps_lat=55.872, gps_lon=37.324,   # Химки
                accreditations=["mkad", "spb_zone"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="КАМАЗ-2", plate_number="В002ВВ797",
                status="available", capacity_tons=15.0,
                gps_lat=55.611, gps_lon=37.738,   # Котельники
                accreditations=["mkad"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="МАЗ-3", plate_number="С003СС797",
                status="available", capacity_tons=20.0,
                gps_lat=55.796, gps_lon=37.537,   # Ботанический сад
                accreditations=["mkad", "ttn_required"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="Газель-4", plate_number="Д004ДД797",
                status="available", capacity_tons=3.5,
                gps_lat=55.680, gps_lon=37.360,   # Солнцево
                accreditations=["mkad", "city_center"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="Скания-5", plate_number="Е005ЕЕ797",
                status="available", capacity_tons=25.0,
                gps_lat=55.920, gps_lon=37.810,   # Мытищи
                accreditations=["mkad", "spb_zone", "heavy_cargo"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="Вольво-6", plate_number="Ж006ЖЖ797",
                status="in_route", capacity_tons=20.0,
                gps_lat=55.750, gps_lon=37.620,   # Центр Москвы
                accreditations=["mkad"],
                restrictions=[],
                maintenance_status="available", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="МАН-7", plate_number="З007ЗЗ797",
                status="maintenance", capacity_tons=18.0,
                gps_lat=55.580, gps_lon=37.490,   # Бутово
                accreditations=["mkad", "ttn_required"],
                restrictions=[],
                maintenance_status="in_service", release_permission="allowed",
                version=1, created_at=now, updated_at=now,
            ),
            Machine(
                name="КАМАЗ-8", plate_number="И008ИИ797",
                status="available", capacity_tons=12.0,
                gps_lat=55.840, gps_lon=37.430,   # Тушино
                accreditations=["mkad"],
                restrictions=["no_night_rides"],
                maintenance_status="available",
                release_permission="forbidden",
                forbidden_reason="Требуется замена тормозных колодок",
                forbidden_by="Механик",
                forbidden_at=now,
                version=1, created_at=now, updated_at=now,
            ),
        ]
        db.add_all(machines)

        # ── ROUTES ───────────────────────────────────────────────────────────
        routes = [
            Route(
                name="Химки → Подольск",
                origin_name="Склад Химки", origin_lat=55.896, origin_lon=37.430,
                destination_name="База Подольск", destination_lat=55.431, destination_lon=37.544,
                distance_km=68.0, profit=45000, weight_tons=8.5,
                required_accreditations=["mkad"],
                priority=5, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Мытищи → Домодедово",
                origin_name="ТЦ Мытищи", origin_lat=55.920, origin_lon=37.739,
                destination_name="Склад Домодедово", destination_lat=55.444, destination_lon=37.900,
                distance_km=89.0, profit=62000, weight_tons=12.0,
                required_accreditations=["mkad"],
                priority=4, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Балашиха → Одинцово",
                origin_name="Завод Балашиха", origin_lat=55.794, origin_lon=37.959,
                destination_name="Склад Одинцово", destination_lat=55.678, destination_lon=37.279,
                distance_km=72.0, profit=38000, weight_tons=5.0,
                required_accreditations=["mkad"],
                priority=3, status="pending", source="manual",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Люберцы → Зеленоград",
                origin_name="Склад Люберцы", origin_lat=55.677, origin_lon=37.893,
                destination_name="База Зеленоград", destination_lat=55.992, destination_lon=37.196,
                distance_km=95.0, profit=71000, weight_tons=18.0,
                required_accreditations=["mkad", "ttn_required"],
                priority=5, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Бутово → Сергиев Посад",
                origin_name="Склад Бутово", origin_lat=55.553, origin_lon=37.569,
                destination_name="ТЦ Сергиев Посад", destination_lat=56.314, destination_lon=38.132,
                distance_km=112.0, profit=85000, weight_tons=22.0,
                required_accreditations=["mkad", "heavy_cargo"],
                priority=4, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Солнцево → Пушкино",
                origin_name="База Солнцево", origin_lat=55.651, origin_lon=37.354,
                destination_name="Склад Пушкино", destination_lat=56.010, destination_lon=37.865,
                distance_km=78.0, profit=42000, weight_tons=3.0,
                required_accreditations=["mkad", "city_center"],
                priority=2, status="pending", source="manual",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Тушино → Раменское",
                origin_name="Склад Тушино", origin_lat=55.830, origin_lon=37.384,
                destination_name="База Раменское", destination_lat=55.571, destination_lon=38.227,
                distance_km=94.0, profit=55000, weight_tons=9.0,
                required_accreditations=["mkad"],
                priority=3, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Котельники → Щёлково",
                origin_name="ТЦ Котельники", origin_lat=55.659, origin_lon=37.880,
                destination_name="Завод Щёлково", destination_lat=55.921, destination_lon=38.011,
                distance_km=61.0, profit=33000, weight_tons=7.0,
                required_accreditations=["mkad"],
                priority=2, status="pending", source="manual",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Химки → Электросталь",
                origin_name="Склад Химки", origin_lat=55.888, origin_lon=37.432,
                destination_name="Завод Электросталь", destination_lat=55.790, destination_lon=38.450,
                distance_km=82.0, profit=58000, weight_tons=14.0,
                required_accreditations=["mkad", "ttn_required"],
                priority=4, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Мытищи → Наро-Фоминск",
                origin_name="ТЦ Мытищи", origin_lat=55.914, origin_lon=37.740,
                destination_name="Склад Наро-Фоминск", destination_lat=55.389, destination_lon=36.730,
                distance_km=131.0, profit=96000, weight_tons=20.0,
                required_accreditations=["mkad", "heavy_cargo", "spb_zone"],
                priority=5, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Ботанический → Ногинск",
                origin_name="Склад Ботанический", origin_lat=55.817, origin_lon=37.681,
                destination_name="База Ногинск", destination_lat=55.850, destination_lon=38.440,
                distance_km=55.0, profit=28000, weight_tons=4.5,
                required_accreditations=["mkad"],
                priority=1, status="pending", source="manual",
                version=1, created_at=now, updated_at=now,
            ),
            Route(
                name="Одинцово → Балашиха (экспресс)",
                origin_name="База Одинцово", origin_lat=55.680, origin_lon=37.281,
                destination_name="Склад Балашиха", destination_lat=55.796, destination_lon=37.938,
                distance_km=66.0, profit=48000, weight_tons=6.0,
                required_accreditations=["mkad"],
                priority=3, status="pending", source="import",
                version=1, created_at=now, updated_at=now,
            ),
        ]
        db.add_all(routes)
        db.commit()
        print(f"✓ Seed OK: {len(users)} users, {len(machines)} machines, {len(routes)} routes")

    except Exception as e:
        db.rollback()
        print(f"✗ Seed failed: {e}")
        raise
    finally:
        if close_after:
            db.close()


if __name__ == "__main__":
    run_seed()
