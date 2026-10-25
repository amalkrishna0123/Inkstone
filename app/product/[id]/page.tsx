"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, Product, ProductDetail, addToLocalCart, toggleLocalWishlist, getLocalWishlist } from "@/src/lib/inkstone-api";
import { TbCurrencyRupee, TbTruckDelivery, TbShieldCheck, TbRefresh, TbCheck } from "react-icons/tb";
import { FaArrowRight, FaStar, FaRegStar, FaStarHalfAlt, FaHeart, FaRegHeart } from "react-icons/fa";
import { HiMiniShoppingBag } from "react-icons/hi2";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { IoLeaf } from "react-icons/io5";
import { BsDropletFill } from "react-icons/bs";

// ─── Mock Review Data ─────────────────────────────────────────────────────────
const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Priya R.",
    avatar: "PR",
    rating: 5,
    date: "Aug 12, 2026",
    title: "Absolutely stunning quality",
    body: "The quality absolutely blew me away. Far exceeded my expectations — every detail feels intentional and premium. Will definitely be ordering again.",
    helpful: 24,
    verified: true,
  },
  {
    id: 2,
    name: "Arjun M.",
    avatar: "AM",
    rating: 4,
    date: "Jul 28, 2026",
    title: "Excellent craftsmanship",
    body: "Excellent product! The materials are high quality and it arrived well-packaged. Sizing was true to description. One star off as delivery took a bit longer than expected.",
    helpful: 16,
    verified: true,
  },
  {
    id: 3,
    name: "Sneha T.",
    avatar: "ST",
    rating: 5,
    date: "Jul 15, 2026",
    title: "Perfect gift — loved it!",
    body: "Bought this as a gift and the recipient was absolutely thrilled. The presentation is beautiful and the product itself is top-notch. Highly recommend.",
    helpful: 31,
    verified: true,
  },
  {
    id: 4,
    name: "Karan D.",
    avatar: "KD",
    rating: 4,
    date: "Jun 30, 2026",
    title: "Great value for money",
    body: "Really impressed with the overall quality given the price point. Feels luxurious and durable. Customer support was also very responsive when I had a query.",
    helpful: 9,
    verified: false,
  },
  {
    id: 5,
    name: "Meera K.",
    avatar: "MK",
    rating: 5,
    date: "Jun 18, 2026",
    title: "Exceeded all expectations",
    body: "I was skeptical at first but this product truly delivers. The attention to detail is remarkable and it fits perfectly. Will be recommending to all my friends.",
    helpful: 42,
    verified: true,
  },
];

const MATERIALS = [
  { name: "Recycled Polyester", icon: <BsDropletFill />, desc: "Made from post-consumer recycled materials for a lower carbon footprint." },
  { name: "TENCEL™ Lyocell", icon: <IoLeaf />, desc: "Silky soft fibre derived from sustainably sourced wood pulp." },
  { name: "Organic Cotton", icon: <IoLeaf />, desc: "Grown without harmful pesticides, certified GOTS organic." },
  { name: "Hemp Fabric", icon: <IoLeaf />, desc: "Naturally durable and breathable, requiring minimal water to grow." },
];

