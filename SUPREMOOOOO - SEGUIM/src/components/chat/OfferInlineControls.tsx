
/**
 * OfferInlineControls.tsx
 * 
 * Este componente se añade DENTRO de la burbuja de mensaje.
 * No cambia estilos globales. Solo inyecta estado y botones para ofertas.
 */
import * as React from "react";

export type Role = "buyer" | "seller";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type Message = {
  id: string;
  author: Role;
  text: string;
  createdAt: string;
};

export type Offer = {
  id: string;
  madeBy: Role;
  price: number;
  note?: string | null;
  status: OfferStatus;
  createdAt: string;
  reserved?: boolean | null;
};

type Props = {
  me: Role;
  message: Message;
  offers: Offer[];
  onAcceptOffer?: (offerId: string) => void;
  onRejectOffer?: (offerId: string) => void;
  onWithdrawOffer?: (offerId: string) => void;
  onBuy?: (offerId?: string) => void;
  onReserveAcceptedOffer?: (offerId: string) => void;
};

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);

// Parse "Oferta: 4,00 € — nota"
function parseOfferFromMessage(text: string): { price?: number; note?: string } | null {
  if (!/^oferta:/i.test(text.trim())) return null;
  const m = text.match(/oferta:\s*([0-9.\s]*,[0-9]{1,2}|[0-9]+(?:\.[0-9]+)?)\s*[€eur]*/i);
  const notePart = text.split(/—|--| - /).slice(1).join("—").trim() || undefined;
  if (!m) return { note: notePart };
  let raw = m[1].replace(/\s/g, "");
  if (raw.includes(",") && raw.includes(".")) raw = raw.replace(/\./g, "").replace(",", ".");
  else if (raw.includes(",")) raw = raw.replace(",", ".");
  const price = Number(raw);
  return { price: isNaN(price) ? undefined : price, note: notePart };
}

function matchOfferForMessage(msg: Message, offers: Offer[]): Offer | undefined {
  const parsed = parseOfferFromMessage(msg.text);
  if (!parsed) return undefined;
  const tMsg = new Date(msg.createdAt).getTime();
  const candidates = offers.filter(o => o.madeBy === msg.author);
  let best: Offer | undefined;
  let bestScore = Infinity;
  for (const o of candidates) {
    const dt = Math.abs(new Date(o.createdAt).getTime() - tMsg);
    if (dt > 5 * 60 * 1000) continue;
    let score = dt;
    if (parsed.price != null) score += Math.abs(o.price - parsed.price) * 1000;
    if (score < bestScore) { bestScore = score; best = o; }
  }
  if (!best && parsed.price != null) {
    best = candidates
      .filter(o => Math.abs(o.price - parsed.price!) < 1e-6)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }
  return best;
}

export default function OfferInlineControls(props: Props) {
  const { me, message, offers } = props;
  const offer = matchOfferForMessage(message, offers || []);
  if (!offer) return null;
  const isMine = message.author === me;

  return (
    <div className="mt-2 text-xs">
      <div className="mb-1">
        Estado:{" "}
        {offer.status === "pending" && <span className="text-amber-600">Pendiente</span>}
        {offer.status === "accepted" && <span className="text-green-600">Aceptada</span>}
        {offer.status === "rejected" && <span className="text-destructive">Rechazada</span>}
        {offer.status === "withdrawn" && <span className="opacity-70">Retirada</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {!isMine && offer.status === "pending" && (
          <>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
              onClick={() => props.onAcceptOffer?.(offer.id)}
            >
              Aceptar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium bg-secondary hover:opacity-90"
              onClick={() => props.onRejectOffer?.(offer.id)}
            >
              Rechazar
            </button>
          </>
        )}
        {isMine && offer.status === "pending" && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium border"
            onClick={() => props.onWithdrawOffer?.(offer.id)}
          >
            Retirar
          </button>
        )}
        {offer.status === "accepted" && me === "buyer" && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
            onClick={() => props.onBuy?.(offer.id)}
          >
            Comprar por {fmt(offer.price)}
          </button>
        )}
        {offer.status === "accepted" && me === "seller" && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-medium bg-secondary hover:opacity-90"
            onClick={() => props.onReserveAcceptedOffer?.(offer.id)}
          >
            Marcar reservado
          </button>
        )}
      </div>
    </div>
  );
}
