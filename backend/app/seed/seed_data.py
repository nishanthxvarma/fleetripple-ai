from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    Operator,
    Vehicle,
    Trip,
    Booking,
    BreakdownIncident,
    RecoveryPlan,
    ConsolidationProposal,
    OperatorAgreement,
    PassengerOffer,
    RefundRequest,
    AuditEvent
)

def seed_database(db: Session, force: bool = False):
    """
    Deterministic seed operation.
    Seeds the database with required demonstration entities if empty,
    or resets if force=True.
    """
    if force:
        # Clear existing tables in reverse dependency order
        db.query(AuditEvent).delete()
        db.query(RefundRequest).delete()
        db.query(PassengerOffer).delete()
        db.query(OperatorAgreement).delete()
        db.query(ConsolidationProposal).delete()
        db.query(RecoveryPlan).delete()
        db.query(BreakdownIncident).delete()
        db.query(Booking).delete()
        db.query(Trip).delete()
        db.query(Vehicle).delete()
        db.query(Operator).delete()
        db.commit()
    else:
        # Check if already seeded
        if db.query(Operator).count() > 0:
            return

    # 1. Operators
    operators = [
        Operator(id="OP-1", name="Apex Express", code="APEX", contact="+91 891 254 9011", rating=4.8, fleet_size=12, status="active"),
        Operator(id="OP-2", name="Coastal Cruiser", code="CSTL", contact="+91 891 278 4422", rating=4.7, fleet_size=10, status="active"),
        Operator(id="OP-3", name="Southern Starline", code="STHN", contact="+91 866 243 8810", rating=4.9, fleet_size=14, status="active"),
        Operator(id="OP-4", name="Eastern Intercity", code="ESTN", contact="+91 884 233 1900", rating=4.5, fleet_size=8, status="active"),
    ]
    db.add_all(operators)
    db.commit()

    # 2. Vehicles
    vehicles = [
        Vehicle(
            id="BUS-101",
            reg_number="AP 31 TX 4010",
            operator_id="OP-1",
            operator_name="Apex Express",
            model="Volvo 9600 Multi-Axle Luxury",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=35,
            available_seats=5,
            status="Breakdown",
            location="Anakapalle Toll Plaza (NH-16, Km 34)",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-101",
            is_available=False,
            departure_time="17:30",
            arrival_time="23:45",
            active_incident_id="INC-2026-081"
        ),
        Vehicle(
            id="BUS-102",
            reg_number="AP 39 UB 2024",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            model="Scania Metrolink HD Intercity",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=25,
            available_seats=15,
            status="Active",
            location="Sankaram Junction (8 km north of BUS-101)",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-102",
            is_available=True,
            departure_time="17:50",
            arrival_time="00:05",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-103",
            reg_number="AP 16 CZ 8840",
            operator_id="OP-3",
            operator_name="Southern Starline",
            model="BharatBenz Sleeper Coach",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=20,
            available_seats=20,
            status="Active",
            location="Gajuwaka Highway (14 km north of BUS-101)",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-103",
            is_available=True,
            departure_time="18:10",
            arrival_time="00:25",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-104",
            reg_number="AP 05 YD 1902",
            operator_id="OP-4",
            operator_name="Eastern Intercity",
            model="Tata Marcopolo Intercity 2+2",
            route="Visakhapatnam to Kakinada",
            route_id="RT-VIZ-COA",
            capacity=40,
            confirmed_bookings=30,
            available_seats=10,
            status="Active",
            location="Anakapalle Flyover (4 km from BUS-101)",
            direction="Southwest towards Kakinada / Yanam",
            current_trip_id="TRIP-104",
            is_available=True,
            departure_time="17:40",
            arrival_time="21:30",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-201",
            reg_number="AP 31 BR 5501",
            operator_id="OP-1",
            operator_name="Apex Express",
            model="Ashok Leyland 12M Oyster Air-Suspension",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=12,
            available_seats=28,
            status="Underbooked",
            location="Dwaraka Bus Station, Visakhapatnam",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-201",
            is_available=True,
            departure_time="18:00",
            arrival_time="00:15",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-202",
            reg_number="AP 39 EF 7720",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            model="Volvo B11R 13.7m Multi-Axle Club Class",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=15,
            available_seats=25,
            status="Underbooked",
            location="Dwaraka Bus Station, Visakhapatnam",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-202",
            is_available=True,
            departure_time="18:15",
            arrival_time="00:30",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-301",
            reg_number="TS 09 UA 3311",
            operator_id="OP-3",
            operator_name="Southern Starline",
            model="Volvo 9400 B8R",
            route="Vijayawada to Hyderabad",
            route_id="RT-BZA-HYD",
            capacity=44,
            confirmed_bookings=38,
            available_seats=6,
            status="Active",
            location="Pandit Nehru Bus Station, Vijayawada",
            direction="Westbound to Hyderabad",
            current_trip_id="TRIP-301",
            is_available=True,
            departure_time="20:00",
            arrival_time="02:30",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-302",
            reg_number="AP 05 EF 1199",
            operator_id="OP-4",
            operator_name="Eastern Intercity",
            model="Eicher 20.15 Skyline Pro",
            route="Rajahmundry to Vijayawada",
            route_id="RT-RJY-BZA",
            capacity=36,
            confirmed_bookings=30,
            available_seats=6,
            status="Active",
            location="Morampudi Junction, Rajahmundry",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-302",
            is_available=True,
            departure_time="19:15",
            arrival_time="22:45",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-303",
            reg_number="AP 31 CC 8821",
            operator_id="OP-1",
            operator_name="Apex Express",
            model="Volvo B8R Coach",
            route="Visakhapatnam to Guntur",
            route_id="RT-VIZ-GNT",
            capacity=40,
            confirmed_bookings=28,
            available_seats=12,
            status="Active",
            location="Gajuwaka Junction, Visakhapatnam",
            direction="Southbound to Guntur",
            current_trip_id="TRIP-303",
            is_available=True,
            departure_time="18:30",
            arrival_time="01:15",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-304",
            reg_number="AP 39 ZQ 9044",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            model="Scania Metrolink",
            route="Visakhapatnam to Vijayawada",
            route_id="RT-VIZ-BZA",
            capacity=40,
            confirmed_bookings=32,
            available_seats=8,
            status="Active",
            location="Tuni Bypass, NH-16",
            direction="Southbound to Vijayawada",
            current_trip_id="TRIP-304",
            is_available=True,
            departure_time="16:45",
            arrival_time="23:00",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-401",
            reg_number="AP 16 MM 5560",
            operator_id="OP-3",
            operator_name="Southern Starline",
            model="Mercedes-Benz SHD",
            route="Vijayawada to Visakhapatnam",
            route_id="RT-BZA-VIZ",
            capacity=40,
            confirmed_bookings=22,
            available_seats=18,
            status="Active",
            location="Eluru Bypass Highway",
            direction="Northbound to Visakhapatnam",
            current_trip_id="TRIP-401",
            is_available=True,
            departure_time="17:00",
            arrival_time="23:30",
            active_incident_id=None
        ),
        Vehicle(
            id="BUS-STBY-01",
            reg_number="AP 31 ST 0099",
            operator_id="OP-1",
            operator_name="Apex Express",
            model="Force Traveller Shuttle / Minibus",
            route="Rajahmundry to Vijayawada Corridor",
            route_id="RT-STBY-RELIEF",
            capacity=20,
            confirmed_bookings=0,
            available_seats=20,
            status="Standby Reserve",
            location="Apex Depot, Rajahmundry (Km 185)",
            direction="Regional Standby Relief",
            current_trip_id=None,
            is_available=True,
            departure_time="On Demand",
            arrival_time="On Demand",
            active_incident_id=None
        ),
    ]
    db.add_all(vehicles)
    db.commit()

    # 3. Trips
    trips = [
        Trip(
            id="TRIP-101",
            operator_id="OP-1",
            operator_name="Apex Express",
            vehicle_id="BUS-101",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Anakapalle", "Tuni", "Rajahmundry", "Eluru", "Vijayawada"],
            departure_time="17:30",
            arrival_time="23:45",
            status="Disrupted (Breakdown)",
            scheduled_capacity=40,
            confirmed_bookings=35,
            occupancy_percent=87.5,
            est_operating_cost=19500.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-102",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            vehicle_id="BUS-102",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Anakapalle", "Tuni", "Rajahmundry", "Eluru", "Vijayawada"],
            departure_time="17:50",
            arrival_time="00:05",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=25,
            occupancy_percent=62.5,
            est_operating_cost=18800.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-103",
            operator_id="OP-3",
            operator_name="Southern Starline",
            vehicle_id="BUS-103",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Anakapalle", "Tuni", "Rajahmundry", "Eluru", "Vijayawada"],
            departure_time="18:10",
            arrival_time="00:25",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=20,
            occupancy_percent=50.0,
            est_operating_cost=19200.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-104",
            operator_id="OP-4",
            operator_name="Eastern Intercity",
            vehicle_id="BUS-104",
            route_name="Visakhapatnam to Kakinada",
            origin="Visakhapatnam",
            destination="Kakinada",
            stops=["Visakhapatnam", "Anakapalle", "Kathipudi", "Kakinada"],
            departure_time="17:40",
            arrival_time="21:30",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=30,
            occupancy_percent=75.0,
            est_operating_cost=14500.0,
            route_corridor="NH-16 to Kakinada Spur"
        ),
        Trip(
            id="TRIP-201",
            operator_id="OP-1",
            operator_name="Apex Express",
            vehicle_id="BUS-201",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Anakapalle", "Tuni", "Rajahmundry", "Eluru", "Vijayawada"],
            departure_time="18:00",
            arrival_time="00:15",
            status="Underbooked (Eligible for Merge)",
            scheduled_capacity=40,
            confirmed_bookings=12,
            occupancy_percent=30.0,
            est_operating_cost=18000.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-202",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            vehicle_id="BUS-202",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Anakapalle", "Tuni", "Rajahmundry", "Eluru", "Vijayawada"],
            departure_time="18:15",
            arrival_time="00:30",
            status="Underbooked (Eligible for Merge)",
            scheduled_capacity=40,
            confirmed_bookings=15,
            occupancy_percent=37.5,
            est_operating_cost=18500.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-301",
            operator_id="OP-3",
            operator_name="Southern Starline",
            vehicle_id="BUS-301",
            route_name="Vijayawada to Hyderabad",
            origin="Vijayawada",
            destination="Hyderabad",
            stops=["Vijayawada", "Suryapet", "Hyderabad"],
            departure_time="20:00",
            arrival_time="02:30",
            status="Scheduled",
            scheduled_capacity=44,
            confirmed_bookings=38,
            occupancy_percent=86.4,
            est_operating_cost=21000.0,
            route_corridor="NH-65 Highway"
        ),
        Trip(
            id="TRIP-302",
            operator_id="OP-4",
            operator_name="Eastern Intercity",
            vehicle_id="BUS-302",
            route_name="Rajahmundry to Vijayawada",
            origin="Rajahmundry",
            destination="Vijayawada",
            stops=["Rajahmundry", "Tanuku", "Eluru", "Vijayawada"],
            departure_time="19:15",
            arrival_time="22:45",
            status="Scheduled",
            scheduled_capacity=36,
            confirmed_bookings=30,
            occupancy_percent=83.3,
            est_operating_cost=13500.0,
            route_corridor="Godavari Bypass Corridor"
        ),
        Trip(
            id="TRIP-303",
            operator_id="OP-1",
            operator_name="Apex Express",
            vehicle_id="BUS-303",
            route_name="Visakhapatnam to Guntur",
            origin="Visakhapatnam",
            destination="Guntur",
            stops=["Visakhapatnam", "Rajahmundry", "Vijayawada", "Guntur"],
            departure_time="18:30",
            arrival_time="01:15",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=28,
            occupancy_percent=70.0,
            est_operating_cost=19800.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-304",
            operator_id="OP-2",
            operator_name="Coastal Cruiser",
            vehicle_id="BUS-304",
            route_name="Visakhapatnam to Vijayawada",
            origin="Visakhapatnam",
            destination="Vijayawada",
            stops=["Visakhapatnam", "Tuni", "Rajahmundry", "Vijayawada"],
            departure_time="16:45",
            arrival_time="23:00",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=32,
            occupancy_percent=80.0,
            est_operating_cost=18600.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
        Trip(
            id="TRIP-401",
            operator_id="OP-3",
            operator_name="Southern Starline",
            vehicle_id="BUS-401",
            route_name="Vijayawada to Visakhapatnam",
            origin="Vijayawada",
            destination="Visakhapatnam",
            stops=["Vijayawada", "Eluru", "Rajahmundry", "Tuni", "Visakhapatnam"],
            departure_time="17:00",
            arrival_time="23:30",
            status="Scheduled",
            scheduled_capacity=40,
            confirmed_bookings=22,
            occupancy_percent=55.0,
            est_operating_cost=18900.0,
            route_corridor="NH-16 Coastal Corridor"
        ),
    ]
    db.add_all(trips)
    db.commit()

    # 4. Bookings for BUS-101 / TRIP-101 (35 passengers across 18 bookings)
    bookings_trip101 = [
        Booking(id="BKG-101-01", trip_id="TRIP-101", lead_passenger="Kavita Reddy", passenger_count=2, phone="+91 98480 12345", seat_numbers=["12A", "12B"], boarding_point="Visakhapatnam (RTC Complex)", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-02", trip_id="TRIP-101", lead_passenger="Ramesh Verma", passenger_count=3, phone="+91 94401 56789", seat_numbers=["14A", "14B", "14C"], boarding_point="Anakapalle", destination="Vijayawada", fare=2400.0, status="unassigned"),
        Booking(id="BKG-101-03", trip_id="TRIP-101", lead_passenger="Sneha Nair", passenger_count=1, phone="+91 98852 98765", seat_numbers=["04A"], boarding_point="Visakhapatnam", destination="Eluru", fare=750.0, status="unassigned"),
        Booking(id="BKG-101-04", trip_id="TRIP-101", lead_passenger="Deepak Chawla", passenger_count=2, phone="+91 97012 34567", seat_numbers=["06A", "06B"], boarding_point="Visakhapatnam", destination="Rajahmundry", fare=1300.0, status="unassigned"),
        Booking(id="BKG-101-05", trip_id="TRIP-101", lead_passenger="Pooja Sundaram", passenger_count=2, phone="+91 99590 11223", seat_numbers=["08A", "08B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-06", trip_id="TRIP-101", lead_passenger="Arjun Rao", passenger_count=1, phone="+91 96181 33445", seat_numbers=["09A"], boarding_point="Anakapalle", destination="Vijayawada", fare=800.0, status="unassigned"),
        Booking(id="BKG-101-07", trip_id="TRIP-101", lead_passenger="Venkatesh Prasad", passenger_count=2, phone="+91 94902 44556", seat_numbers=["10A", "10B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-08", trip_id="TRIP-101", lead_passenger="Meera Kulkarni", passenger_count=2, phone="+91 98495 66778", seat_numbers=["11A", "11B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-09", trip_id="TRIP-101", lead_passenger="Kishore Babji", passenger_count=1, phone="+91 99890 77889", seat_numbers=["15A"], boarding_point="Visakhapatnam", destination="Eluru", fare=750.0, status="unassigned"),
        Booking(id="BKG-101-10", trip_id="TRIP-101", lead_passenger="Sunil Satyanarayana", passenger_count=3, phone="+91 93910 88990", seat_numbers=["16A", "16B", "16C"], boarding_point="Anakapalle", destination="Vijayawada", fare=2400.0, status="unassigned"),
        Booking(id="BKG-101-11", trip_id="TRIP-101", lead_passenger="Ananya Banerjee", passenger_count=2, phone="+91 91771 99001", seat_numbers=["18A", "18B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-12", trip_id="TRIP-101", lead_passenger="Prasad Raju", passenger_count=2, phone="+91 96522 12121", seat_numbers=["20A", "20B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-13", trip_id="TRIP-101", lead_passenger="Swathi Krishna", passenger_count=2, phone="+91 97033 23232", seat_numbers=["22A", "22B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-14", trip_id="TRIP-101", lead_passenger="Nageswara Rao", passenger_count=3, phone="+91 98488 34343", seat_numbers=["24A", "24B", "24C"], boarding_point="Anakapalle", destination="Vijayawada", fare=2400.0, status="unassigned"),
        Booking(id="BKG-101-15", trip_id="TRIP-101", lead_passenger="Divya Madhav", passenger_count=2, phone="+91 94411 45454", seat_numbers=["26A", "26B"], boarding_point="Visakhapatnam", destination="Rajahmundry", fare=1300.0, status="unassigned"),
        Booking(id="BKG-101-16", trip_id="TRIP-101", lead_passenger="Srikanth Reddy", passenger_count=2, phone="+91 99499 56565", seat_numbers=["28A", "28B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
        Booking(id="BKG-101-17", trip_id="TRIP-101", lead_passenger="Haritha Devi", passenger_count=1, phone="+91 96030 67676", seat_numbers=["30A"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=825.0, status="unassigned"),
        Booking(id="BKG-101-18", trip_id="TRIP-101", lead_passenger="Chandrasekhar V", passenger_count=2, phone="+91 98661 78787", seat_numbers=["32A", "32B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1650.0, status="unassigned"),
    ]

    # Bookings for TRIP-201 (12 passengers across 6 bookings)
    bookings_trip201 = [
        Booking(id="BKG-201-01", trip_id="TRIP-201", lead_passenger="Vikramaditya Roy", passenger_count=2, phone="+91 98480 33001", seat_numbers=["04A", "04B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1700.0, status="confirmed"),
        Booking(id="BKG-201-02", trip_id="TRIP-201", lead_passenger="Geetha Lakshmi", passenger_count=3, phone="+91 94401 33002", seat_numbers=["06A", "06B", "06C"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=2550.0, status="confirmed"),
        Booking(id="BKG-201-03", trip_id="TRIP-201", lead_passenger="Tarun Tej", passenger_count=1, phone="+91 98852 33003", seat_numbers=["08A"], boarding_point="Visakhapatnam", destination="Rajahmundry", fare=650.0, status="confirmed"),
        Booking(id="BKG-201-04", trip_id="TRIP-201", lead_passenger="Padmavathi K", passenger_count=2, phone="+91 97012 33004", seat_numbers=["10A", "10B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1700.0, status="confirmed"),
        Booking(id="BKG-201-05", trip_id="TRIP-201", lead_passenger="Suresh Naidu", passenger_count=2, phone="+91 99590 33005", seat_numbers=["12A", "12B"], boarding_point="Visakhapatnam", destination="Eluru", fare=1500.0, status="confirmed"),
        Booking(id="BKG-201-06", trip_id="TRIP-201", lead_passenger="Bhavani Shankar", passenger_count=2, phone="+91 96181 33006", seat_numbers=["14A", "14B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1700.0, status="confirmed"),
    ]

    # Bookings for TRIP-202 (15 passengers across 7 bookings)
    bookings_trip202 = [
        Booking(id="BKG-202-01", trip_id="TRIP-202", lead_passenger="Rajeshwari Devi", passenger_count=2, phone="+91 98480 44001", seat_numbers=["05A", "05B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1750.0, status="confirmed"),
        Booking(id="BKG-202-02", trip_id="TRIP-202", lead_passenger="Karthik Subbaraj", passenger_count=2, phone="+91 94401 44002", seat_numbers=["07A", "07B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1750.0, status="confirmed"),
        Booking(id="BKG-202-03", trip_id="TRIP-202", lead_passenger="Lavanya Tripathi", passenger_count=3, phone="+91 98852 44003", seat_numbers=["09A", "09B", "09C"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=2625.0, status="confirmed"),
        Booking(id="BKG-202-04", trip_id="TRIP-202", lead_passenger="Mohan Krishna", passenger_count=2, phone="+91 97012 44004", seat_numbers=["11A", "11B"], boarding_point="Visakhapatnam", destination="Rajahmundry", fare=1350.0, status="confirmed"),
        Booking(id="BKG-202-05", trip_id="TRIP-202", lead_passenger="Sravani Kondapalli", passenger_count=2, phone="+91 99590 44005", seat_numbers=["15A", "15B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1750.0, status="confirmed"),
        Booking(id="BKG-202-06", trip_id="TRIP-202", lead_passenger="Gopalakrishna G", passenger_count=2, phone="+91 96181 44006", seat_numbers=["17A", "17B"], boarding_point="Visakhapatnam", destination="Eluru", fare=1500.0, status="confirmed"),
        Booking(id="BKG-202-07", trip_id="TRIP-202", lead_passenger="Usha Rani", passenger_count=2, phone="+91 94902 44007", seat_numbers=["19A", "19B"], boarding_point="Visakhapatnam", destination="Vijayawada", fare=1750.0, status="confirmed"),
    ]

    db.add_all(bookings_trip101 + bookings_trip201 + bookings_trip202)
    db.commit()

    # 5. Incident
    incident = BreakdownIncident(
        id="INC-2026-081",
        trip_id="TRIP-101",
        vehicle_id="BUS-101",
        route="Visakhapatnam to Vijayawada",
        stage="En Route",
        location="Anakapalle Toll Plaza (NH-16, Km 34)",
        reported_time="18:14 IST",
        affected_passengers=35,
        description="Engine coolant manifold rupture causing thermal shutdown. Vehicle stranded on NH-16 southbound shoulder.",
        status="reported",
        resolution_summary=None
    )
    db.add(incident)
    db.commit()

    # 6. Consolidation Proposal
    financials = {
        "grossOperatingSavings": 16300.0,
        "originalCombinedCost": 36500.0,
        "originalTrip1Cost": 18000.0,
        "originalTrip2Cost": 18500.0,
        "consolidatedTripCost": 20200.0,
        "platformBrokerageFee": 800.0,
        "apexTransferPayment": 6000.0,
        "apexNetSavings": 11600.0,
        "coastalNetBenefit": 3900.0,
        "netEcosystemBenefit": 15500.0
    }

    proposal = ConsolidationProposal(
        id="PROP-2026-402",
        participating_trip_ids=["TRIP-201", "TRIP-202"],
        participating_operator_ids=["OP-1", "OP-2"],
        replacement_vehicle_id="BUS-202",
        replacement_capacity=40,
        combined_passenger_demand=27,
        status="draft",
        version=1,
        viability_threshold_percent=70.0,
        financials=financials,
        departure_time="18:15",
        route="Visakhapatnam to Vijayawada via NH-16",
        projected_occupancy_percent=67.5
    )
    db.add(proposal)
    db.commit()

    # 7. Operator Agreements
    agreements = [
        OperatorAgreement(
            id="AGR-402-OP1",
            proposal_id="PROP-2026-402",
            operator_id="OP-1",
            proposal_version=1,
            status="pending",
            notes="Under evaluation by Apex Operations Directorate",
            responded_at=None
        ),
        OperatorAgreement(
            id="AGR-402-OP2",
            proposal_id="PROP-2026-402",
            operator_id="OP-2",
            proposal_version=1,
            status="pending",
            notes="Under review by Coastal Cruiser Fleet Manager",
            responded_at=None
        ),
    ]
    db.add_all(agreements)
    db.commit()

    # 8. Initial Audit Logs
    audit_events = [
        AuditEvent(
            id="LOG-0001",
            timestamp="18:14:02 IST",
            event_type="INCIDENT",
            actor="Apex Telemetry Hub",
            description="Breakdown reported for BUS-101 on TRIP-101. 35 passengers stranded at Anakapalle Toll Plaza.",
            badge_color="rose",
            entity_type="incident",
            entity_id="INC-2026-081"
        ),
        AuditEvent(
            id="LOG-0002",
            timestamp="18:14:20 IST",
            event_type="CORRIDOR",
            actor="RippleOps Sentinel",
            description="NH-16 Vizag-Vijayawada corridor monitoring alert: Vehicle incident logged with 35 affected passengers.",
            badge_color="amber",
            entity_type="corridor",
            entity_id="NH-16"
        ),
        AuditEvent(
            id="LOG-0003",
            timestamp="18:14:35 IST",
            event_type="BROKERAGE",
            actor="TripMerge Guardian",
            description="Detected low-load trips TRIP-201 (30%) & TRIP-202 (37.5%). Prepared draft consolidation proposal PROP-2026-402.",
            badge_color="indigo",
            entity_type="proposal",
            entity_id="PROP-2026-402"
        ),
        AuditEvent(
            id="LOG-0004",
            timestamp="18:15:00 IST",
            event_type="SYSTEM",
            actor="FleetRipple Database Initializer",
            description="Persistent operational database seeded with 4 operators, 12 vehicles, and active NH-16 corridor workflows.",
            badge_color="teal",
            entity_type="system",
            entity_id="SYSTEM"
        ),
    ]
    db.add_all(audit_events)
    db.commit()
