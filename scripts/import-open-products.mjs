/**
 * Import real product records + photos from Open Food Facts.
 * Run locally with:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-open-products.mjs
 *
 * Keep SUPABASE_SERVICE_ROLE_KEY server-side only. Never expose it in NEXT_PUBLIC_* variables.
 */
const base = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!base || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");

const PAGE_SIZE = 100;
const TARGET = 10000;
const fields = [
  "code","product_name","generic_name","brands","categories_tags_en",
  "image_front_url","image_url","quantity"
].join(",");

async function offPage(page) {
  const url = "https://world.openfoodfacts.org/api/v2/search?fields="+encodeURIComponent(fields)+"&page="+page+"&page_size="+PAGE_SIZE+"&sort_by=popularity_key";
  const res = await fetch(url, {headers: {"User-Agent":"E-mart/1.0 (catalog importer)"}});
  if (!res.ok) throw new Error("Open Food Facts HTTP "+res.status);
  return res.json();
}

async function supabase(path, init={}) {
  const res = await fetch(base+"/rest/v1/"+path, {
    ...init,
    headers: {
      apikey:key,
      Authorization:"Bearer "+key,
      "Content-Type":"application/json",
      Prefer:"resolution=merge-duplicates,return=minimal",
      ...(init.headers||{})
    }
  });
  if (!res.ok) throw new Error("Supabase "+res.status+": "+await res.text());
}

const categoryCache = new Map();
async function categoryId(name) {
  const clean = String(name||"Other").replace(/^en:/,"").replace(/-/g," ").trim();
  if (!clean) return null;
  if (categoryCache.has(clean)) return categoryCache.get(clean);
  const q=encodeURIComponent("name=eq."+clean);
  const res=await fetch(base+"/rest/v1/categories?select=id&"+q,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const rows=res.ok?await res.json():[];
  if(rows[0]){categoryCache.set(clean,rows[0].id);return rows[0].id;}
  await supabase("categories",{method:"POST",body:JSON.stringify({name:clean})});
  const again=await fetch(base+"/rest/v1/categories?select=id&"+q,{headers:{apikey:key,Authorization:"Bearer "+key}});
  const got=again.ok?await again.json():[];
  const id=got[0]?.id||null; categoryCache.set(clean,id); return id;
}

let imported=0;
for(let page=1; imported<TARGET; page++){
  const data=await offPage(page);
  const rows=[];
  for(const p of data.products||[]){
    const name=String(p.product_name||"").trim();
    const image=p.image_front_url||p.image_url||null;
    if(!name||!image||!p.code) continue;
    const category=await categoryId(p.categories_tags_en?.[0]);
    rows.push({
      name,
      category_id:category,
      description:[p.brands,p.quantity,p.generic_name].filter(Boolean).join(" • ")||null,
      price:0,
      old_price:null,
      image_url:image,
      stock:100,
      is_active:true
    });
  }
  if(!rows.length) break;
  await supabase("products",{method:"POST",body:JSON.stringify(rows)});
  imported += rows.length;
  console.log("Imported",imported,"/",TARGET);
}
console.log("Done:",imported);
