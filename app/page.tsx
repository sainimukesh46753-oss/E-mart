"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { productImage } from "../lib/images";
import { useCart } from "./providers";

type Product={id:number;name:string;price:number;old_price:number|null;description:string|null;image_url:string|null;category_id:number|null;categories?:{name:string}|null};

export default function Home(){
 const [products,setProducts]=useState<Product[]>([]),[cats,setCats]=useState<any[]>([]),[q,setQ]=useState(""),[category,setCategory]=useState<number|null>(null),[loading,setLoading]=useState(true);
 const {add,count}=useCart();
 async function load(){
  setLoading(true); const s=supabase(); let query=s.from("products").select("id,name,price,old_price,description,image_url,category_id,categories(name)").eq("is_active",true).order("id").range(0,23);
  if(q.trim()) query=query.ilike("name",`%${q.trim()}%`);
  if(category) query=query.eq("category_id",category);
  const [{data},cat]=await Promise.all([query,s.from("categories").select("id,name").order("id")]); setProducts((data||[]) as Product[]);setCats(cat.data||[]);setLoading(false);
 }
 useEffect(()=>{load()},[category]); // search is submitted, not live
 function submit(e:React.FormEvent){e.preventDefault();load()}
 return <><div className="topbar"><div className="shell"><span>🚚 Free delivery on selected orders</span><span>10,000+ products • Secure checkout</span></div></div>
 <header className="header"><div className="shell header-row"><Link className="logo" href="/">E<span>-mart</span></Link>
 <form className="search" onSubmit={submit}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search products..." aria-label="Search products"/><button>⌕</button></form>
 <div className="actions"><Link className="action" href="/account">Account</Link><Link className="action cart" href="/cart">Cart ({count})</Link></div></div></header>
 <main className="shell"><section className="hero"><div><h1>Everything you need, in one E-mart.</h1><p>Discover thousands of products across fashion, electronics, beauty and home.</p><Link className="cta" href="#products">Shop now</Link></div><div style={{fontSize:90}}>🛍️</div></section>
 <div className="categories"><button className={"chip "+(!category?"active":"")} onClick={()=>setCategory(null)}>All</button>{cats.map(c=><button key={c.id} className={"chip "+(category===c.id?"active":"")} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</div>
 <section id="products"><div className="section-head"><div><h2>Featured products</h2><div className="muted">Showing the first 24 from your 10,000+ product catalogue.</div></div></div>
 {loading?<div className="empty">Loading products…</div>:products.length===0?<div className="empty">No products found. Try another search.</div>:<div className="grid">{products.map(p=><article className="card" key={p.id}><Link href={"/product/"+p.id}><div className="photo"><Image src={productImage(p.id)} alt={p.name} fill sizes="(max-width:650px) 50vw,(max-width:900px) 33vw,25vw"/></div></Link><div className="card-body"><div className="cat">{p.categories?.name||"E-mart"}</div><Link href={"/product/"+p.id}><div className="name">{p.name}</div></Link><div className="price">₹{Number(p.price).toLocaleString("en-IN")}{p.old_price&&<span className="old">₹{Number(p.old_price).toLocaleString("en-IN")}</span>}</div><div className="card-actions"><button className="add" onClick={()=>add({id:p.id,name:p.name,price:Number(p.price),image_url:productImage(p.id),quantity:1})}>Add to cart</button><Link className="buy" href={"/product/"+p.id}>Buy now</Link></div></div></article>)}</div>}</section></main>
 <footer className="footer"><div className="shell"><strong>E-mart</strong><p>10,000+ product catalogue • Built for fast shopping.</p></div></footer></>
}