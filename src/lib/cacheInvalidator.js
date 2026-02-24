// lib/cacheInvalidator.js
import { kv } from "./redis/kv";

export async function invalidateProductCache(productId) {
  // 1. Full list cache
  try {
    await kv.delete("allProducts");
  } catch (e) {
    console.warn("Failed to delete allProducts cache:", e.message);
  }

  // 2. Single product cache (if id is known)
  if (productId) {
    const key = `product:${productId}`;
    try {
      await kv.delete(key);
    } catch (e) {
      console.warn(`Failed to delete ${key} cache:`, e.message);
    }
  }
}
