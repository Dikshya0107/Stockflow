from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderDetailResponse, OrderListResponse
from app.services.order_service import (
    build_order_detail_response,
    build_order_list_response,
    cancel_order,
    create_order,
)

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderListResponse])
def list_orders(db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.items))
        .order_by(Order.id.desc())
        .all()
    )
    return [build_order_list_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderDetailResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id {order_id} not found",
        )
    return build_order_detail_response(order)


@router.post("", response_model=OrderDetailResponse, status_code=status.HTTP_201_CREATED)
def post_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    order = create_order(db, order_in)
    return build_order_detail_response(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    cancel_order(db, order_id)
