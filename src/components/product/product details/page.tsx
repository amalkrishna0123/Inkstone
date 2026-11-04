"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowRight, FaHeart, FaRegHeart } from "react-icons/fa6";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { RiShoppingBag3Fill } from "react-icons/ri";
import { TbCurrencyRupee, TbCheck } from "react-icons/tb";
import { MdOutlineVisibility } from "react-icons/md";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { api, Category, Product, Banner, addToLocalCart, toggleLocalWishlist, getLocalWishlist } from "@/src/lib/inkstone-api";

export default function ProductDetail() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  // "all" | a category id | "ready_stock"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartSuccessId, setCartSuccessId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [nextProducts, nextCategories, nextBanners] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getBanners().catch(() => [] as Banner[]),
        ]);
        setProducts(nextProducts.filter((p) => p.is_active));
        setCategories(nextCategories.filter((c) => c.is_active));
        setBanners(nextBanners.filter((b) => b.is_active));
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Unable to load products.");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  // Banner carousel auto-slide
  useEffect(() => {
    if (banners.length <= 1) return;
    bannerTimerRef.current = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);

    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, [banners.length]);

  // Wishlist hydration
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
        setWishlistIds((prev) => (added ? [...prev, product.id] : prev.filter((id) => id !== product.id)));
      }
    } else {
      const added = toggleLocalWishlist(product.id);
      setWishlistIds((prev) => (added ? [...prev, product.id] : prev.filter((id) => id !== product.id)));
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

  function buyNow(product: Product) {
    sessionStorage.setItem("crystal_checkout_product", JSON.stringify(product));
    if (product.product_type === "ready_stock") {
      router.push("/checkout");
    } else {
      router.push(`/product/${product.id}/attachment`);
    }
  }

  const customProducts = products.filter((p) => !p.product_type || p.product_type === "custom");
  const readyStockProducts = products.filter((p) => p.product_type === "ready_stock");

  // Products shown in the main grid
  const displayProducts =
    selectedCategory === "ready_stock"
      ? readyStockProducts
      : selectedCategory === "all"
      ? products
      : customProducts.filter((p) => p.category?.id === selectedCategory);

  const prevBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const selectedLabel =
    selectedCategory === "all"
      ? "All Products"
      : selectedCategory === "ready_stock"
      ? "Ready Stock"
      : (categories.find((c) => c.id === selectedCategory)?.name ?? "Products");

  const selectedDesc =
    selectedCategory === "ready_stock"
      ? "Pre-crafted, ready-to-ship — dispatches within 24 hours. No customization required."
      : selectedCategory === "all"
      ? "Browse our full collection — custom crystal products and ready-to-ship pieces."
      : "Custom crystal products in this category.";

  return (
    <div className="pt-5 sm:pt-6">
      <section className="min-h-screen w-full">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">

          {/* Banner Carousel */}
          {banners.length > 0 && (
            <div className="mb-12 relative overflow-hidden rounded-3xl bg-neutral-900 text-white shadow-xl">
              <div
                className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeBannerIndex * 100}%)` }}
              >
                {banners.map((banner, index) => (
                  <div key={banner.id || index} className="relative h-full w-full flex-shrink-0 flex items-center">
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="" />
                    )}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" /> */}

                    {/* <div className="relative z-10 px-6 sm:px-12 md:px-16 max-w-2xl">
                      <span className="inline-block rounded-full bg-[#ffea00] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black mb-3">
                        Promotional Offer
                      </span>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
                        {banner.title}
                      </h2>
                      {banner.subtitle && (
                        <p className="mt-2 text-sm sm:text-base md:text-lg text-neutral-200 line-clamp-2 max-w-lg">
                          {banner.subtitle}
                        </p>
                      )}
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-black transition hover:bg-[#ffea00]"
                        >
                          Explore Now <FaArrowRight />
                        </a>
                      )}
                    </div> */}
                  </div>
                ))}
              </div>

              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    aria-label="Previous banner"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                  >
                    <FiChevronLeft className="text-lg sm:text-xl" />
                  </button>
                  <button
                    onClick={nextBanner}
                    aria-label="Next banner"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black"
                  >
                    <FiChevronRight className="text-lg sm:text-xl" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveBannerIndex(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`h-2 transition-all rounded-full ${
                          activeBannerIndex === i ? "w-8 bg-[#ffea00]" : "w-2 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Page heading */}
          <div className="mb-10 flex flex-col items-center justify-center gap-3 text-center">
            <span className="flex items-center gap-2 font-semibold tracking-[-1px] text-xs sm:text-sm text-neutral-600">
              <span className="bg-[#ffea00] p-1"><RiShoppingBag3Fill /></span>
              Explore Our Store Collection
            </span>
            <h1 className="mx-auto max-w-[900px] text-3xl sm:text-5xl md:text-6xl tracking-[-3px] text-neutral-900">
              Custom Treasures &amp; Ready to Ship Stones
            </h1>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-8">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-[400px] animate-pulse rounded-3xl bg-neutral-100" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="mb-8 border border-red-200 bg-red-50 p-5 text-sm text-red-700 rounded-2xl">{error}</div>
          )}

          {/* Sidebar + Grid */}
          {!loading && (
            <div className="grid gap-2 md:gap-6 grid-cols-[80px_1fr] md:grid-cols-[80px_1fr] lg:grid-cols-[190px_1fr] lg:items-start">

              {/* Left sidebar: Categories */}
              <aside className="sticky top-28 h-fit max-h-[calc(100vh-120px)] overflow-y-auto border-r border-[#e5e5e5] pr-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 hidden md:block">Categories</p>
                <nav className="flex flex-col gap-3 md:gap-1" aria-label="Product categories">

                  {/* All */}
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
                      selectedCategory === "all" ? "bg-[#ffea00] text-black" : "bg-neutral-200 text-neutral-600"
                    }`}>
                      All
                    </span>
                    <span className="text-xs md:text-sm font-semibold">{products.length}</span>
                  </button>

                  {/* Dynamic categories */}
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
                          <img src={category.image_url} alt={category.name} className="h-12 w-12 md:h-8 md:w-8 flex-shrink-0 rounded-full object-cover" />
                        ) : (
                          <span className="h-12 w-12 md:h-8 md:w-8 flex-shrink-0 rounded-full bg-neutral-200" />
                        )}
                        <span className="text-xs md:text-sm font-semibold text-center md:text-left md:truncate">{category.name}</span>
                      </div>
                      {selectedCategory === category.id && (
                        <span className="hidden md:block text-sm font-semibold">
                          {customProducts.filter((p) => p.category?.id === category.id).length}
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Ready Stock — separated by a thin divider */}
                  {readyStockProducts.length > 0 && (
                    <>
                      <div className="hidden md:block my-2 border-t border-neutral-200" />
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("ready_stock")}
                        className={`flex flex-col items-center justify-center gap-1 w-full py-2 px-1 text-center transition md:flex-row md:px-3 md:py-2 md:justify-between md:text-left ${
                          selectedCategory === "ready_stock"
                            ? "md:bg-[#ffea00] md:text-black"
                            : "md:text-neutral-500 md:hover:bg-neutral-100 md:hover:text-black"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1 md:flex md:flex-row md:gap-2 md:min-w-0">
                          <span className={`flex items-center justify-center h-12 w-12 md:h-8 md:w-8 flex-shrink-0 rounded-full text-base transition ${
                            selectedCategory === "ready_stock"
                              ? "bg-[#ffea00] text-black"
                              : "bg-neutral-200 text-neutral-600"
                          }`}>
                            📦
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-center md:text-left">Ready Stock</span>
                        </div>
                        {selectedCategory === "ready_stock" && (
                          <span className="hidden md:block text-sm font-semibold">{readyStockProducts.length}</span>
                        )}
                      </button>
                    </>
                  )}
                </nav>
              </aside>

              {/* Main product grid */}
              <div className="min-w-0">
                {/* Section header */}
                <div className="mb-6 border-b border-neutral-200 pb-5">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">{selectedLabel}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-500">{selectedDesc}</p>
                </div>

                {displayProducts.length === 0 ? (
                  <div className="border border-dashed border-neutral-300 p-12 text-center text-sm text-neutral-500 rounded-3xl">
                    {selectedCategory === "ready_stock"
                      ? "No ready stock products listed yet. Check back soon!"
                      : "No products found in this category."}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {displayProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isCustom={!product.product_type || product.product_type === "custom"}
                        wishlistIds={wishlistIds}
                        cartSuccessId={cartSuccessId}
                        onToggleWishlist={handleToggleWishlist}
                        onQuickAddToCart={handleQuickAddToCart}
                        onBuyNow={buyNow}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

function ProductCard({
  product,
  isCustom,
  wishlistIds,
  cartSuccessId,
  onToggleWishlist,
  onQuickAddToCart,
  onBuyNow,
}: {
  product: Product;
  isCustom: boolean;
  wishlistIds: string[];
  cartSuccessId: string | null;
  onToggleWishlist: (p: Product, e: React.MouseEvent) => void;
  onQuickAddToCart: (p: Product, e: React.MouseEvent) => void;
  onBuyNow: (p: Product) => void;
}) {
  const isWishlisted = wishlistIds.includes(product.id);
  const isJustAdded = cartSuccessId === product.id;
  const hasOffer = typeof product.offer_price === "number" && typeof product.discount_percent === "number";
  const displayPrice = hasOffer ? (product.offer_price as number) : product.price;

  return (
    <article className="group relative h-[420px] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm transition hover:shadow-md">
      {/* Product Image */}
      <div className="h-full w-full transition-transform duration-500 group-hover:scale-105">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#f2f2f2] text-5xl font-bold text-neutral-300">C</div>
        )}
      </div>

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Type badge — top left */}
      <span className={`absolute left-4 top-4 z-30 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm ${
        isCustom ? "bg-purple-900/80 text-purple-200" : "bg-emerald-900/80 text-emerald-200"
      }`}>
        {isCustom ? "Custom" : "Ready Stock"}
      </span>

      {/* Wishlist + Cart — top right */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => onToggleWishlist(product, e)}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 ${
            isWishlisted ? "bg-white text-red-500 shadow-md" : "bg-black/30 text-white hover:bg-white hover:text-red-500"
          }`}
        >
          {isWishlisted ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
        </button>

        <button
          type="button"
          onClick={(e) => onQuickAddToCart(product, e)}
          title="Add to cart"
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
            isJustAdded ? "bg-emerald-500 text-white" : "bg-[#ffea00] text-black shadow-md hover:bg-neutral-900 hover:text-[#ffea00]"
          }`}
        >
          {isJustAdded ? <TbCheck className="text-base font-bold" /> : <HiMiniShoppingBag className="text-base" />}
        </button>
      </div>

      {hasOffer && (
        <span className="absolute left-4 top-12 z-30 rounded-full bg-[#ffea00] px-3 py-1 text-xs font-bold text-black shadow-md">
          {product.discount_percent}% OFF
        </span>
      )}

      {/* View Product — hover centre */}
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
        <Link
          href={`/product/${product.id}`}
          className="flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-black shadow-xl transition hover:scale-105 hover:bg-[#ffea00]"
        >
          <MdOutlineVisibility className="text-base" />
          View Details
        </Link>
      </div>

      {/* Product name & category — hidden on hover */}
      <div className="absolute inset-x-0 bottom-[80px] px-5 text-white transition-opacity duration-300 group-hover:opacity-0 pointer-events-none">
        <p className="truncate text-lg font-bold drop-shadow-md">{product.name}</p>
        <p className="mt-1 flex min-w-0 items-center gap-2 text-xs text-white/90 drop-shadow-md">
          {product.category ? (
            <>
              {product.category.image_url ? (
                <img src={product.category.image_url} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover ring-1 ring-white/40" />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full bg-white/25" />
              )}
              <span className="truncate">{product.category.name}</span>
            </>
          ) : (
            <span className="italic text-emerald-300">Ready Stock</span>
          )}
        </p>
      </div>

      {/* Bottom bar: action + price — hidden on hover */}
      <div className="absolute bottom-1 z-10 flex w-full items-center justify-between px-5 pb-5 transition-opacity duration-300 group-hover:opacity-0">
        <button
          type="button"
          onClick={() => onBuyNow(product)}
          className="flex items-center justify-between gap-2 rounded-3xl bg-white/80 py-1.5 pl-4 pr-2 text-xs font-bold text-black backdrop-blur-md transition hover:bg-white"
        >
          {isCustom ? "Customize & Buy" : "Buy Now"}
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffea00] p-1 text-black">
            <FaArrowRight className="text-xs" />
          </span>
        </button>
        <span className="flex items-center gap-0.5 rounded-3xl bg-black px-4 py-2 text-xs font-bold text-white">
          <TbCurrencyRupee className="text-[#ffea00]" />
          {displayPrice.toLocaleString("en-IN")}
        </span>
      </div>
    </article>
  );
}
