"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LuHeart, 
  LuTrash2, 
  LuShoppingCart, 
  LuArrowRight, 
  LuCheck,
  LuSparkles
} from "react-icons/lu";
import { TbCurrencyRupee } from "react-icons/tb";
import { 
  api, 
  Product, 
  WishlistItem, 
  getLocalWishlist, 
  toggleLocalWishlist, 
  addToLocalCart 
} from "@/src/lib/inkstone-api";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<{ id: string; product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedCartIds, setAddedCartIds] = useState<string[]>([]);
  const [movingAll, setMovingAll] = useState(false);

  useEffect(() => {
    loadWishlist();
  }, []);

  async function loadWishlist() {
    setLoading(true);
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      try {
        const data = await api.getWishlist();
        setItems(data.map((item) => ({ id: item.id, product: item.product })));
        setLoading(false);
        return;
      } catch {
        // Fall back to local wishlist if API fails or session expired
      }
    }

    // Guest / local storage fallback
    const localIds = getLocalWishlist();
    if (localIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const allProducts = await api.getProducts();
      const matched = allProducts.filter((p) => localIds.includes(p.id));
      setItems(matched.map((p) => ({ id: p.id, product: p })));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(itemId: string, productId: string) {
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    
    // Always sync local storage
    toggleLocalWishlist(productId);

    if (isLogged) {
      try {
        await api.removeFromWishlist(itemId);
      } catch {
        // Ignored
      }
    }
  }

  async function handleAddToCart(product: Product) {
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      try {
        await api.addToCart(product.id, 1);
      } catch {
        addToLocalCart(product, 1);
      }
    } else {
      addToLocalCart(product, 1);
    }

    setAddedCartIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedCartIds((prev) => prev.filter((id) => id !== product.id));
    }, 2500);
  }

  async function handleMoveAllToCart() {
    if (items.length === 0) return;
    setMovingAll(true);
    for (const item of items) {
      await handleAddToCart(item.product);
    }
    setMovingAll(false);
  }

  function buyNow(product: Product) {
    handleAddToCart(product);
    sessionStorage.setItem("crystal_checkout_product", JSON.stringify(product));
    router.push("/checkout");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <LuHeart className="text-xl fill-red-500" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Wishlist</h1>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {items.length} {items.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleMoveAllToCart}
            disabled={movingAll}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#ffea00] px-5 py-2.5 text-sm font-bold text-black transition-all hover:bg-neutral-900 hover:text-[#ffea00]"
          >
            <LuSparkles className="text-base" />
            {movingAll ? "Adding All..." : "Move All to Cart"}
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-3xl border border-neutral-100 bg-[#f9f8f5] p-4">
              <div className="h-56 rounded-2xl bg-neutral-200" />
              <div className="mt-4 h-5 w-3/4 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200" />
              <div className="mt-4 h-10 rounded-xl bg-neutral-200" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <LuHeart className="text-4xl stroke-[1.5]" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900">Your wishlist is empty</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-500">
            Explore our handcrafted luxury crystal collections and click the heart icon to save your favorite pieces.
          </p>
          <Link
            href="/product"
            className="mt-8 flex items-center gap-2 rounded-full bg-[#ffea00] px-8 py-3 text-sm font-bold text-black shadow-md transition-all hover:bg-neutral-900 hover:text-[#ffea00]"
          >
            Explore Products <LuArrowRight className="text-base" />
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {!loading && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ id, product }) => {
            const isAdded = addedCartIds.includes(product.id);

            return (
              <div
                key={id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(id, product.id)}
                  title="Remove from wishlist"
                  className="absolute right-6 top-6 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-400 shadow-sm backdrop-blur-md transition-all hover:bg-red-500 hover:text-white"
                >
                  <LuTrash2 className="text-base" />
                </button>

                {/* Product Image */}
                <Link href={`/product/${product.id}`} className="relative block h-56 w-full overflow-hidden rounded-2xl bg-[#f5f3ee]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl font-bold text-neutral-200">
                      C
                    </div>
                  )}
                  {product.stock <= 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
                      Out of Stock
                    </span>
                  )}
                </Link>

                {/* Product Details */}
                <div className="mt-4 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    {product.category?.name || "Collection"}
                  </span>
                  <Link href={`/product/${product.id}`} className="mt-1 block">
                    <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 transition-colors group-hover:text-black">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-lg font-extrabold text-neutral-900">
                      <TbCurrencyRupee className="text-[#4a5c3a]" />
                      <span>{product.price.toLocaleString("en-IN")}</span>
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        product.stock > 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "border border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <LuCheck className="text-sm font-bold" /> Added
                      </>
                    ) : (
                      <>
                        <LuShoppingCart className="text-sm" /> Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => buyNow(product)}
                    disabled={product.stock <= 0}
                    className="flex items-center justify-center gap-1 rounded-xl bg-[#ffea00] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-neutral-900 hover:text-[#ffea00] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
