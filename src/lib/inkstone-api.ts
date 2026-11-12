import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BANNERS } from "./seed-data";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  product_type?: "custom" | "ready_stock";
  price: number;
  offer_price: number | null;
  discount_percent: number | null;
  stock: number;
  image_url: string;
  additional_image_urls: string[];
  category?: Category | null;
  is_active: boolean;
};

export type ProductDetail = Product & { related_products: Product[] };
export type WishlistItem = { id: string; product: Product; created_at: string };
export type CartItem = { id: string; product: Product; quantity: number; created_at: string };
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

export type AdminUser = {
  user_id: string;
  email: string;
  name: string;
  is_staff: boolean;
  created_at?: string;
};

export type Overview = {
  users: number;
  categories: number;
  products: number;
  banners: number;
};

export type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  min_purchase: number;
  is_active: boolean;
  valid_from?: string | null;
  valid_to?: string | null;
  created_at?: string;
};

export type Address = {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
};

export type Review = {
  id: string;
  user_id?: string;
  user_email?: string;
  user_name: string;
  product_id: string;
  order_id: string;
  rating: number;
  quality_rating: number;
  title?: string;
  comment: string;
  verified_purchase?: boolean;
  created_at?: string;
};

export type ReviewEligibility = {
  canReview: boolean;
  reason?: "not_logged_in" | "not_purchased" | "not_delivered" | "already_reviewed";
  message: string;
  order?: Order;
  existingReview?: Review;
};

export type PendingReviewItem = {
  order_id: string;
  order_db_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
};

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
  coupon_code?: string;
  discount_amount?: number;
  created_at: string;
  expected_delivery_date?: string;
  user_id?: string;
  razorpay_order_id?: string;
  amount?: number;
  currency?: string;
};

export type ScratchCard = {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  coupon_code: string;
  discount_percent: number;
  min_purchase?: number;
  event_name: string;
  is_scratched: boolean;
  scratched_at?: string;
  created_at: string;
};

type AuthResponse = {
  user: { user_id: string; email: string; name: string; is_staff: boolean };
  tokens: { access: string; refresh: string };
};

export type LocalCartItem = { product: Product; quantity: number };

// ── Helpers ──────────────────────────────────────────────────────────────────
function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(localStorage.getItem("inkstone_user") || "{}");
    return user?.user_id || auth.currentUser?.uid || null;
  } catch {
    return auth.currentUser?.uid || null;
  }
}

function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const user = JSON.parse(localStorage.getItem("inkstone_user") || "{}");
    return user?.email || auth.currentUser?.email || null;
  } catch {
    return auth.currentUser?.email || null;
  }
}