// ─── Star Rating Component ────────────────────────────────────────────────────
function StarRating({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${size} text-amber-400`}>
      {[1, 2, 3, 4, 5].map((s) =>
        rating >= s ? <FaStar key={s} /> : rating >= s - 0.5 ? <FaStarHalfAlt key={s} /> : <FaRegStar key={s} />
      )}
    </div>
  );
}

// ─── Product Card (for related / recently viewed) ─────────────────────────────
function SmallProductCard({ product }: { product: Product }) {
  const hasOffer = typeof product.offer_price === "number" && typeof product.discount_percent === "number";
  const displayPrice = hasOffer ? product.offer_price as number : product.price;

  return (
    <Link href={`/product/${product.id}`} className="group flex-shrink-0 w-[220px]">
      <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-neutral-100">
        {product.image_url
          ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="flex h-full items-center justify-center text-5xl font-bold text-neutral-300">C</div>
        }
        {hasOffer && <span className="absolute left-3 top-3 rounded-full bg-[#ffea00] px-2.5 py-1 text-[11px] font-bold text-black">{product.discount_percent}% OFF</span>}
        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
      </div>
      <div className="mt-3 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{product.category.name}</p>
        <p className="mt-0.5 truncate font-semibold tracking-tight text-neutral-900">{product.name}</p>
        <div className="mt-1 flex items-center gap-1 text-sm font-bold">
          <TbCurrencyRupee className="text-[#4a5c3a]" />
          <span>{displayPrice.toLocaleString("en-IN")}</span>
          {hasOffer && <span className="text-xs font-medium text-neutral-400 line-through">{product.price.toLocaleString("en-IN")}</span>}
        </div>
        <div className="mt-1 flex items-center gap-1">
          <StarRating rating={4.5} size="text-xs" />
          <span className="text-[11px] text-neutral-400">(4.5)</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedThumb, setSelectedThumb] = useState(0);
  const [qty, setQty] = useState(1);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [activeReviewTab, setActiveReviewTab] = useState<"youMayLike" | "recentlyViewed">("youMayLike");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // ── Load product & wishlist state ─────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.getProductById(productId)
      .then((data) => {
        setProduct(data);
        setSelectedThumb(0);
        // Check wishlist
        const isLogged = Boolean(localStorage.getItem("inkstone_access"));
        if (isLogged) {
          api.getWishlist()
            .then((items) => setIsWishlisted(items.some((i) => i.product.id === data.id)))
            .catch(() => setIsWishlisted(getLocalWishlist().includes(data.id)));
        } else {
          setIsWishlisted(getLocalWishlist().includes(data.id));
        }

        // Update recently viewed in localStorage
        try {
          const stored = JSON.parse(localStorage.getItem("crystal_recently_viewed") ?? "[]") as Product[];
          const filtered = stored.filter((p) => p.id !== data.id);
          const updated = [data, ...filtered].slice(0, 8);
          localStorage.setItem("crystal_recently_viewed", JSON.stringify(updated));
        } catch { /* ignore */ }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Product not found."))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleToggleWishlist() {
    if (!product) return;
    const isLogged = Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      try {
        const res = await api.toggleWishlist(product.id);
        setIsWishlisted(res.status === "added");
      } catch {
        const added = toggleLocalWishlist(product.id);
        setIsWishlisted(added);
      }
    } else {
      const added = toggleLocalWishlist(product.id);
      setIsWishlisted(added);
    }
  }

  async function handleAddToCart() {
    if (!product || product.stock === 0) return;
    setCartAdding(true);
    const isLogged = Boolean(localStorage.getItem("inkstone_access"));
    if (isLogged) {
      try {
        await api.addToCart(product.id, qty);
      } catch {
        addToLocalCart(product, qty);
      }
    } else {
      addToLocalCart(product, qty);
    }
    setCartAdding(false);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  }

  // ── Load recently viewed from localStorage ────────────────────────────────
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("crystal_recently_viewed") ?? "[]") as Product[];
      setRecentlyViewed(stored.filter((p) => p.id !== productId).slice(0, 6));
    } catch { /* ignore */ }
  }, [productId]);

  function buyNow() {
    if (!product) return;
    handleAddToCart();
    sessionStorage.setItem("crystal_checkout_product", JSON.stringify(product));
    router.push(`/product/${product.id}/attachment`);
  }

  function scrollCarousel(dir: "left" | "right") {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  }

  // ── Thumbnail images — use product image for all slots ────────────────────
  const galleryImages = product ? [product.image_url, ...(product.additional_image_urls ?? [])].filter(Boolean) : [];
  const activeImage = galleryImages[selectedThumb] ?? product?.image_url ?? "";
  const hasOffer = Boolean(product && typeof product.offer_price === "number" && typeof product.discount_percent === "number");
  const displayPrice = hasOffer ? product?.offer_price as number : product?.price ?? 0;
  const displayedProducts = activeReviewTab === "youMayLike" ? product?.related_products ?? [] : recentlyViewed;

  // ─── Loading ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen pt-24">
        <div className="mx-auto max-w-[1300px] px-5">
          <div className="grid gap-10 md:grid-cols-2">
            <div className="h-[550px] animate-pulse rounded-3xl bg-neutral-100" />
            <div className="space-y-4 pt-4">
              <div className="h-6 w-32 animate-pulse rounded bg-neutral-100" />
              <div className="h-10 w-3/4 animate-pulse rounded-xl bg-neutral-100" />
              <div className="h-8 w-1/3 animate-pulse rounded-xl bg-neutral-100" />
              <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
              <div className="h-12 animate-pulse rounded-full bg-neutral-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-24 text-center">
        <p className="text-xl font-semibold text-neutral-700">{error || "Product not found."}</p>
        <Link href="/product" className="flex items-center gap-2 rounded-full bg-[#ffea00] px-6 py-2.5 font-semibold text-black hover:bg-neutral-900 hover:text-white transition-colors duration-200">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const avgRating = 4.87;
  const ratingBreakdown = [
    { stars: 5, pct: 78 },
    { stars: 4, pct: 14 },
    { stars: 3, pct: 5 },
    { stars: 2, pct: 2 },
    { stars: 1, pct: 1 },
  ];

  return (
    <div className="bg-white">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="pt-24 pb-4">
        <div className="mx-auto max-w-[1300px] px-5">
          <nav className="flex items-center gap-2 text-xs text-neutral-400">
            <Link href="/" className="hover:text-neutral-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/product" className="hover:text-neutral-700 transition-colors">Products</Link>
            <span>/</span>
            <span className="text-neutral-700 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          §1  HERO — Gallery + Product Info
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1300px] px-5">
          <div className="grid gap-10 lg:grid-cols-[1fr_480px]">

            {/* ── Gallery ──────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              {/* Main Image */}
              <div className="relative h-[500px] overflow-hidden rounded-3xl bg-[#f5f3ee]">
                {activeImage
                  ? <img src={activeImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                  : <div className="flex h-full items-center justify-center text-7xl font-bold text-neutral-200">C</div>
                }
                
                {/* Wishlist Button on Image */}
                <button
                  type="button"
                  id="detail-wishlist-img-btn"
                  onClick={handleToggleWishlist}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 ${
                    isWishlisted ? "bg-white text-red-500 shadow-lg" : "bg-black/25 text-white hover:bg-white hover:text-red-500"
                  }`}
                >
                  {isWishlisted ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
                </button>

                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-black">Only {product.stock} left!</span>
                )}
                {product.stock === 0 && (
                  <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Out of Stock</span>
                )}
                {hasOffer && (
                  <span className="absolute left-4 top-14 rounded-full bg-[#ffea00] px-3 py-1 text-xs font-bold text-black">{product.discount_percent}% OFF</span>
                )}
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 0 && <div className="flex gap-3 overflow-x-auto pb-1">
                {galleryImages.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    id={`thumb-${i}`}
                    onClick={() => setSelectedThumb(i)}
                    className={`h-[90px] w-[90px] flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 ${
                      selectedThumb === i ? "border-[#4a5c3a] scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {src
                      ? <img src={src} alt={`View ${i + 1}`} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center bg-neutral-100 text-xl font-bold text-neutral-300">C</div>
                    }
                  </button>
                ))}
              </div>}
            </div>

            {/* ── Product Info ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5 lg:pt-2">
              {/* Category pill */}
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f0f4ec] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#4a5c3a]">
                {product.category.image_url ? <img src={product.category.image_url} alt="" className="h-6 w-6 rounded-full object-cover" /> : <HiMiniShoppingBag />}
                {product.category.name}
              </span>

              {/* Name */}
              <h1 className="text-4xl font-bold leading-tight tracking-[-2px] text-neutral-900">{product.name}</h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <StarRating rating={avgRating} size="text-base" />
                <span className="text-sm font-semibold text-neutral-700">{avgRating} out of 5</span>
                <span className="text-sm text-neutral-400">({MOCK_REVIEWS.length} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="flex items-center text-3xl font-extrabold tracking-tight text-neutral-900">
                  <TbCurrencyRupee className="text-[#4a5c3a]" />
                  {displayPrice.toLocaleString("en-IN")}
                </span>
                {hasOffer && <span className="text-sm text-neutral-400 line-through">Rs. {product.price.toLocaleString("en-IN")}</span>}
                {hasOffer && <span className="rounded-full bg-[#ffea00] px-2.5 py-0.5 text-xs font-bold text-black">{product.discount_percent}% OFF</span>}
              </div>

              {/* Description */}
              <p className="leading-relaxed text-neutral-500">
                {product.description || "A beautifully crafted piece designed to elevate your everyday. Made with premium materials and refined details for a truly exceptional experience."}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${product.stock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className={product.stock > 0 ? "text-emerald-700 font-medium" : "text-red-600 font-medium"}>
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-neutral-600">Qty</span>
                <div className="flex items-center gap-0 overflow-hidden rounded-full border border-neutral-200">
                  <button
                    type="button"
                    id="qty-decrease"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 transition hover:bg-neutral-100"
                  >−</button>
                  <span className="min-w-[2.5rem] text-center text-sm font-bold">{qty}</span>
                  <button
                    type="button"
                    id="qty-increase"
                    onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 transition hover:bg-neutral-100"
                  >+</button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartAdding}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 py-3.5 text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                    addedToast
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {addedToast ? (
                    <>
                      <TbCheck className="text-lg font-bold" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <HiMiniShoppingBag className="text-base" /> {cartAdding ? "Adding..." : "Add to Cart"}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  id="buy-now-btn"
                  onClick={buyNow}
                  disabled={product.stock === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#ffea00] py-3.5 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:bg-neutral-900 hover:text-[#ffea00] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Buy Now <FaArrowRight />
                </button>
                
                {/* Wishlist Button alongside CTAs */}
                <button
                  type="button"
                  id="detail-wishlist-cta-btn"
                  onClick={handleToggleWishlist}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-105 ${
                    isWishlisted
                      ? "border-red-500 bg-red-50 text-red-500 shadow-sm"
                      : "border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-black"
                  }`}
                >
                  {isWishlisted ? <FaHeart className="text-xl text-red-500" /> : <FaRegHeart className="text-xl" />}
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-2 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-5">
                {[
                  { icon: <TbTruckDelivery className="text-2xl text-[#4a5c3a]" />, label: "Easy Ordering", sub: "Simple and seamless shopping experience" },
                  { icon: <TbRefresh className="text-2xl text-[#4a5c3a]" />, label: "Exclusive Products", sub: "Discover the latest limited collections" },
                  { icon: <TbShieldCheck className="text-2xl text-[#4a5c3a]" />, label: "Secure Checkout", sub: "Safe and encrypted payments" },
                ].map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1.5 text-center">
                    {badge.icon}
                    <p className="text-xs font-bold text-neutral-800">{badge.label}</p>
                    <p className="text-[10px] leading-tight text-neutral-400">{badge.sub}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §2  FEATURE STRIP — Dark atmospheric banner
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative grid h-[380px] md:grid-cols-2">
          {/* Left panel */}
          <div className="relative overflow-hidden">
            {product.image_url
              ? <img src={product.image_url} alt="Feature detail" className="h-full w-full object-cover brightness-75" />
              : <div className="h-full bg-neutral-800" />
            }
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-2xl font-bold tracking-tight">Weather-Ready Performance</h3>
              <p className="mt-2 max-w-[280px] text-sm text-white/70 leading-relaxed">
                Engineered for the elements. Repels moisture, regulates temperature, and keeps you comfortable wherever the day takes you.
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="relative overflow-hidden">
            {product.image_url
              ? <img src={product.image_url} alt="Functional design detail" className="h-full w-full object-cover brightness-60" style={{ objectPosition: "right center" }} />
              : <div className="h-full bg-neutral-700" />
            }
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
            <div className="absolute bottom-8 right-8 text-right text-white">
              <h3 className="text-2xl font-bold tracking-tight">Functional Design</h3>
              <p className="mt-2 max-w-[280px] text-sm text-white/70 leading-relaxed">
                Every pocket, seam, and detail placed with purpose. Form meets function in a design built to perform and impress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §3  MATERIALS GRID
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f8f5] py-20">
        <div className="mx-auto max-w-[1300px] px-5">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#4a5c3a]">Crafted responsibly</span>
            <h2 className="mt-2 text-4xl font-bold tracking-[-2px] text-neutral-900">Materials that matter</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MATERIALS.map((mat) => (
              <div key={mat.name} className="group flex flex-col gap-3 rounded-3xl bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f0f4ec] text-xl text-[#4a5c3a]">{mat.icon}</span>
                <h4 className="font-bold tracking-tight text-neutral-900">{mat.name}</h4>
                <p className="text-sm leading-relaxed text-neutral-500">{mat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §4  YOU MAY ALSO LIKE / RECENTLY VIEWED
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-[1300px] px-5">
          {/* Tab header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-3xl font-bold tracking-[-1.5px] text-neutral-900">
              <button
                id="tab-you-may-like"
                type="button"
                onClick={() => setActiveReviewTab("youMayLike")}
                className={`transition-colors duration-200 ${activeReviewTab === "youMayLike" ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-500"}`}
              >
                You May Also Like
              </button>
              <span className="text-neutral-200">|</span>
              <button
                id="tab-recently-viewed"
                type="button"
                onClick={() => setActiveReviewTab("recentlyViewed")}
                className={`transition-colors duration-200 ${activeReviewTab === "recentlyViewed" ? "text-neutral-900" : "text-neutral-300 hover:text-neutral-500"}`}
              >
                Recently Viewed
              </button>
            </div>
            {/* Carousel controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="carousel-prev"
                onClick={() => scrollCarousel("left")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                <MdChevronLeft className="text-xl" />
              </button>
              <button
                type="button"
                id="carousel-next"
                onClick={() => scrollCarousel("right")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
              >
                <MdChevronRight className="text-xl" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          {displayedProducts.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-neutral-200 text-sm text-neutral-400">
              {activeReviewTab === "youMayLike" ? "No related products found." : "No recently viewed products yet."}
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayedProducts.map((p) => (
                <SmallProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §5  CUSTOMER REVIEWS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f9f8f5] py-20">
        <div className="mx-auto max-w-[1300px] px-5">
          <h2 className="mb-10 text-4xl font-bold tracking-[-2px] text-neutral-900">Customer Reviews</h2>

          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">

            {/* ── Summary Column ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">
              <div>
                <span className="text-7xl font-extrabold tracking-tighter text-neutral-900">{avgRating}</span>
                <span className="ml-1 text-lg text-neutral-400">/ 5</span>
                <div className="mt-2">
                  <StarRating rating={avgRating} size="text-xl" />
                </div>
                <p className="mt-1 text-sm text-neutral-400">Based on {MOCK_REVIEWS.length} reviews</p>
              </div>

              {/* Rating bars */}
              <div className="flex flex-col gap-2">
                {ratingBreakdown.map((row) => (
                  <div key={row.stars} className="flex items-center gap-3 text-xs">
                    <span className="w-4 font-semibold text-neutral-600">{row.stars}</span>
                    <FaStar className="text-amber-400 flex-shrink-0" />
                    <div className="relative flex-1 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-700"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-neutral-400">{row.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Write review button */}
              <button
                type="button"
                id="write-review-btn"
                className="mt-2 w-full rounded-full bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#ffea00] hover:text-black"
              >
                Write a Review
              </button>
            </div>

            {/* ── Review Cards ─────────────────────────────────────────────── */}
            <div className="flex flex-col gap-5">
              {MOCK_REVIEWS.map((review) => (
                <div key={review.id} className="group flex gap-4 rounded-3xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
                  {/* Avatar */}
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#f0f4ec] text-sm font-bold text-[#4a5c3a]">
                    {review.avatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-neutral-900">{review.name}</span>
                      {review.verified && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600">Verified</span>
                      )}
                      <span className="ml-auto text-xs text-neutral-400">{review.date}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating rating={review.rating} size="text-xs" />
                    </div>
                    <h4 className="mt-2 font-semibold text-neutral-800">{review.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-500">{review.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-xs text-neutral-400 transition hover:text-neutral-800"
                      >
                        👍 Helpful ({review.helpful})
                      </button>
                      <button
                        type="button"
                        className="text-xs text-neutral-300 transition hover:text-neutral-600"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          §6  "BE PART OF WHAT'S NEXT" — CTA Banner
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background — dark textured with product overlay */}
        <div className="relative min-h-[420px] bg-[#1a1f14]">
          {/* Faint full-bleed product image as texture */}
          {product.image_url && (
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: `url(${product.image_url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(60%)",
              }}
            />
          )}
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1f14] via-[#1a1f14]/80 to-transparent" />

          {/* Decorative floral / pattern circles */}
          <div className="absolute right-10 top-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 h-64 w-64 rounded-full bg-[#ffea00]/5 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 mx-auto flex max-w-[900px] flex-col items-center justify-center px-5 py-24 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffea00]" /> New Collection 2026
            </span>
            <h2
              className="text-5xl font-bold tracking-[-3px] text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              Be Part of<br />
              <span className="bg-gradient-to-r from-[#ffea00] via-[#cfeb00] to-[#ffea00] bg-clip-text text-transparent">
                What&apos;s Next
              </span>
            </h2>
            <p className="mt-6 max-w-[520px] text-base leading-relaxed text-white/50">
              Discover our newest drops before everyone else. Sign up and get early access to exclusive collections, limited editions, and members-only pricing.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <div className="flex overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                <input
                  id="cta-email-input"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-64 bg-transparent px-5 py-3 text-sm text-white placeholder-white/40 outline-none"
                />
                <button
                  type="button"
                  id="cta-subscribe-btn"
                  className="flex items-center gap-2 rounded-full bg-[#ffea00] px-6 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-white"
                >
                  Subscribe <FaArrowRight className="text-xs" />
                </button>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/30">No spam, ever. Unsubscribe anytime.</p>

            {/* Feature pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {["Exclusive Drops", "Members-only Deals", "Free Shipping on ₹5,000+", "Easy & Secure Checkout"].map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/50 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
