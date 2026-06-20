"""
Populate the database with sample products, customers, and orders.

Usage:
  python seed.py          # seed only if the database is empty
  python seed.py --reset  # clear all data and reseed
"""

import argparse
from decimal import Decimal

from app.database import Base, SessionLocal, engine
from app.models import Customer, Order, Product  # noqa: F401
from app.models.customer import Customer as CustomerModel
from app.models.order import Order as OrderModel
from app.models.order import OrderItem
from app.models.product import Product as ProductModel
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.order_service import create_order

PRODUCTS = [
    {"name": "Ergonomic Office Chair", "sku": "CHAIR-001", "price": Decimal("149.99"), "quantity_in_stock": 25},
    {"name": "Wireless Mouse", "sku": "MOUSE-002", "price": Decimal("29.99"), "quantity_in_stock": 8},
    {"name": "USB-C Hub 7-in-1", "sku": "HUB-003", "price": Decimal("45.00"), "quantity_in_stock": 5},
    {"name": "LED Desk Lamp", "sku": "LAMP-004", "price": Decimal("34.50"), "quantity_in_stock": 42},
    {"name": "Notebook Pack (5)", "sku": "NOTE-005", "price": Decimal("12.99"), "quantity_in_stock": 3},
    {"name": "Mechanical Keyboard", "sku": "KEYB-006", "price": Decimal("89.99"), "quantity_in_stock": 15},
]

CUSTOMERS = [
    {"full_name": "Jane Doe", "email": "jane.doe@example.com", "phone": "555-0101"},
    {"full_name": "John Smith", "email": "john.smith@example.com", "phone": "555-0102"},
    {"full_name": "Acme Corporation", "email": "billing@acme.example.com", "phone": "555-0200"},
    {"full_name": "Sarah Patel", "email": "sarah.patel@example.com", "phone": "555-0144"},
]

# Each entry: customer email + list of (sku, quantity)
ORDERS = [
    {
        "customer_email": "jane.doe@example.com",
        "items": [("CHAIR-001", 2), ("LAMP-004", 1)],
    },
    {
        "customer_email": "john.smith@example.com",
        "items": [("MOUSE-002", 1), ("HUB-003", 1)],
    },
    {
        "customer_email": "billing@acme.example.com",
        "items": [("NOTE-005", 2), ("KEYB-006", 3)],
    },
    {
        "customer_email": "sarah.patel@example.com",
        "items": [("LAMP-004", 2)],
    },
]


def clear_data(db) -> None:
    db.query(OrderItem).delete()
    db.query(OrderModel).delete()
    db.query(ProductModel).delete()
    db.query(CustomerModel).delete()
    db.commit()


def seed_products(db) -> dict[str, ProductModel]:
    products_by_sku = {}
    for data in PRODUCTS:
        product = ProductModel(**data)
        db.add(product)
        products_by_sku[data["sku"]] = product
    db.commit()
    for product in products_by_sku.values():
        db.refresh(product)
    return products_by_sku


def seed_customers(db) -> dict[str, CustomerModel]:
    customers_by_email = {}
    for data in CUSTOMERS:
        customer = CustomerModel(**data)
        db.add(customer)
        customers_by_email[data["email"]] = customer
    db.commit()
    for customer in customers_by_email.values():
        db.refresh(customer)
    return customers_by_email


def seed_orders(db, customers_by_email: dict[str, CustomerModel], products_by_sku: dict[str, ProductModel]) -> None:
    for order_data in ORDERS:
        customer = customers_by_email[order_data["customer_email"]]
        items = [
            OrderItemCreate(product_id=products_by_sku[sku].id, quantity=quantity)
            for sku, quantity in order_data["items"]
        ]
        create_order(db, OrderCreate(customer_id=customer.id, items=items))


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the database with sample data")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete existing products, customers, and orders before seeding",
    )
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_products = db.query(ProductModel).count()

        if existing_products > 0 and not args.reset:
            print("Database already has data. Run with --reset to replace it.")
            return

        if args.reset and existing_products > 0:
            print("Clearing existing data...")
            clear_data(db)

        print("Seeding products...")
        products_by_sku = seed_products(db)
        print(f"  Added {len(products_by_sku)} products")

        print("Seeding customers...")
        customers_by_email = seed_customers(db)
        print(f"  Added {len(customers_by_email)} customers")

        print("Seeding orders...")
        seed_orders(db, customers_by_email, products_by_sku)
        order_count = db.query(OrderModel).count()
        print(f"  Added {order_count} orders")

        print("Done! Refresh the app to see sample data.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
