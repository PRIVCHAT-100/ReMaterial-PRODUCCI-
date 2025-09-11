import * as React from "react";
import { createOfferWithProduct } from "@/lib/chat/supabaseChat";

export default function OffersDebug() {
  const [conversationId, setConversationId] = React.useState("");
  const [price, setPrice] = React.useState<number>(100);
  const [note, setNote] = React.useState("");
  const [output, setOutput] = React.useState<any>(null);

  async function run() {
    try {
      const row = await createOfferWithProduct(conversationId, "buyer", Number(price), note || undefined);
      setOutput({ ok: true, row });
    } catch (e: any) {
      setOutput({ ok: false, error: { message: e?.message, details: e?.details, hint: e?.hint, code: e?.code } });
      console.error("OffersDebug error:", e);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Offers Debug</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
        <label>Conversation ID
          <input value={conversationId} onChange={e => setConversationId(e.target.value)} placeholder="uuid" />
        </label>
        <label>Price
          <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
        </label>
        <label>Note
          <input value={note} onChange={e => setNote(e.target.value)} />
        </label>
        <button onClick={run}>Create Offer</button>
        <pre style={{ background: "#111", color: "#0f0", padding: 8, overflow: "auto" }}>
{JSON.stringify(output, null, 2)}
        </pre>
      </div>
    </div>
  );
}
