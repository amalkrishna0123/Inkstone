const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type AuthResponse = { user: { user_id: string; email: string; name: string; is_staff: boolean }; tokens: { access: string; refresh: string } };

export type Category = { id: string; name: string; slug: string; description: string; image_url: string; is_active: boolean };
export type Product = { id: string; name: string; slug: string; description: string; price: number; offer_price: number | null; discount_percent: number | null; stock: number; image_url: string; additional_image_urls: string[]; category: Category; is_active: boolean };
export type ProductDetail = Product & { related_products: Product[] };
export type WishlistItem = { id: string; product: Product; created_at: string };
export type CartItem = { id: string; product: Product; quantity: number; created_at: string };
export type Banner = { id: string; title: string; subtitle: string; image_url: string; link_url: string; starts_at: string; ends_at: string; is_active: boolean };
export type AdminUser = { user_id: string; email: string; name: string; is_staff: boolean; created_at?: string };
export type Overview = { users: number; categories: number; products: number; banners: number };

export type OrderItem = { product_id: string; name: string; price: number; quantity: number };
export type Order = {
  id: string;
  order_id: string;
  name: string;
  email: string;
  total: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  items: OrderItem[];
  attachment_url: string;
  created_at: string;
  user_id?: string;
  // Razorpay fields (returned by create_order endpoint)
  razorpay_order_id?: string;
  amount?: number;       // amount in paise
  currency?: string;
};

