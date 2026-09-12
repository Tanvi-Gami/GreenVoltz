from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    amount: float = Field(gt=0)
    payment_reference: str | None = None


class PaymentResponse(BaseModel):
    reservation_id: int
    amount: float
    payment_status: str
    payment_reference: str | None = None
