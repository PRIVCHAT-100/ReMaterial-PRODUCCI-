// src/pages/StripeSetup.tsx
import * as React from "react";
import { postJSON, go, toCents } from "@/lib/stripeClient";
export default function StripeSetup() {
  const [userId, setUserId] = React.useState(""); const [sellerAccountId, setSellerAccountId] = React.useState("");
  const [priceEuros, setPriceEuros] = React.useState(10); const [priceId, setPriceId] = React.useState("");
  const [buyerId, setBuyerId] = React.useState(""); const [customerId, setCustomerId] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null); const loading = (k: string) => busy === k;
  async function activarPagos() { try { setBusy("activar"); const { accountId } = await postJSON("/api/stripe/create-connected-account", { userId });
    setSellerAccountId(accountId); const { url } = await postJSON("/api/stripe/onboarding-link", { accountId }); go(url);
  } catch (e:any){ alert(e.message);} finally{ setBusy(null);} }
  async function panelPagos(){ try{ setBusy("panel"); const { url } = await postJSON("/api/stripe/login-link", { accountId: sellerAccountId }); go(url);
  } catch (e:any){ alert(e.message);} finally{ setBusy(null);} }
  async function comprar(){ try{ setBusy("comprar"); const { url } = await postJSON("/api/stripe/create-checkout-session", {
      mode:"payment", amount: toCents(priceEuros), currency:"eur", sellerAccountId,
      metadata:{ conversation_id:"demo-conv", offer_id:"demo-offer", product_id:"demo-product",
                 buyer_id: buyerId || "demo-buyer", seller_id:"demo-seller", quantity:"1",
                 product_name:"Producto demo", unit_price_cents:String(toCents(priceEuros)) } });
      go(url);
    } catch(e:any){ alert(e.message);} finally{ setBusy(null);} }
  async function suscribirse(){ try{ setBusy("sub"); const { url } = await postJSON("/api/stripe/create-checkout-session", {
      mode:"subscription", priceId, sellerAccountId, metadata:{ buyer_id: buyerId || "demo-buyer" } }); go(url);
    } catch(e:any){ alert(e.message);} finally{ setBusy(null);} }
  async function crearCustomer(){ try{ setBusy("cust"); const res = await postJSON("/api/stripe/create-customer", {
      userId: buyerId || "demo-buyer", email:"demo@example.com", name:"Demo Buyer" }); setCustomerId(res.customerId); alert("Customer: "+res.customerId);
    } catch(e:any){ alert(e.message);} finally{ setBusy(null);} }
  async function portalCliente(){ try{ setBusy("portal"); const { url } = await postJSON("/api/stripe/customer-portal-link", { customerId }); go(url);
    } catch(e:any){ alert(e.message);} finally{ setBusy(null);} }
  return (<div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
    <h1>Stripe Setup — ReMaterial</h1><p>Panel auxiliar para probar Stripe sin tocar tu UI.</p>
    <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:12, marginTop:24 }}>
      <h2>1) Activar pagos (Vendedor)</h2><label>userId vendedor</label>
      <input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="uuid vendedor" style={{ width:"100%", margin:"8px 0" }}/>
      <button onClick={activarPagos} disabled={loading("activar")}>Activar pagos (onboarding)</button><div style={{ height:8 }}/>
      <label>sellerAccountId</label><input value={sellerAccountId} onChange={(e)=>setSellerAccountId(e.target.value)} placeholder="acct_..." style={{ width:"100%", margin:"8px 0" }}/>
      <button onClick={panelPagos} disabled={!sellerAccountId || loading("panel")}>Mi panel de pagos</button>
    </section>
    <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:12, marginTop:24 }}>
      <h2>2) Pago único</h2><label>buyerId</label>
      <input value={buyerId} onChange={(e)=>setBuyerId(e.target.value)} placeholder="uuid comprador" style={{ width:"100%", margin:"8px 0" }}/>
      <label>Precio (EUR)</label><input type="number" value={priceEuros} onChange={(e)=>setPriceEuros(Number(e.target.value))} style={{ width:"100%", margin:"8px 0" }}/>
      <button onClick={comprar} disabled={!sellerAccountId || loading("comprar")}>Comprar por {priceEuros.toFixed(2)} €</button>
    </section>
    <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:12, marginTop:24 }}>
      <h2>3) Suscripción</h2><label>Price ID</label>
      <input value={priceId} onChange={(e)=>setPriceId(e.target.value)} placeholder="price_..." style={{ width:"100%", margin:"8px 0" }}/>
      <button onClick={suscribirse} disabled={!priceId || loading("sub")}>Suscribirme</button>
    </section>
    <section style={{ border:"1px solid #e5e7eb", padding:16, borderRadius:12, marginTop:24 }}>
      <h2>4) Portal del cliente</h2><button onClick={crearCustomer} disabled={loading("cust")}>Crear Customer demo</button><div style={{ height:8 }}/>
      <label>stripeCustomerId</label><input value={customerId} onChange={(e)=>setCustomerId(e.target.value)} placeholder="cus_..." style={{ width:"100%", margin:"8px 0" }}/>
      <button onClick={portalCliente} disabled={!customerId || loading("portal")}>Abrir portal</button>
    </section>
  </div>); }