function extractErrorMessage(body: unknown, fallback = "Request failed"): string {
  if (!body) return fallback;
  if (typeof body === "string") return body;
  if (typeof body === "object") {
    const obj = body as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;

    const messages: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (val === null || val === undefined) continue;
      const valStr = Array.isArray(val) ? val.join(", ") : String(val);
      messages.push(key === "non_field_errors" ? valStr : `${key}: ${valStr}`);
    }
    if (messages.length > 0) return messages.join(" | ");
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const access = typeof window !== "undefined" ? localStorage.getItem("inkstone_access") : null;
  if (access) headers.set("Authorization", `Bearer ${access}`);
  const response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && retry && typeof window !== "undefined") {
    const refresh = localStorage.getItem("inkstone_refresh");
    if (refresh) {
      const refreshed = await fetch(`${API_URL}/auth/refresh/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }) });
      if (refreshed.ok) {
        const tokens = await refreshed.json();
        localStorage.setItem("inkstone_access", tokens.tokens.access);
        return request<T>(path, init, false);
      }
    }
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(extractErrorMessage(body));
  return body as T;
}

function storeAuth(result: AuthResponse) {
  localStorage.setItem("inkstone_access", result.tokens.access);
  localStorage.setItem("inkstone_refresh", result.tokens.refresh);
  localStorage.setItem("inkstone_user", JSON.stringify(result.user));
  window.dispatchEvent(new Event("inkstone-auth-change"));
  return result;
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login/", { method: "POST", body: JSON.stringify({ email, password }) }).then(storeAuth);
}

export function googleLogin(credential: string) {
  return request<AuthResponse>("/auth/google/", { method: "POST", body: JSON.stringify({ credential }) }).then(storeAuth);
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/auth/register/", { method: "POST", body: JSON.stringify({ name, email, password }) }).then(storeAuth);
}

export function logout() {
  localStorage.removeItem("inkstone_access");
  localStorage.removeItem("inkstone_refresh");
  localStorage.removeItem("inkstone_user");
  window.dispatchEvent(new Event("inkstone-auth-change"));
}

export function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("inkstone_local_wishlist") || "[]");
  } catch {
    return [];
  }
}

export function toggleLocalWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getLocalWishlist();
  const exists = list.includes(productId);
  const updated = exists ? list.filter(id => id !== productId) : [...list, productId];
  localStorage.setItem("inkstone_local_wishlist", JSON.stringify(updated));
  window.dispatchEvent(new Event("inkstone-wishlist-change"));
  return !exists;
}

export type LocalCartItem = { product: Product; quantity: number };

export function getProductPrice(product: Product): number {
  return typeof product.offer_price === "number" ? product.offer_price : product.price;
}

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("inkstone_local_cart") || "[]");
  } catch {
    return [];
  }
}

export function notifyCartAdded(productId?: string, quantity = 1) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("inkstone-cart-added", { detail: { productId, quantity } }));
}

export function notifyCartChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("inkstone-cart-change"));
}

export function addToLocalCart(product: Product, quantity = 1) {
  if (typeof window === "undefined") return;
  const cart = getLocalCart();
  const index = cart.findIndex(i => i.product.id === product.id);
  if (index >= 0) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  localStorage.setItem("inkstone_local_cart", JSON.stringify(cart));
  notifyCartChanged();
  notifyCartAdded(product.id, quantity);
}

export const api = {
  request,
  login,
  register,
  logout,
  getOverview: () => request<Overview>("/admin/overview/"),
  getUsers: () => request<AdminUser[]>("/admin/users/"),
  getCategories: () => request<Category[]>("/categories/"),
  uploadCategoryImage: (image: File) => { const data = new FormData(); data.append("image", image); return request<{ image_url: string }>("/uploads/category-image/", { method: "POST", body: data }); },
  createCategory: (data: { name: string; slug: string; description: string; image_url: string }) => request<Category>("/categories/", { method: "POST", body: JSON.stringify(data) }),
  updateCategory: (id: string, data: { name: string; slug: string; description: string; image_url: string }) => request<Category>(`/categories/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<void>(`/categories/${id}/`, { method: "DELETE" }),
  getProducts: () => request<Product[]>("/products/"),
  getProductById: (id: string) => request<ProductDetail>(`/products/public/${id}/`),
  uploadProductImage: (image: File) => { const data = new FormData(); data.append("image", image); return request<{ image_url: string }>("/uploads/product-image/", { method: "POST", body: data }); },
  createProduct: (data: { name: string; slug: string; description: string; price: number; offer_price: number | null; stock: number; image_url: string; additional_image_urls: string[]; category: string }) => request<Product>("/products/", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: { name: string; slug: string; description: string; price: number; offer_price: number | null; stock: number; image_url: string; additional_image_urls: string[]; category: string }) => request<Product>(`/products/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<void>(`/products/${id}/`, { method: "DELETE" }),
  getBanners: () => request<Banner[]>("/banners/"),
  uploadBannerImage: (image: File) => { const data = new FormData(); data.append("image", image); return request<{ image_url: string }>("/uploads/banner-image/", { method: "POST", body: data }); },
  createBanner: (data: Omit<Banner, "id" | "is_active">) => request<Banner>("/banners/", { method: "POST", body: JSON.stringify({ ...data, is_active: true }) }),
  updateBanner: (id: string, data: Omit<Banner, "id" | "is_active">) => request<Banner>(`/banners/${id}/`, { method: "PATCH", body: JSON.stringify({ ...data, is_active: true }) }),
  deleteBanner: (id: string) => request<void>(`/banners/${id}/`, { method: "DELETE" }),
  
  // Wishlist API
  getWishlist: () => request<WishlistItem[]>("/wishlist/"),
  toggleWishlist: (product_id: string) => request<{ status: "added" | "removed"; item?: WishlistItem; product_id?: string }>("/wishlist/", { method: "POST", body: JSON.stringify({ product_id }) }),
  removeFromWishlist: (item_id: string) => request<void>(`/wishlist/${item_id}/`, { method: "DELETE" }),

  // Cart API
  getCart: () => request<CartItem[]>("/cart/"),
  addToCart: (product_id: string, quantity = 1) => request<CartItem>("/cart/", { method: "POST", body: JSON.stringify({ product_id, quantity }) }).then((item) => {
    notifyCartChanged();
    notifyCartAdded(product_id, quantity);
    return item;
  }),
  updateCartItem: (item_id: string, quantity: number) => request<CartItem>(`/cart/${item_id}/`, { method: "PATCH", body: JSON.stringify({ quantity }) }).then((item) => {
    notifyCartChanged();
    return item;
  }),
  removeFromCart: (item_id: string) => request<void>(`/cart/${item_id}/`, { method: "DELETE" }).then((result) => {
    notifyCartChanged();
    return result;
  }),

  // Orders API
  uploadOrderAttachment: (image: File) => { const data = new FormData(); data.append("image", image); return request<{ image_url: string }>("/uploads/order-attachment/", { method: "POST", body: data }); },
  createOrder: (data: Partial<Order>) => request<Order & { razorpay_order_id: string; amount: number; currency: string }>("/orders/", { method: "POST", body: JSON.stringify(data) }),
  verifyPayment: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => request<{ status: string; order_id: string }>("/verify-payment/", { method: "POST", body: JSON.stringify(data) }),
  getOrders: () => request<Order[]>("/admin/orders/"),
};
