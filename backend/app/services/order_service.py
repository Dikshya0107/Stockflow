from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderDetailResponse,
    OrderItemResponse,
    OrderListResponse,
)


def _build_order_item_response(item: OrderItem) -> OrderItemResponse:
    line_total = Decimal(item.quantity) * item.unit_price
    return OrderItemResponse(
        id=item.id,
        product_id=item.product_id,
        product_name=item.product.name,
        quantity=item.quantity,
        unit_price=item.unit_price,
        line_total=line_total,
    )


def build_order_detail_response(order: Order) -> OrderDetailResponse:
    return OrderDetailResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        items=[_build_order_item_response(item) for item in order.items],
    )


def build_order_list_response(order: Order) -> OrderListResponse:
    return OrderListResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        item_count=len(order.items),
    )


def create_order(db: Session, order_in: OrderCreate) -> Order:
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with id {order_in.customer_id} not found",
        )

    product_map: dict[int, Product] = {}
    for item in order_in.items:
        if item.product_id in product_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate product_id {item.product_id} in order items",
            )

        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item.product_id} not found",
            )
        if product.quantity_in_stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient inventory for product '{product.name}'",
            )
        product_map[item.product_id] = product

    total_amount = sum(
        Decimal(item.quantity) * product_map[item.product_id].price
        for item in order_in.items
    )

    try:
        order = Order(
            customer_id=order_in.customer_id,
            total_amount=total_amount,
            status="confirmed",
        )
        db.add(order)
        db.flush()

        for item in order_in.items:
            product = product_map[item.product_id]
            db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price,
                )
            )
            product.quantity_in_stock -= item.quantity

        db.commit()
        db.refresh(order)
        return (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order.id)
            .first()
        )
    except Exception:
        db.rollback()
        raise


def cancel_order(db: Session, order_id: int) -> None:
    order = (
        db.query(Order)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )

    try:
        for item in order.items:
            item.product.quantity_in_stock += item.quantity
        db.delete(order)
        db.commit()
    except Exception:
        db.rollback()
        raise
