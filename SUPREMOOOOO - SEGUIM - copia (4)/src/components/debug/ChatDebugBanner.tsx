import React from "react";

export default function ChatDebugBanner({ userId, seller, product }: { userId?: string | null; seller?: string | null; product?: string | null; }) {
  return (
    <div style={{background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.35)', padding:'8px', margin:'8px 0', borderRadius:8}}>
      <strong>Debug estado:</strong>
      <span style={{marginLeft:8}}>user: {userId || "—"}</span>
      <span style={{marginLeft:8}}>seller: {seller || "—"}</span>
      <span style={{marginLeft:8}}>product: {product || "—"}</span>
    </div>
  );
}
