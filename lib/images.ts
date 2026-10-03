// Product images are stored in Supabase products.image_url.
export function productImage(_id:number,imageUrl?:string|null){ return imageUrl || "/product-placeholder.svg"; }
