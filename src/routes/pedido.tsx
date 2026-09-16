import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowLeft, Package, User, Mail } from "lucide-react";
import { findPublicOrder } from "../lib/orders.server";
import "../archive.css";
import "../lookup.css";

export const Route = createFileRoute("/pedido")({ component: OrderLookup });

type Result = { code: string; total_cents: number; customer_name: string | null; customer_email: string | null; status: string; created_at: string; items: Array<{ product_id: string; product_name: string; quantity: number; unit_price_cents: number }> };
const labels: Record<string,string> = { pending:"Pendente", processing:"Preparando", shipped:"Enviado", completed:"Concluído", cancelled:"Cancelado" };
function money(c:number){return `R$ ${(Number(c)/100).toFixed(2).replace(".",",")}`}
function OrderLookup(){
 const [code,setCode]=useState(""); const [loading,setLoading]=useState(false); const [order,setOrder]=useState<Result|null>(null); const [message,setMessage]=useState("");
 async function search(){ const normalized=code.trim().toUpperCase(); if(!/^TA-[A-Z0-9]{6}$/.test(normalized)){setMessage("Digite um código no formato TA-XXXXXX.");return} setLoading(true);setMessage("");setOrder(null); try{const result=await findPublicOrder({data:{code:normalized}}); if(!result)setMessage("Pedido não encontrado."); else setOrder(result as Result)}catch{setMessage("Não foi possível consultar o pedido agora")}finally{setLoading(false)} }
 return <main className="lookup-page"><header className="lookup-header"><a className="brand" href="/">THE ARCHIVE<span>.</span></a><a href="/"><ArrowLeft size={15}/> Voltar à loja</a></header><section className="lookup-shell"><p className="eyebrow">ORDER TRACKING</p><h1>Rastreie seu pedido.</h1><p>Digite o código recebido após a compra para consultar o status.</p><div className="lookup-form"><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&search()} placeholder="TA-XXXXXX" maxLength={9}/><button onClick={search} disabled={loading}><Search size={16}/>{loading?"Consultando...":"Consultar"}</button></div>{message&&<div className="lookup-message">{message}</div>}{order&&<article className="order-result"><div className="order-result-top"><div><p className="eyebrow">PEDIDO</p><h2>{order.code}</h2><span>{new Date(order.created_at).toLocaleString("pt-BR")}</span></div><strong className={`status status-${order.status}`}>{labels[order.status]??order.status}</strong></div><div className="lookup-customer"><div><User/><span>Cliente<strong>{order.customer_name??"Não informado"}</strong></span></div><div><Mail/><span>E-mail<strong>{order.customer_email??"Não informado"}</strong></span></div></div><div className="lookup-items">{order.items.map((item,i)=><div key={`${item.product_id}-${i}`}><span>{item.product_name}<small>{item.quantity} × {money(item.unit_price_cents)}</small></span><strong>{money(item.quantity*item.unit_price_cents)}</strong></div>)}</div><div className="lookup-total"><span>Total</span><strong>{money(order.total_cents)}</strong></div></article>}</section><footer className="lookup-footer"><Package size={17}/> THE ARCHIVE · pedidos</footer></main>
}
