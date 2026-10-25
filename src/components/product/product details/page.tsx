"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaHeart, FaRegHeart } from "react-icons/fa6";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { TbCurrencyRupee, TbCheck } from "react-icons/tb";
import { MdOutlineVisibility } from "react-icons/md";
import { api, Category, Product, addToLocalCart, toggleLocalWishlist, getLocalWishlist } from "@/src/lib/inkstone-api";

export default function ProductDetail() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const [nextProducts, nextCategories] = await Promise.all([api.getProducts(), api.getCategories()]);
        setProducts(nextProducts.filter((product) => product.is_active));
        setCategories(nextCategories.filter((category) => category.is_active));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const visibleProducts = selectedCategory === "all"
    ? products
    : products.filter((product) => product.category.id === selectedCategory);

  function buyNow(product: Product) {
    sessionStorage.setItem("crystal_checkout_product", JSON.stringify(product));
    router.push("/checkout");
  }

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      api.getWishlist()
        .then((items) => setWishlistIds(items.map((i) => i.product.id)))
        .catch(() => setWishlistIds(getLocalWishlist()));
    } else {
      setWishlistIds(getLocalWishlist());
    }

    const onWishlistChange = () => setWishlistIds(getLocalWishlist());
    window.addEventListener("inkstone-wishlist-change", onWishlistChange);
    return () => window.removeEventListener("inkstone-wishlist-change", onWishlistChange);
  }, []);

  async function handleToggleWishlist(product: Product, e: React.MouseEvent) {
    e.stopPropagation();
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      try {
        const res = await api.toggleWishlist(product.id);
        if (res.status === "added") {
          setWishlistIds((prev) => [...prev, product.id]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== product.id));
        }
      } catch {
        const added = toggleLocalWishlist(product.id);
        setWishlistIds((prev) => added ? [...prev, product.id] : prev.filter((id) => id !== product.id));
      }
    } else {
      const added = toggleLocalWishlist(product.id);
      setWishlistIds((prev) => added ? [...prev, product.id] : prev.filter((id) => id !== product.id));
    }
  }

  async function handleQuickAddToCart(product: Product, e: React.MouseEvent) {
    e.stopPropagation();
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
    setCartSuccessId(product.id);
    setTimeout(() => setCartSuccessId(null), 2000);
  }

  return (
    <div className="pt-20">
      <section className="min-h-screen w-full">
        <div className="mx-auto max-w-[1600px] px-5">
          <div className="mb-14 flex flex-col items-center justify-center gap-2 text-center">
            <span className="flex items-center gap-2 font-semibold tracking-[-1px]"><span className="bg-[#ffea00] p-1"><RiShoppingBag3Fill /></span>Shop Our Best Sellers</span>
            <h2 className="mx-auto max-w-[900px] text-4xl tracking-[-2px] sm:text-6xl">Every crystal holds a story, every story deserves to be remembered.</h2>
          </div>

          <div className="grid gap-2 md:gap-6 grid-cols-[80px_1fr] md:grid-cols-[80px_1fr] lg:grid-cols-[190px_1fr] lg:items-start">
            <aside className="sticky top-28 h-fit max-h-[calc(100vh-120px)] overflow-y-auto border-r border-[#e5e5e5] pr-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hidden md:block">Browse by</p>
              <nav className="flex flex-col gap-3 md:gap-1" aria-label="Product categories">
                {/* All Button */}
                <button 
                  type="button" 
                  onClick={() => setSelectedCategory("all")} 
                  className={`flex flex-col items-center justify-center gap-1 w-full py-2 px-1 text-center transition md:flex-row md:px-4 md:py-2 md:justify-between md:text-left ${
                    selectedCategory === "all" 
                      ? "md:bg-[#ffea00] md:text-black" 
                      : "md:text-neutral-500 md:hover:bg-neutral-100 md:hover:text-black"
                  }`}
                >
                  <span className={`flex items-center justify-center h-12 w-12 md:h-8 md:w-auto rounded-full md:rounded-none font-bold text-sm transition ${
                    selectedCategory === "all"
                      ? "bg-[#ffea00] text-black"
                      : "bg-neutral-200 text-neutral-600"
                  }`}>
                    All
                  </span>
                  <span className="text-xs md:text-sm font-semibold">{products.length}</span>
                </button>

                {/* Category Buttons */}
                {categories.map((category) => (
                  <button 
                    type="button" 
                    key={category.id} 
                    onClick={() => setSelectedCategory(category.id)} 
                    className={`flex flex-col items-center justify-center gap-1 w-full py-2 px-1 text-center transition md:flex-row md:px-3 md:py-2 md:justify-between md:text-left ${
                      selectedCategory === category.id 
                        ? "md:bg-[#ffea00] md:text-black" 
                        : "md:text-neutral-500 md:hover:bg-neutral-100 md:hover:text-black"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1 md:flex md:flex-row md:gap-2 md:min-w-0">
                      {category.image_url ? (
                        <img 
                          src={category.image_url} 
                          alt={category.name}
                          className="h-12 w-12 md:h-8 md:w-8 flex-shrink-0 rounded-full object-cover" 
                        />
                      ) : (
                        <span className="h-12 w-12 md:h-8 md:w-8 flex-shrink-0 rounded-full bg-neutral-200" />
                      )}
                      <span className="text-xs md:text-sm font-semibold text-center md:text-left md:truncate">
                        {category.name}
                      </span>
                    </div>
                    {selectedCategory === category.id && (
                      <span className="hidden md:block text-sm font-semibold">
                        {products.filter((product) => product.category.id === category.id).length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="min-w-0">
              {loading && <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"><div className="h-[400px] animate-pulse rounded-3xl bg-neutral-100" /><div className="h-[400px] animate-pulse rounded-3xl bg-neutral-100" /><div className="h-[400px] animate-pulse rounded-3xl bg-neutral-100" /></div>}
              {!loading && error && <div className="border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}</div>}
              {!loading && !error && visibleProducts.length === 0 && <div className="border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">No products are available in this category yet.</div>}

              {!loading && !error && visibleProducts.length > 0 &&
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const isWishlisted = wishlistIds.includes(product.id);
                  const isJustAdded = cartSuccessId === product.id;
                  const hasOffer = typeof product.offer_price === "number" && typeof product.discount_percent === "number";
                  const displayPrice = hasOffer ? product.offer_price as number : product.price;

                  return (
                    <article key={product.id} className="group relative h-[400px] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
                      {/* Product Image */}
                      <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center bg-[#f2f2f2] text-5xl font-bold text-neutral-300">C</div>
                        }
                      </div>

                      {/* Dark overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      {/* Wishlist Heart Icon (Top Left) */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleWishlist(product, e)}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        className={`absolute left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 ${
                          isWishlisted ? "bg-white text-red-500 shadow-md" : "bg-black/20 text-white hover:bg-white hover:text-red-500"
                        }`}
                      >
                        {isWishlisted ? <FaHeart className="text-base" /> : <FaRegHeart className="text-base" />}
                      </button>

                      {/* Shopping Bag Quick Add (Top Right) */}
                      <button
                        type="button"
                        onClick={(e) => handleQuickAddToCart(product, e)}
                        title="Add to cart"
                        className={`absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
                          isJustAdded ? "bg-emerald-500 text-white" : "bg-[#ffea00] text-black shadow-md hover:bg-neutral-900 hover:text-[#ffea00]"
                        }`}
                      >
                        {isJustAdded ? <TbCheck className="text-lg font-bold" /> : <HiMiniShoppingBag className="text-base" />}
                      </button>

                      {hasOffer && (
                        <span className="absolute left-4 top-16 z-30 rounded-full bg-[#ffea00] px-3 py-1 text-xs font-bold text-black shadow-md">
                          {product.discount_percent}% OFF
                        </span>
                      )}

                      {/* View Product button — appears on hover */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                        <Link
                          href={`/product/${product.id}`}
                          id={`view-product-${product.id}`}
                          className="flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-xl transition-transform duration-300 hover:scale-105 hover:bg-[#ffea00]"
                        >
                          <MdOutlineVisibility className="text-lg" />
                          View Product
                        </Link>
                      </div>

                      {/* Product name + category — hidden on hover */}
                      <div className="absolute inset-x-0 bottom-[80px] px-5 text-white transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
                        <p className="truncate text-lg font-semibold drop-shadow-md">{product.name}</p>
                        <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-white/80 drop-shadow-md">
                          {product.category.image_url ? <img src={product.category.image_url} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-white/40" /> : <span className="h-6 w-6 shrink-0 rounded-full bg-white/25" />}
                          <span className="truncate">{product.category.name}</span>
                        </p>
                      </div>

                      {/* Bottom bar: Buy Now + Price — hidden on hover */}
                      <div className="absolute bottom-1 z-10 flex w-full items-center justify-between px-5 pb-5 transition-opacity duration-300 group-hover:opacity-0">
                        <button
                          type="button"
                          onClick={() => buyNow(product)}
                          className="flex items-center justify-between gap-2 rounded-3xl bg-[#ffffff5b] py-1.5 pl-5 pr-2 text-sm font-medium tracking-[-1px] text-white backdrop-blur-2xl transition hover:bg-white hover:text-black"
                        >
                          Buy Now
                          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#ffea00] p-1 text-[#000]">
                            <FaArrowRight />
                          </span>
                        </button>
                        <span className="flex items-center gap-1 rounded-3xl bg-[#000] px-5 py-2 text-[#fff]">
                          <TbCurrencyRupee className="text-[#ffea00]" />{displayPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
              }
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
