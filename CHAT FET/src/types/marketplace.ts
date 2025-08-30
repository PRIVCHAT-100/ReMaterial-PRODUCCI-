export type Role = "buyer" | "seller";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type Offer = {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id?: string | null;
  price: number;
  note?: string | null;
  status: OfferStatus;
  created_at: string; // ISO
};
