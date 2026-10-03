"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = { id:number; name:string; price:number; image_url:string; quantity:number };
const CartContext = createContext<{items:CartItem[];add:(p:CartItem)=>void;remove:(id:number)=>void;setQty:(id:number,q:number)=>void;count:number;total:number}>({items:[],add:()=>{},remove:()=>{},setQty:()=>{},count:0,total:0});

export function CartProvider({children}:{children:React.ReactNode}){
  const [items,setItems]=useState<CartItem[]>([]);
  useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem("emart-cart")||"[]"))}catch{}},[]);
  useEffect(()=>{localStorage.setItem("emart-cart",JSON.stringify(items))},[items]);
  const value=useMemo(()=>({items,add:(p:CartItem)=>setItems(x=>{const f=x.find(i=>i.id===p.id);return f?x.map(i=>i.id===p.id?{...i,quantity:i.quantity+1}:i):[...x,{...p,quantity:1}]}),remove:(id:number)=>setItems(x=>x.filter(i=>i.id!==id)),setQty:(id:number,q:number)=>setItems(x=>q<1?x.filter(i=>i.id!==id):x.map(i=>i.id===id?{...i,quantity:q}:i)),count:items.reduce((s,i)=>s+i.quantity,0),total:items.reduce((s,i)=>s+i.price*i.quantity,0)}),[items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart=()=>useContext(CartContext);