function storeAuth(user: { user_id: string; email: string; name: string; is_staff: boolean }): AuthResponse {
  const result: AuthResponse = {
    user,
    tokens: {
      access: `fb_token_${Date.now()}`,
      refresh: `fb_refresh_${Date.now()}`,
    },
  };
  if (typeof window !== "undefined") {
    localStorage.setItem("inkstone_access", result.tokens.access);
    localStorage.setItem("inkstone_refresh", result.tokens.refresh);
    localStorage.setItem("inkstone_user", JSON.stringify(result.user));

    // Store in cookie as well so Next.js middleware and server routes can verify authentication
    document.cookie = `inkstone_access=${result.tokens.access}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `inkstone_is_staff=${user.is_staff ? "true" : "false"}; path=/; max-age=604800; SameSite=Lax`;

    window.dispatchEvent(new Event("inkstone-auth-change"));
  }
  return result;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("inkstone_access"));
}

export function isStaffUser(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const user = JSON.parse(localStorage.getItem("inkstone_user") || "{}");
    return user?.is_staff === true;
  } catch {
    return false;
  }
}

export function getCurrentUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("inkstone_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Authentication ───────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();

  // Super Admin bypass / direct check for credentials in credentials.txt
  if (cleanEmail === "inkadmin@inkstone.com" && password === "12345678") {
    const superAdmin = {
      user_id: "INK-ADMIN",
      email: "inkadmin@inkstone.com",
      name: "Super Admin",
      is_staff: true,
    };
    return storeAuth(superAdmin);
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    const userData = userDoc.exists() ? userDoc.data() : null;

    const userObj = {
      user_id: userData?.user_id || cred.user.uid,
      email: cred.user.email || cleanEmail,
      name: userData?.name || cred.user.displayName || cleanEmail.split("@")[0],
      is_staff: userData?.is_staff === true,
    };

    return storeAuth(userObj);
  } catch (error: any) {
    // If not found in Auth but exists in Firestore users or is demo
    throw new Error(error.message || "Invalid email or password.");
  }
}

export async function googleLogin(): Promise<AuthResponse> {
  try {
    console.log("[Auth] Starting Google sign-in popup...");

    const res = await signInWithPopup(auth, googleProvider);
    const firebaseUser = res.user;

    console.log("[Auth] Google popup succeeded, uid:", firebaseUser.uid);

    const email = (firebaseUser.email || "").toLowerCase();
    const isSuperAdmin = email === "inkadmin@inkstone.com";

    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    let name = firebaseUser.displayName || email.split("@")[0];
    let is_staff = isSuperAdmin;
    let user_id = `INK-${firebaseUser.uid.substring(0, 8).toUpperCase()}`;

    if (snap.exists()) {
      const d = snap.data();
      name = d.name || name;
      is_staff = isSuperAdmin || d.is_staff === true;
      user_id = d.user_id || user_id;
      console.log("[Auth] Existing Firestore user loaded:", user_id);
    } else {
      // First-time Google sign-in → create Firestore user doc
      await setDoc(userRef, {
        user_id,
        email,
        name,
        is_staff,
        is_active: true,
        created_at: new Date().toISOString(),
      });
      console.log("[Auth] New Firestore user doc created:", user_id);
    }

    return storeAuth({
      user_id,
      email,
      name,
      is_staff,
    });
  } catch (err: any) {
    // Provide human-readable messages for common Firebase Auth errors
    const code: string = err?.code ?? "";
    let message = "Unable to sign in with Google.";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      message = "Sign-in was cancelled. Please try again.";
    } else if (code === "auth/popup-blocked") {
      message = "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
    } else if (code === "auth/network-request-failed") {
      message = "Network error. Please check your connection and try again.";
    } else if (err?.message) {
      message = err.message;
    }
    console.error("[Auth] Google sign-in failed:", code, err?.message);
    throw new Error(message);
  }
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user_id = `INK-${cred.user.uid.substring(0, 8).toUpperCase()}`;
    const is_staff = cleanEmail === "inkadmin@inkstone.com";

    await setDoc(doc(db, "users", cred.user.uid), {
      user_id,
      email: cleanEmail,
      name: cleanName,
      is_staff,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    return storeAuth({
      user_id,
      email: cleanEmail,
      name: cleanName,
      is_staff,
    });
  } catch (err: any) {
    if (err.code === "auth/email-already-exists") {
      throw new Error("An account with this email already exists.");
    }
    throw new Error(err.message || "Registration failed");
  }
}

export function logout(): void {
  void signOut(auth);
  if (typeof window !== "undefined") {
    localStorage.removeItem("inkstone_access");
    localStorage.removeItem("inkstone_refresh");
    localStorage.removeItem("inkstone_user");
    localStorage.removeItem("inkstone_local_cart");
    localStorage.removeItem("inkstone_local_wishlist");

    // Clear authentication cookies
    document.cookie = "inkstone_access=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "inkstone_is_staff=; path=/; max-age=0; SameSite=Lax";

    window.dispatchEvent(new Event("inkstone-auth-change"));
    window.dispatchEvent(new Event("inkstone-cart-change"));
    window.dispatchEvent(new Event("inkstone-wishlist-change"));
  }
}

// ── Local wishlist & cart ────────────────────────────────────────────────────
export function getLocalWishlist(): string[] {
  if (typeof window === "undefined") return [];
  if (!isLoggedIn()) return [];
  try {
    return JSON.parse(localStorage.getItem("inkstone_local_wishlist") || "[]");
  } catch {
    return [];
  }
}

export function toggleLocalWishlist(productId: string): boolean {
  if (typeof window === "undefined") return false;
  if (!isLoggedIn()) return false;
  const list = getLocalWishlist();
  const exists = list.includes(productId);
  const updated = exists ? list.filter((id) => id !== productId) : [...list, productId];
  localStorage.setItem("inkstone_local_wishlist", JSON.stringify(updated));
  window.dispatchEvent(new Event("inkstone-wishlist-change"));
  return !exists;
}

export function getProductPrice(product: Product): number {
  return typeof product.offer_price === "number" ? product.offer_price : product.price;
}

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  if (!isLoggedIn()) return [];
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
  // Security guard: cart items CANNOT be added if user is not logged in
  if (!isLoggedIn()) {
    console.warn("[Cart Security] Blocked adding item to cart: user is not logged in.");
    return;
  }
  const cart = getLocalCart();
  const index = cart.findIndex((i) => i.product.id === product.id);
  if (index >= 0) {
    cart[index].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  localStorage.setItem("inkstone_local_cart", JSON.stringify(cart));
  notifyCartChanged();
  notifyCartAdded(product.id, quantity);
}

// ── Cloudinary Media Upload Helper ───────────────────────────────────────────
// Uploads media to Cloudinary through the /api/upload endpoint.
async function uploadMediaToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const res = await fetch("/api/upload", { method: "POST", body: formData });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `Upload failed with status ${res.status}.` }));
    throw new Error((err as { error: string }).error || "Cloudinary upload failed.");
  }

  const data = (await res.json()) as { image_url: string };
  return data.image_url;
}

// ── Memory cache for fast SSR / fallback ─────────────────────────────────────
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryProducts: Product[] = [];
let memoryBanners: Banner[] = [...INITIAL_BANNERS];

function hydrateMemoryProducts() {
  if (memoryProducts.length === 0) {
    memoryProducts = INITIAL_PRODUCTS.map((p) => {
      const cat = memoryCategories.find((c) => c.id === p.category_id) || null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        product_type: p.product_type,
        price: p.price,
        offer_price: p.offer_price,
        discount_percent: p.discount_percent,
        stock: p.stock,
        image_url: p.image_url,
        additional_image_urls: p.additional_image_urls,
        category: cat,
        is_active: p.is_active,
      };
    });
  }
}
hydrateMemoryProducts();

// ── Primary API Object ───────────────────────────────────────────────────────
export const api = {
  request: async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const res = await fetch(path, init);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.message || "Request failed");
    }
    return (await res.json()) as T;
  },

  login,
  register,
  logout,

  // ── Overview ────────────────────────────────────────────────────────────────
  getOverview: async (): Promise<Overview> => {
    try {
      const [uSnap, cSnap, pSnap, bSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "categories")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "banners")),
      ]);
      return {
        users: Math.max(uSnap.size, 1),
        categories: Math.max(cSnap.size, memoryCategories.length),
        products: Math.max(pSnap.size, memoryProducts.length),
        banners: Math.max(bSnap.size, memoryBanners.length),
      };
    } catch {
      return {
        users: 1,
        categories: memoryCategories.length,
        products: memoryProducts.length,
        banners: memoryBanners.length,
      };
    }
  },

  // ── Admin Users ─────────────────────────────────────────────────────────────
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const snap = await getDocs(collection(db, "users"));
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const data = d.data();
          return {
            user_id: data.user_id || d.id,
            email: data.email || "",
            name: data.name || "",
            is_staff: data.is_staff === true,
            created_at: data.created_at || new Date().toISOString(),
          };
        });
      }
    } catch (err) {
      console.warn("Firestore getUsers warning:", err);
    }
    return [
      {
        user_id: "INK-ADMIN",
        email: "inkadmin@inkstone.com",
        name: "Super Admin",
        is_staff: true,
        created_at: new Date().toISOString(),
      },
    ];
  },

  // ── Categories ──────────────────────────────────────────────────────────────
  getCategories: async (): Promise<Category[]> => {
    try {
      const snap = await getDocs(collection(db, "categories"));
      if (!snap.empty) {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Category))
          .filter((c) => c.is_active !== false);
        if (items.length > 0) {
          memoryCategories = items;
          return items;
        }
      }
    } catch (err) {
      console.warn("Firestore getCategories warning:", err);
    }
    return memoryCategories.filter((c) => c.is_active !== false);
  },

  uploadCategoryImage: async (image: File): Promise<{ image_url: string }> => {
    const url = await uploadMediaToCloudinary(image, "category-images");
    return { image_url: url };
  },

  createCategory: async (data: {
    name: string;
    slug: string;
    description: string;
    image_url: string;
  }): Promise<Category> => {
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description || "",
      image_url: data.image_url || "",
      is_active: true,
    };
    try {
      const ref = await addDoc(collection(db, "categories"), {
        ...newCat,
        createdAt: serverTimestamp(),
      });
      newCat.id = ref.id;
    } catch (err) {
      console.warn("Firestore createCategory fallback to memory:", err);
    }
    memoryCategories.push(newCat);
    return newCat;
  },

  updateCategory: async (
    id: string,
    data: { name: string; slug: string; description: string; image_url: string }
  ): Promise<Category> => {
    try {
      await updateDoc(doc(db, "categories", id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn("Firestore updateCategory fallback:", err);
    }
    const idx = memoryCategories.findIndex((c) => c.id === id);
    if (idx >= 0) {
      memoryCategories[idx] = { ...memoryCategories[idx], ...data };
      return memoryCategories[idx];
    }
    return { id, is_active: true, ...data };
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "categories", id));
    } catch (err) {
      console.warn("Firestore deleteCategory fallback:", err);
    }
    memoryCategories = memoryCategories.filter((c) => c.id !== id);
  },

  // ── Products ────────────────────────────────────────────────────────────────
  getProducts: async (params?: { category?: string; product_type?: "custom" | "ready_stock" }): Promise<Product[]> => {
    try {
      const snap = await getDocs(collection(db, "products"));
      if (!snap.empty) {
        const cats = await api.getCategories();
        const items = snap.docs.map((d) => {
          const data = d.data();
          const cat = cats.find((c) => c.id === data.categoryId || c.slug === data.categoryId) || null;
          return {
            id: d.id,
            name: data.name,
            slug: data.slug,
            description: data.description || "",
            product_type: data.product_type || "custom",
            price: Number(data.price) || 0,
            offer_price: data.offer_price !== null && data.offer_price !== undefined ? Number(data.offer_price) : null,
            discount_percent: data.discount_percent ?? null,
            stock: Number(data.stock) || 0,
            image_url: data.image_url || "",
            additional_image_urls: data.additional_image_urls || [],
            category: cat,
            is_active: data.is_active !== false,
          } as Product;
        }).filter((p) => p.is_active !== false);

        if (items.length > 0) {
          memoryProducts = items;
        }
      }
    } catch (err) {
      console.warn("Firestore getProducts warning:", err);
    }

    hydrateMemoryProducts();
    let result = memoryProducts.filter((p) => p.is_active !== false);
    if (params?.category) {
      result = result.filter(
        (p) => p.category?.id === params.category || p.category?.slug === params.category
      );
    }
    if (params?.product_type) {
      result = result.filter((p) => p.product_type === params.product_type);
    }
    return result;
  },

  getProductById: async (id: string): Promise<ProductDetail> => {
    const all = await api.getProducts();
    const product = all.find((p) => p.id === id || p.slug === id);
    if (!product) {
      throw new Error("Product not found");
    }
    const related = all
      .filter((p) => p.id !== product.id && (p.category?.id === product.category?.id || p.product_type === product.product_type))
      .slice(0, 8);
    return { ...product, related_products: related };
  },

  uploadProductImage: async (image: File): Promise<{ image_url: string }> => {
    const url = await uploadMediaToCloudinary(image, "product-images");
    return { image_url: url };
  },

  createProduct: async (data: {
    name: string;
    slug: string;
    description: string;
    price: number;
    offer_price: number | null;
    stock: number;
    image_url: string;
    additional_image_urls: string[];
    category?: string | null;
    product_type?: "custom" | "ready_stock";
  }): Promise<Product> => {
    const cats = await api.getCategories();
    const cat = cats.find((c) => c.id === data.category || c.slug === data.category) || null;
    const discount =
      data.offer_price && data.offer_price < data.price
        ? Math.round(((data.price - data.offer_price) / data.price) * 100)
        : null;

    const newProd: Product = {
      id: `prod_${Date.now()}`,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description || "",
      product_type: data.product_type || "custom",
      price: data.price,
      offer_price: data.offer_price,
      discount_percent: discount,
      stock: data.stock,
      image_url: data.image_url,
      additional_image_urls: data.additional_image_urls || [],
      category: cat,
      is_active: true,
    };

    try {
      const ref = await addDoc(collection(db, "products"), {
        ...newProd,
        categoryId: cat?.id || null,
        createdAt: serverTimestamp(),
      });
      newProd.id = ref.id;
    } catch (err) {
      console.warn("Firestore createProduct fallback to memory:", err);
    }
    memoryProducts.unshift(newProd);
    return newProd;
  },

  updateProduct: async (
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      price: number;
      offer_price: number | null;
      stock: number;
      image_url: string;
      additional_image_urls: string[];
      category?: string | null;
      product_type?: "custom" | "ready_stock";
    }>
  ): Promise<Product> => {
    const cats = await api.getCategories();
    const cat = data.category ? cats.find((c) => c.id === data.category || c.slug === data.category) || null : undefined;

    try {
      const updatePayload: Record<string, any> = { ...data, updatedAt: serverTimestamp() };
      if (cat !== undefined) updatePayload.categoryId = cat?.id || null;
      await updateDoc(doc(db, "products", id), updatePayload);
    } catch (err) {
      console.warn("Firestore updateProduct fallback:", err);
    }

    const idx = memoryProducts.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const current = memoryProducts[idx];
      const price = data.price !== undefined ? data.price : current.price;
      const offerPrice = data.offer_price !== undefined ? data.offer_price : current.offer_price;
      const discount =
        offerPrice && offerPrice < price ? Math.round(((price - offerPrice) / price) * 100) : null;

      memoryProducts[idx] = {
        ...current,
        ...data,
        price,
        offer_price: offerPrice,
        discount_percent: discount,
        category: cat !== undefined ? cat : current.category,
      };
      return memoryProducts[idx];
    }
    return { id, is_active: true, ...data } as Product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      console.warn("Firestore deleteProduct fallback:", err);
    }
    memoryProducts = memoryProducts.filter((p) => p.id !== id);
  },

  // ── Banners ─────────────────────────────────────────────────────────────────
  getBanners: async (): Promise<Banner[]> => {
    try {
      const snap = await getDocs(collection(db, "banners"));
      if (!snap.empty) {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Banner))
          .filter((b) => b.is_active !== false);
        if (items.length > 0) {
          memoryBanners = items;
          return items;
        }
      }
    } catch (err) {
      console.warn("Firestore getBanners warning:", err);
    }
    return memoryBanners.filter((b) => b.is_active !== false);
  },

  uploadBannerImage: async (image: File): Promise<{ image_url: string }> => {
    const url = await uploadMediaToCloudinary(image, "banner-images");
    return { image_url: url };
  },

  createBanner: async (data: Omit<Banner, "id" | "is_active">): Promise<Banner> => {
    const banner: Banner = {
      id: `banner_${Date.now()}`,
      ...data,
      is_active: true,
    };
    try {
      const ref = await addDoc(collection(db, "banners"), {
        ...banner,
        createdAt: serverTimestamp(),
      });
      banner.id = ref.id;
    } catch (err) {
      console.warn("Firestore createBanner fallback to memory:", err);
    }
    memoryBanners.push(banner);
    return banner;
  },

  updateBanner: async (id: string, data: Omit<Banner, "id" | "is_active">): Promise<Banner> => {
    try {
      await updateDoc(doc(db, "banners", id), { ...data, updatedAt: serverTimestamp() });
    } catch (err) {
      console.warn("Firestore updateBanner fallback:", err);
    }
    const idx = memoryBanners.findIndex((b) => b.id === id);
    if (idx >= 0) {
      memoryBanners[idx] = { ...memoryBanners[idx], ...data };
      return memoryBanners[idx];
    }
    return { id, is_active: true, ...data };
  },

  deleteBanner: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "banners", id));
    } catch (err) {
      console.warn("Firestore deleteBanner fallback:", err);
    }
    memoryBanners = memoryBanners.filter((b) => b.id !== id);
  },

  // ── Wishlist ────────────────────────────────────────────────────────────────
  getWishlist: async (): Promise<WishlistItem[]> => {
    const uid = getCurrentUserId();
    const products = await api.getProducts();

    if (uid) {
      try {
        const snap = await getDocs(collection(db, "users", uid, "wishlist"));
        if (!snap.empty) {
          const items: WishlistItem[] = [];
          for (const d of snap.docs) {
            const data = d.data();
            const prod = products.find((p) => p.id === data.product_id);
            if (prod) {
              items.push({ id: d.id, product: prod, created_at: data.created_at || new Date().toISOString() });
            }
          }
          return items;
        }
      } catch (err) {
        console.warn("Firestore getWishlist fallback to local:", err);
      }
    }

    const localIds = getLocalWishlist();
    return localIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p))
      .map((p) => ({ id: `wish_${p.id}`, product: p, created_at: new Date().toISOString() }));
  },

  toggleWishlist: async (
    product_id: string
  ): Promise<{ status: "added" | "removed"; item?: WishlistItem; product_id?: string }> => {
    const uid = getCurrentUserId();
    const isAdded = toggleLocalWishlist(product_id);

    if (uid) {
      try {
        const colRef = collection(db, "users", uid, "wishlist");
        const q = query(colRef, where("product_id", "==", product_id));
        const snap = await getDocs(q);

        if (!snap.empty) {
          await deleteDoc(doc(db, "users", uid, "wishlist", snap.docs[0].id));
          return { status: "removed", product_id };
        } else {
          const ref = await addDoc(colRef, { product_id, created_at: new Date().toISOString() });
          const prod = (await api.getProducts()).find((p) => p.id === product_id);
          if (prod) {
            return {
              status: "added",
              item: { id: ref.id, product: prod, created_at: new Date().toISOString() },
            };
          }
        }
      } catch (err) {
        console.warn("Firestore toggleWishlist fallback:", err);
      }
    }

    if (!isAdded) return { status: "removed", product_id };
    const prod = (await api.getProducts()).find((p) => p.id === product_id);
    return {
      status: "added",
      item: prod ? { id: `wish_${prod.id}`, product: prod, created_at: new Date().toISOString() } : undefined,
    };
  },

  removeFromWishlist: async (item_id: string): Promise<void> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        await deleteDoc(doc(db, "users", uid, "wishlist", item_id));
      } catch (err) {
        console.warn("Firestore removeFromWishlist fallback:", err);
      }
    }
  },

  // ── Cart ────────────────────────────────────────────────────────────────────
  getCart: async (): Promise<CartItem[]> => {
    const uid = getCurrentUserId();
    const products = await api.getProducts();

    if (uid) {
      try {
        const snap = await getDocs(collection(db, "users", uid, "cart"));
        if (!snap.empty) {
          const items: CartItem[] = [];
          for (const d of snap.docs) {
            const data = d.data();
            const prod = products.find((p) => p.id === data.product_id);
            if (prod) {
              items.push({
                id: d.id,
                product: prod,
                quantity: data.quantity || 1,
                created_at: data.created_at || new Date().toISOString(),
              });
            }
          }
          return items;
        }
      } catch (err) {
        console.warn("Firestore getCart fallback to local:", err);
      }
    }

    const localCart = getLocalCart();
    return localCart.map((item, idx) => ({
      id: `cart_${item.product.id || idx}`,
      product: item.product,
      quantity: item.quantity,
      created_at: new Date().toISOString(),
    }));
  },

  addToCart: async (product_id: string, quantity = 1): Promise<CartItem> => {
    if (!isLoggedIn()) {
      throw new Error("Please log in to add items to your cart.");
    }
    const uid = getCurrentUserId();
    const products = await api.getProducts();
    const product = products.find((p) => p.id === product_id);
    if (!product) throw new Error("Product not found");

    addToLocalCart(product, quantity);

    if (uid) {
      try {
        const cartRef = collection(db, "users", uid, "cart");
        const q = query(cartRef, where("product_id", "==", product_id));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const curDoc = snap.docs[0];
          const newQty = (curDoc.data().quantity || 1) + quantity;
          await updateDoc(doc(db, "users", uid, "cart", curDoc.id), {
            quantity: newQty,
            updated_at: new Date().toISOString(),
          });
          return {
            id: curDoc.id,
            product,
            quantity: newQty,
            created_at: curDoc.data().created_at || new Date().toISOString(),
          };
        } else {
          const ref = await addDoc(cartRef, {
            product_id,
            quantity,
            created_at: new Date().toISOString(),
          });
          return { id: ref.id, product, quantity, created_at: new Date().toISOString() };
        }
      } catch (err) {
        console.warn("Firestore addToCart fallback:", err);
      }
    }

    return { id: `cart_${product.id}`, product, quantity, created_at: new Date().toISOString() };
  },

  updateCartItem: async (item_id: string, quantity: number): Promise<CartItem> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        const itemRef = doc(db, "users", uid, "cart", item_id);
        if (quantity <= 0) {
          await deleteDoc(itemRef);
        } else {
          await updateDoc(itemRef, { quantity, updated_at: new Date().toISOString() });
        }
      } catch (err) {
        console.warn("Firestore updateCartItem fallback:", err);
      }
    }

    if (typeof window !== "undefined") {
      const local = getLocalCart();
      const updated = local
        .map((i) => (i.product.id === item_id || `cart_${i.product.id}` === item_id ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0);
      localStorage.setItem("inkstone_local_cart", JSON.stringify(updated));
      notifyCartChanged();
    }

    const prod = (await api.getProducts())[0] || ({} as Product);
    return { id: item_id, product: prod, quantity, created_at: new Date().toISOString() };
  },

  removeFromCart: async (item_id: string): Promise<void> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        await deleteDoc(doc(db, "users", uid, "cart", item_id));
      } catch (err) {
        console.warn("Firestore removeFromCart fallback:", err);
      }
    }

    if (typeof window !== "undefined") {
      const local = getLocalCart();
      const updated = local.filter((i) => i.product.id !== item_id && `cart_${i.product.id}` !== item_id);
      localStorage.setItem("inkstone_local_cart", JSON.stringify(updated));
      notifyCartChanged();
    }
  },

  // ── Orders & Payments ───────────────────────────────────────────────────────
  uploadOrderAttachment: async (image: File): Promise<{ image_url: string }> => {
    const url = await uploadMediaToCloudinary(image, "order-attachments");
    return { image_url: url };
  },

  createOrder: async (
    data: Partial<Order>
  ): Promise<Order & { razorpay_order_id: string; amount: number; currency: string }> => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("POST /api/orders failed, using direct Firestore creation:", err);
    }

    // Direct Firestore fallback
    const totalINR = Number(data.total || 0);
    const amountPaise = Math.round(totalINR * 100);
    const orderId = `CR-${Math.random().toString(16).substring(2, 8).toUpperCase()}`;
    const rzOrderId = "";

    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const expectedDeliveryDateISO = deliveryDate.toISOString();

    const orderObj: any = {
      order_id: orderId,
      name: data.name || "",
      email: data.email || "",
      total: totalINR,
      status: "Pending",
      payment_method: data.payment_method || "Razorpay",
      shipping_address: data.shipping_address || "",
      items: data.items || [],
      attachment_url: data.attachment_url || "",
      coupon_code: data.coupon_code || "",
      discount_amount: data.discount_amount || 0,
      created_at: now.toISOString(),
      expected_delivery_date: expectedDeliveryDateISO,
      user_id: data.user_id || getCurrentUserId() || null,
      razorpay_order_id: rzOrderId,
      amount: amountPaise,
      currency: "INR",
    };

    try {
      const ref = await addDoc(collection(db, "orders"), orderObj);
      orderObj.id = ref.id;
    } catch {
      orderObj.id = orderId;
    }

    return orderObj;
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ status: string; order_id: string }> => {
    try {
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("POST /api/verify-payment failed, updating Firestore directly:", err);
    }

    try {
      const q = query(collection(db, "orders"), where("razorpay_order_id", "==", data.razorpay_order_id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "orders", snap.docs[0].id), {
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature: data.razorpay_signature,
          status: "Paid",
        });
        return { status: "success", order_id: snap.docs[0].data().order_id || snap.docs[0].id };
      }
    } catch (err) {
      console.warn("Firestore verifyPayment fallback error:", err);
    }

    return { status: "success", order_id: data.razorpay_order_id };
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const snap = await getDocs(collection(db, "orders"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      }
    } catch (err) {
      console.warn("Firestore getOrders warning:", err);
    }
    return [];
  },

  getMyOrders: async (): Promise<Order[]> => {
    const uid = getCurrentUserId();
    const email = getCurrentUserEmail();
    try {
      const allOrders = await api.getOrders();
      return allOrders.filter(
        (o) => (uid && o.user_id === uid) || (email && o.email?.toLowerCase() === email.toLowerCase())
      );
    } catch {
      return [];
    }
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, { status });
      const snap = await getDoc(docRef);
      return { id: snap.id, ...snap.data() } as Order;
    } catch {
      // Find by order_id field
      const q = query(collection(db, "orders"), where("order_id", "==", orderId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, "orders", snap.docs[0].id), { status });
        return { id: snap.docs[0].id, ...snap.docs[0].data(), status } as Order;
      }
    }
    return { id: orderId, order_id: orderId, status } as Order;
  },

  // ── Coupons ─────────────────────────────────────────────────────────────────
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const snap = await getDocs(collection(db, "coupons"));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
      }
    } catch (err) {
      console.warn("Firestore getCoupons warning:", err);
    }
    return [];
  },

  createCoupon: async (data: Omit<Coupon, "id" | "created_at">): Promise<Coupon> => {
    const coupon: Coupon = {
      id: `cpn_${Date.now()}`,
      ...data,
      code: data.code.trim().toUpperCase(),
      created_at: new Date().toISOString(),
    };
    try {
      const ref = await addDoc(collection(db, "coupons"), coupon);
      coupon.id = ref.id;
    } catch (err) {
      console.warn("Firestore createCoupon fallback:", err);
    }
    return coupon;
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<Coupon> => {
    try {
      await updateDoc(doc(db, "coupons", id), data);
    } catch (err) {
      console.warn("Firestore updateCoupon fallback:", err);
    }
    return { id, ...data } as Coupon;
  },

  deleteCoupon: async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "coupons", id));
    } catch (err) {
      console.warn("Firestore deleteCoupon fallback:", err);
    }
  },

  validateCoupon: async (
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; code: string; discount_percent: number; discount_amount: number; min_purchase: number }> => {
    const cleanCode = code.trim().toUpperCase();
    const coupons = await api.getCoupons();
    const coupon = coupons.find((c) => c.code === cleanCode && c.is_active !== false);

    if (!coupon) {
      throw new Error("Invalid or inactive coupon code.");
    }

    const now = new Date();
    if (coupon.valid_from && now < new Date(coupon.valid_from)) {
      throw new Error("This coupon is not active yet.");
    }
    if (coupon.valid_to && now > new Date(coupon.valid_to)) {
      throw new Error("This coupon has expired.");
    }
    if (subtotal < coupon.min_purchase) {
      throw new Error(`Minimum order amount for this coupon is Rs. ${coupon.min_purchase.toFixed(2)}`);
    }

    const discountAmount = Math.round(((subtotal * coupon.discount_percent) / 100) * 100) / 100;
    return {
      valid: true,
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      discount_amount: discountAmount,
      min_purchase: coupon.min_purchase,
    };
  },

  // ── Customer Addresses ───────────────────────────────────────────────────────
  getAddresses: async (): Promise<Address[]> => {
    const uid = getCurrentUserId();
    if (!uid) return [];
    try {
      const snap = await getDocs(collection(db, "users", uid, "addresses"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Address));
    } catch (err) {
      console.warn("Firestore getAddresses warning:", err);
      return [];
    }
  },

  createAddress: async (data: Omit<Address, "id" | "created_at">): Promise<Address> => {
    const uid = getCurrentUserId();
    const addr: Address = {
      id: `addr_${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
    };
    if (uid) {
      try {
        const ref = await addDoc(collection(db, "users", uid, "addresses"), addr);
        addr.id = ref.id;
      } catch (err) {
        console.warn("Firestore createAddress fallback:", err);
      }
    }
    return addr;
  },

  updateAddress: async (id: string, data: Partial<Address>): Promise<Address> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        await updateDoc(doc(db, "users", uid, "addresses", id), data);
      } catch (err) {
        console.warn("Firestore updateAddress fallback:", err);
      }
    }
    return { id, ...data } as Address;
  },

  deleteAddress: async (id: string): Promise<void> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        await deleteDoc(doc(db, "users", uid, "addresses", id));
      } catch (err) {
        console.warn("Firestore deleteAddress fallback:", err);
      }
    }
  },

  setDefaultAddress: async (id: string): Promise<Address> => {
    const uid = getCurrentUserId();
    if (uid) {
      try {
        const snap = await getDocs(collection(db, "users", uid, "addresses"));
        for (const d of snap.docs) {
          await updateDoc(doc(db, "users", uid, "addresses", d.id), { is_default: d.id === id });
        }
      } catch (err) {
        console.warn("Firestore setDefaultAddress fallback:", err);
      }
    }
    return { id, is_default: true } as Address;
  },

  // ── Product Reviews ──────────────────────────────────────────────────────────
  getProductReviews: async (
    productId: string
  ): Promise<{ reviews: Review[]; total: number; average_rating: number; average_quality_rating: number }> => {
    try {
      const q = query(collection(db, "reviews"), where("product_id", "==", productId));
      const snap = await getDocs(q);
      const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
      // Sort newest first
      reviews.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      const count = reviews.length;
      const avgRating = count > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
      const avgQuality =
        count > 0 ? Math.round((reviews.reduce((s, r) => s + r.quality_rating, 0) / count) * 10) / 10 : 0;
      return { reviews, total: count, average_rating: avgRating, average_quality_rating: avgQuality };
    } catch {
      return { reviews: [], total: 0, average_rating: 0, average_quality_rating: 0 };
    }
  },

  createReview: async (data: {
    order_id: string;
    product_id: string;
    rating: number;
    quality_rating: number;
    title?: string;
    comment?: string;
  }): Promise<Review> => {
    const user = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("inkstone_user") || "{}" : "{}");
    const uid = getCurrentUserId() || user?.id || user?.user_id || auth.currentUser?.uid || "";
    const email = getCurrentUserEmail() || user?.email || auth.currentUser?.email || "";
    const userName = user?.name || user?.displayName || auth.currentUser?.displayName || "Verified Customer";

    const review: Review = {
      id: `rev_${Date.now()}`,
      user_id: uid,
      user_email: email,
      user_name: userName,
      product_id: data.product_id,
      order_id: data.order_id,
      rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
      quality_rating: Math.max(1, Math.min(5, Number(data.quality_rating) || 5)),
      title: data.title ? data.title.trim() : "",
      comment: data.comment ? data.comment.trim() : "",
      verified_purchase: true,
      created_at: new Date().toISOString(),
    };
    try {
      const ref = await addDoc(collection(db, "reviews"), review);
      review.id = ref.id;
    } catch (err) {
      console.warn("Firestore createReview fallback:", err);
    }
    return review;
  },

  canUserReviewProduct: async (
    productId: string
  ): Promise<ReviewEligibility> => {
    if (!isLoggedIn()) {
      return {
        canReview: false,
        reason: "not_logged_in",
        message: "Sign in to leave a review. Verified customer reviews can only be submitted after product delivery.",
      };
    }

    const uid = getCurrentUserId();
    const email = getCurrentUserEmail();

    try {
      // 1. Fetch user orders
      let userOrders = await api.getMyOrders();

      // If userOrders is empty, also check fallback stored demo orders
      if (userOrders.length === 0 && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("crystal_demo_orders");
          if (stored) {
            userOrders = JSON.parse(stored);
          }
        } catch { /* ignore */ }
      }

      // Check if user has orders containing this product
      const matchingOrders = userOrders.filter((order) =>
        (order.items || []).some((item: any) =>
          item.product_id === productId ||
          item.id === productId ||
          (item.name && item.name.toLowerCase().trim() === productId.toLowerCase().trim())
        )
      );

      if (matchingOrders.length === 0) {
        return {
          canReview: false,
          reason: "not_purchased",
          message: "Verified buyer exclusive: You can only review products you have purchased and received.",
        };
      }

      // Check if any matching order has status 'Delivered'
      const deliveredOrder = matchingOrders.find(
        (order) => (order.status || "").toLowerCase().trim() === "delivered"
      );

      if (!deliveredOrder) {
        const currentStatus = matchingOrders[0]?.status || "Processing";
        return {
          canReview: false,
          reason: "not_delivered",
          message: `Your order is currently "${currentStatus}". You can write a review once your product has been delivered.`,
          order: matchingOrders[0],
        };
      }

      // 2. Check if already reviewed in Firestore
      const reviewSnap = await getDocs(
        query(collection(db, "reviews"), where("product_id", "==", productId))
      );
      const existing = reviewSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Review))
        .find(
          (r) =>
            (uid && r.user_id === uid) ||
            (email && r.user_email && r.user_email.toLowerCase() === email.toLowerCase()) ||
            r.order_id === deliveredOrder.order_id ||
            r.order_id === deliveredOrder.id
        );

      if (existing) {
        return {
          canReview: false,
          reason: "already_reviewed",
          message: "You have already reviewed this product. Thank you for your feedback!",
          order: deliveredOrder,
          existingReview: existing,
        };
      }

      return {
        canReview: true,
        message: "You are verified to review this delivered product.",
        order: deliveredOrder,
      };
    } catch (err) {
      console.warn("canUserReviewProduct error:", err);
      return {
        canReview: false,
        reason: "not_purchased",
        message: "Could not verify purchase status.",
      };
    }
  },

  getPendingReviews: async (): Promise<PendingReviewItem[]> => {
    const orders = await api.getMyOrders();
    const delivered = orders.filter((o) => (o.status || "").toLowerCase() === "delivered");
    const pending: PendingReviewItem[] = [];

    for (const order of delivered) {
      for (const item of order.items || []) {
        pending.push({
          order_id: order.order_id,
          order_db_id: order.id,
          product_id: item.product_id,
          product_name: item.name,
          product_image: "",
          price: item.price,
        });
      }
    }
    return pending;
  },

  // ── Scratch Cards ───────────────────────────────────────────────────────────
  getMyScratchCards: async (): Promise<ScratchCard[]> => {
    const uid = getCurrentUserId();
    const email = getCurrentUserEmail()?.toLowerCase();
    try {
      const snap = await getDocs(collection(db, "scratch_cards"));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as ScratchCard))
        .filter((c) => (uid && c.user_id === uid) || (email && c.user_email?.toLowerCase() === email));
    } catch (err) {
      console.warn("Firestore getMyScratchCards warning:", err);
      return [];
    }
  },

  getAllScratchCards: async (): Promise<ScratchCard[]> => {
    try {
      const snap = await getDocs(collection(db, "scratch_cards"));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScratchCard));
    } catch {
      return [];
    }
  },

  claimScratchCard: async (cardId: string): Promise<{ coupon_code: string; discount_percent: number }> => {
    const docRef = doc(db, "scratch_cards", cardId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      throw new Error("Scratch card not found.");
    }
    const cardData = snap.data() as ScratchCard;
    const now = new Date().toISOString();

    await updateDoc(docRef, {
      is_scratched: true,
      scratched_at: now,
    });

    // Ensure coupon is in active coupons collection
    try {
      const q = query(collection(db, "coupons"), where("code", "==", cardData.coupon_code));
      const cSnap = await getDocs(q);
      if (cSnap.empty) {
        await addDoc(collection(db, "coupons"), {
          code: cardData.coupon_code,
          discount_percent: cardData.discount_percent,
          min_purchase: cardData.min_purchase || 0,
          is_active: true,
          user_email: cardData.user_email || null,
          is_scratch_card: true,
          event_name: cardData.event_name,
          created_at: now,
        });
      }
    } catch { /* ignore */ }

    return {
      coupon_code: cardData.coupon_code,
      discount_percent: cardData.discount_percent,
    };
  },

  adminAwardScratchCard: async (data: {
    user_id: string;
    user_email?: string;
    user_name?: string;
    discount_percent: number;
    event_name: string;
  }): Promise<ScratchCard> => {
    const promoCode = `${(data.event_name || "GIFT").replace(/[^a-zA-Z0-9]/g, "").substring(0, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const now = new Date().toISOString();

    const card: ScratchCard = {
      id: `sc_${Date.now()}`,
      user_id: data.user_id,
      user_email: (data.user_email || "").toLowerCase(),
      user_name: data.user_name || "Customer",
      coupon_code: promoCode,
      discount_percent: Number(data.discount_percent) || 20,
      min_purchase: 0,
      event_name: data.event_name || "Festival Promotional Reward",
      is_scratched: false,
      created_at: now,
    };

    const ref = await addDoc(collection(db, "scratch_cards"), card);
    card.id = ref.id;

    // Register coupon code in coupons collection
    await addDoc(collection(db, "coupons"), {
      code: promoCode,
      discount_percent: card.discount_percent,
      min_purchase: 0,
      is_active: true,
      user_email: card.user_email,
      is_scratch_card: true,
      event_name: card.event_name,
      created_at: now,
    });

    return card;
  },

  adminAwardScratchCardToAll: async (data: {
    discount_percent: number;
    event_name: string;
  }): Promise<number> => {
    const users = await api.getUsers();
    let count = 0;
    for (const u of users) {
      if (u.user_id) {
        await api.adminAwardScratchCard({
          user_id: u.user_id,
          user_email: u.email,
          user_name: u.name,
          discount_percent: data.discount_percent,
          event_name: data.event_name,
        });
        count++;
      }
    }
    return count;
  },

  sendPromotionalEmail: async (data: {
    to: string;
    customer_name?: string;
    subject: string;
    title: string;
    message: string;
    coupon_code?: string;
    discount_percent?: number;
    banner_url?: string;
    cta_url?: string;
  }) => {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "promotional", data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send promotional email.");
    }
    return await res.json();
  },

  sendBatchPromotionalEmail: async (data: {
    recipients: Array<{ email: string; name?: string }>;
    subject: string;
    title: string;
    message: string;
    coupon_code?: string;
    discount_percent?: number;
    banner_url?: string;
    cta_url?: string;
  }) => {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "batch_promotional", data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to send batch promotional email.");
    }
    return await res.json();
  },

  getSentEmails: async (): Promise<any[]> => {
    try {
      const q = query(collection(db, "sent_emails"), orderBy("createdAtTimestamp", "desc"), limit(50));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      const fallbackSnap = await getDocs(collection(db, "sent_emails"));
      return fallbackSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.warn("Firestore getSentEmails fallback:", err);
      return [];
    }
  },
};
