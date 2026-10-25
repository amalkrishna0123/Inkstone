"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiActivity, FiBarChart2, FiBell, FiChevronRight, FiCreditCard, FiFileText, FiImage, FiLayers, FiLogOut, FiMenu, FiMessageCircle, FiPackage, FiRefreshCw, FiSettings, FiShoppingBag, FiTag, FiTruck, FiUsers, FiX } from "react-icons/fi";
import { AdminUser, api, Banner, Category, Overview, Product, Order } from "@/src/lib/inkstone-api";

type Tab = "overview" | "products" | "categories" | "orders" | "users" | "marketing" | "messages" | "transactions" | "wallet" | "coupon" | "reports" | "shipping" | "settings" | "banners";
type NavigationItem = { id: Tab; label: string; icon: React.ReactNode };
const allTabIds: Tab[] = ["overview", "products", "categories", "orders", "users", "marketing", "messages", "transactions", "wallet", "coupon", "reports", "shipping", "settings", "banners"];
const navigationGroups: { label: string; items: NavigationItem[] }[] = [
  { label: "Store", items: [{ id: "products", label: "Product", icon: <FiPackage /> }, { id: "categories", label: "Categories", icon: <FiLayers /> }, { id: "orders", label: "Orders", icon: <FiFileText /> }, { id: "users", label: "Customers", icon: <FiUsers /> }] },
  { label: "Marketing", items: [{ id: "marketing", label: "Marketing", icon: <FiBarChart2 /> }, { id: "messages", label: "Messages", icon: <FiMessageCircle /> }, { id: "transactions", label: "Transactions", icon: <FiRefreshCw /> }, { id: "wallet", label: "Wallet", icon: <FiCreditCard /> }, { id: "coupon", label: "Coupon", icon: <FiTag /> }] },
  { label: "Operations", items: [{ id: "reports", label: "Reports", icon: <FiBarChart2 /> }, { id: "shipping", label: "Shipping", icon: <FiTruck /> }] },
  { label: "System", items: [{ id: "settings", label: "Settings", icon: <FiSettings /> }] },
];
const blankOverview: Overview = { users: 0, categories: 0, products: 0, banners: 0 };
const input = "w-full border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#ffea00]";
const button = "bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const tabSegment = pathname.split("/").pop();
  const tab: Tab = tabSegment === "admin" ? "overview" : allTabIds.includes(tabSegment as Tab) ? tabSegment as Tab : "overview";
  const [overview, setOverview] = useState(blankOverview);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function navigateToTab(nextTab: Tab) {
    router.push(nextTab === "overview" ? "/admin" : `/admin/${nextTab}`);
    setMobileMenuOpen(false);
  }

  async function load() {
    setLoading(true); setError("");
    try {
      const stored = localStorage.getItem("inkstone_user");
      if (stored) setUser(JSON.parse(stored));
      const [nextOverview, nextCategories, nextProducts, nextBanners, nextUsers, nextOrders] = await Promise.all([
        api.getOverview(), api.getCategories(), api.getProducts(), api.getBanners(), api.getUsers(), api.getOrders()
      ]);
      setOverview(nextOverview); setCategories(nextCategories); setProducts(nextProducts); setBanners(nextBanners); setUsers(nextUsers); setOrders(nextOrders);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load dashboard."); }
    finally { setLoading(false); }
  }

  // The dashboard must hydrate from the protected API when the route mounts.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { const result = await api.login(credentials.email, credentials.password); setUser(result.user); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Admin login failed."); setLoading(false); }
  }

  if (!user?.is_staff) {
    return <main className="flex min-h-screen items-center justify-center bg-[#fff] px-5 py-16"><form onSubmit={signIn} className="w-full max-w-md border-2 border-black bg-white p-8 shadow-[8px_8px_0_#ffea00]"><div className="mb-10 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-[#ffea00] text-xl font-black">C</span><span className="text-xl font-bold tracking-tight">CRYSTAL<span className="text-[#c6b500]">.</span></span></div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">Control room</p><h1 className="mb-8 text-4xl font-bold tracking-tight">Admin sign in</h1>{error && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="mb-4 block text-sm font-medium">Email<input className={`${input} mt-2`} required type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label><label className="mb-6 block text-sm font-medium">Password<input className={`${input} mt-2`} required type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label><button className={`${button} w-full`} disabled={loading}>{loading ? "Checking..." : "Sign in"}</button></form></main>;
  }

  const navigation = <nav className="space-y-6">{navigationGroups.map((group) => <div key={group.label}><p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{group.label}</p><div className="space-y-1">{group.items.map((item) => <button key={item.id} onClick={() => navigateToTab(item.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold transition ${tab === item.id ? "bg-[#ffea00] text-black" : "text-neutral-600 hover:bg-neutral-100 hover:text-black"}`}>{item.icon}<span>{item.label}</span>{tab === item.id && <FiChevronRight className="ml-auto" />}</button>)}</div></div>)}</nav>;
  return <main className="min-h-screen bg-[#f7f7f5] text-black"><header className="sticky top-0 z-30 border-b border-black/10 bg-white"><div className="flex h-18 items-center justify-between px-5 lg:px-8"><div className="flex items-center gap-3"><button className="flex h-10 w-10 items-center justify-center border border-black/10 lg:hidden" aria-label="Open navigation" onClick={() => setMobileMenuOpen(true)}><FiMenu /></button><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[#ffea00] text-lg font-black">C</span><span className="text-lg font-black tracking-tight">CRYSTAL<span className="text-[#b8a900]">.</span></span></div></div><div className="hidden max-w-md flex-1 px-10 md:block"><label className="relative block"><FiActivity className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input className="w-full border border-black/10 bg-[#f7f7f5] py-3 pl-11 pr-4 text-sm outline-none focus:border-black" placeholder="Search your catalog" /></label></div><div className="flex items-center gap-4"><button className="relative text-xl" aria-label="Notifications"><FiBell /><span className="absolute -right-1 -top-1 h-2 w-2 bg-[#ffea00]" /></button><div className="hidden text-right sm:block"><p className="text-sm font-bold">{user.name || "Administrator"}</p><p className="text-xs text-neutral-500">Store manager</p></div><span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-xs font-bold text-[#ffea00]">{(user.name || user.email).slice(0, 2).toUpperCase()}</span></div></div></header><div className="flex"><aside className="fixed bottom-0 left-0 top-[72px] z-20 hidden w-64 shrink-0 overflow-y-auto border-r border-black/10 bg-white p-5 lg:block"><p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Workspace</p>{navigation}<div className="mt-10 border-t border-black/10 pt-5"><button onClick={() => { api.logout(); setUser(null); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-neutral-600 hover:bg-neutral-100 hover:text-black"><FiLogOut />Sign out</button></div></aside>{mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileMenuOpen(false)}><aside className="h-full w-72 overflow-y-auto bg-white p-5" onClick={(event) => event.stopPropagation()}><div className="mb-10 flex items-center justify-between"><span className="text-lg font-black">CRYSTAL<span className="text-[#b8a900]">.</span></span><button aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><FiX className="text-xl" /></button></div>{navigation}</aside></div>}<section className="min-w-0 flex-1 px-5 py-7 lg:ml-64 lg:px-10 lg:py-9">{error && <div className="mb-5 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error} <button className="ml-3 underline" onClick={() => void load()}>Retry</button></div>}{loading ? <div className="border border-black/10 bg-white p-8 text-sm text-neutral-500">Loading dashboard...</div> : <>{tab === "overview" && <OverviewPanel overview={overview} select={navigateToTab} products={products} categories={categories} banners={banners} />}{tab === "categories" && <CategoriesPanel items={categories} refresh={load} />}{tab === "products" && <ProductsTablePanel items={products} categories={categories} refresh={load} />}{tab === "banners" && <BannersTablePanel items={banners} refresh={load} />}{tab === "users" && <UsersPanel items={users} />}{tab === "orders" && <OrdersTablePanel items={orders} refresh={load} />}{!["overview", "categories", "products", "banners", "users", "orders"].includes(tab) && <ResourcePanel tab={tab} />}</>}</section></div></main>;
}

function Header({ title, description }: { title: string; description: string }) { return <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300]">Crystal commerce</p><h2 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h2><p className="mt-2 text-sm text-neutral-500">{description}</p></div>; }
function ResourcePanel({ tab }: { tab: Tab }) {
  const content: Record<string, { title: string; description: string; action: string; icon: React.ReactNode }> = {
    orders: { title: "Orders", description: "Review incoming orders, fulfillment status, and customer purchases.", action: "Create order", icon: <FiFileText /> },
    marketing: { title: "Marketing", description: "Plan campaigns and monitor how your storefront promotions perform.", action: "New campaign", icon: <FiBarChart2 /> },
    messages: { title: "Messages", description: "Keep track of customer questions and store conversations.", action: "New message", icon: <FiMessageCircle /> },
    transactions: { title: "Transactions", description: "Review payments, refunds, and recent financial activity.", action: "Export transactions", icon: <FiRefreshCw /> },
    wallet: { title: "Wallet", description: "Manage your store balance and payout preferences.", action: "Add funds", icon: <FiCreditCard /> },
    coupon: { title: "Coupon", description: "Create and manage discount codes for your customers.", action: "Create coupon", icon: <FiTag /> },
    reports: { title: "Reports", description: "Understand sales, product performance, and customer trends.", action: "Generate report", icon: <FiBarChart2 /> },
    shipping: { title: "Shipping", description: "Configure delivery methods and follow fulfillment activity.", action: "Add shipping method", icon: <FiTruck /> },
    settings: { title: "Settings", description: "Configure your store profile, access, and preferences.", action: "Save settings", icon: <FiSettings /> },
  };
  const page = content[tab];
  return <><Header title={page.title} description={page.description} /><div className="grid gap-5 md:grid-cols-[1.4fr_1fr]"><div className="border border-black/10 bg-white p-6 sm:p-8"><div className="mb-8 flex h-12 w-12 items-center justify-center bg-[#ffea00] text-xl">{page.icon}</div><h3 className="text-xl font-black">{page.title} workspace</h3><p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">This workspace is ready for your {page.title.toLowerCase()} data. Connect the corresponding backend workflow to start managing it here.</p><button className="mt-8 bg-black px-5 py-3 text-sm font-bold text-white hover:bg-[#ffea00] hover:text-black">{page.action}</button></div><div className="border border-black/10 bg-black p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffea00]">Coming next</p><h3 className="mt-4 text-2xl font-black">One clear place for your team.</h3><p className="mt-3 text-sm leading-6 text-neutral-300">Your navigation is ready. This page can now grow into the full operational workflow without changing the admin shell.</p></div></div></>;
}
function OverviewPanel({ overview, select, products, categories, banners }: { overview: Overview; select: (tab: Tab) => void; products: Product[]; categories: Category[]; banners: Banner[] }) { const cards: [string, keyof Overview, Tab, React.ReactNode][] = [["Customers", "users", "users", <FiUsers key="users-icon" />], ["Categories", "categories", "categories", <FiLayers key="categories-icon" />], ["Products", "products", "products", <FiPackage key="products-icon" />], ["Live banners", "banners", "banners", <FiImage key="banners-icon" />]]; return <><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><Header title="Good afternoon" description="Here is what's happening across your store today." /><span className="w-fit bg-[#ffea00] px-3 py-2 text-xs font-bold uppercase tracking-wider">Live dashboard</span></div><div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, key, tab, icon]) => <button key={key} onClick={() => select(tab)} className="group border border-black/10 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-black hover:shadow-[4px_4px_0_#ffea00]"><div className="mb-7 flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8] text-lg">{icon}</span><FiChevronRight className="text-neutral-400 transition group-hover:translate-x-1 group-hover:text-black" /></div><p className="text-sm text-neutral-500">{label}</p><p className="mt-1 text-4xl font-black">{overview[key]}</p><p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#8d8300]">View details</p></button>)}</div><div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><div className="border border-black/10 bg-white"><div className="flex items-center justify-between border-b border-black/10 px-5 py-4"><div><h3 className="font-bold">Latest catalog activity</h3><p className="mt-1 text-xs text-neutral-500">Your newest products and collections</p></div><FiActivity /></div>{products.length === 0 && categories.length === 0 ? <p className="p-8 text-sm text-neutral-500">Your catalog is ready for its first entry.</p> : <div>{products.slice(0, 5).map((product) => <button key={product.id} onClick={() => select("products")} className="flex w-full items-center gap-4 border-b border-black/5 px-5 py-4 text-left last:border-0 hover:bg-[#fffef0]"><span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-[#f7f7f5]">{product.image_url ? <img src={product.image_url} alt="" className="h-full w-full object-cover" /> : <FiShoppingBag className="text-neutral-400" />}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{product.name}</strong><span className="text-xs text-neutral-500">{product.category.name}</span></span><span className="text-sm font-bold">Rs. {product.price}</span><FiChevronRight className="text-neutral-400" /></button>)}{categories.slice(0, Math.max(0, 5 - products.length)).map((category) => <button key={category.id} onClick={() => select("categories")} className="flex w-full items-center gap-4 border-b border-black/5 px-5 py-4 text-left last:border-0 hover:bg-[#fffef0]"><span className="flex h-10 w-10 items-center justify-center bg-[#fff7a8]"><FiLayers /></span><span className="flex-1 text-sm font-bold">{category.name}</span><span className="text-xs text-neutral-500">Collection</span><FiChevronRight className="text-neutral-400" /></button>)}</div>}</div><div className="border border-black/10 bg-black p-6 text-white"><div className="flex h-full flex-col justify-between"><div><span className="mb-7 flex h-11 w-11 items-center justify-center bg-[#ffea00] text-black"><FiImage className="text-xl" /></span><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ffea00]">Marketing</p><h3 className="max-w-xs text-2xl font-black">Keep your storefront fresh.</h3><p className="mt-3 max-w-xs text-sm leading-6 text-neutral-300">Promote seasonal collections and offers with a homepage banner.</p></div><button onClick={() => select("banners")} className="mt-10 flex w-full items-center justify-between bg-[#ffea00] px-4 py-3 text-left text-sm font-bold text-black hover:bg-white">Manage {banners.length} banner{banners.length === 1 ? "" : "s"}<FiChevronRight /></button></div></div></div></>; }

function CategoriesPanel({ items, refresh }: { items: Category[]; refresh: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const previewUrl = imageMode === "upload" ? uploadPreviewUrl || form.image_url.trim() : form.image_url.trim();

  function closeModal() {
    if (!saving) {
      setIsModalOpen(false);
      setEditingCategory(null);
    }
  }

  function openCreateModal() {
    setForm({ name: "", slug: "", description: "", image_url: "" });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    setPreviewError(false);
    setFormError("");
    setEditingCategory(null);
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setForm({ name: category.name, slug: category.slug, description: category.description, image_url: category.image_url });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    setPreviewError(false);
    setFormError("");
    setEditingCategory(category);
    setIsModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      let imageUrl = form.image_url;
      if (imageMode === "upload") {
        if (selectedImage) {
          imageUrl = (await api.uploadCategoryImage(selectedImage)).image_url;
        } else if (!imageUrl) {
          throw new Error("Please select an image to upload.");
        }
      }
      const cleanSlug = slugify(form.slug || form.name);
      if (!cleanSlug) {
        throw new Error("Category name is required to generate a slug.");
      }
      const categoryData = { ...form, slug: cleanSlug, image_url: imageUrl };
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, categoryData);
      } else {
        await api.createCategory(categoryData);
      }
      setForm({ name: "", slug: "", description: "", image_url: "" });
      setSelectedImage(null);
      setUploadPreviewUrl("");
      setIsModalOpen(false);
      setEditingCategory(null);
      await refresh();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : `Unable to ${editingCategory ? "update" : "create"} category.`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (window.confirm("Delete this category?")) {
      setDeleteError("");
      try {
        await api.deleteCategory(id);
        await refresh();
      } catch (reason) {
        setDeleteError(reason instanceof Error ? reason.message : "Unable to delete category.");
      }
    }
  }

  return <>
    <div className="mb-6 flex items-start justify-between gap-4">
      <Header title="Categories" description="Manage the categories used to organize products." />
      <button className={`${button} shrink-0`} onClick={openCreateModal}>Add Category</button>
    </div>
    {deleteError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
    <div className="overflow-x-auto border border-neutral-200 bg-white">
      <table className="w-full min-w-170 text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
          <tr><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Slug</th><th className="p-4">Description</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
        </thead>
        <tbody>
          {items.length === 0 ? <tr><td className="p-8 text-center text-neutral-500" colSpan={6}>No categories yet.</td></tr> : items.map((item) => <tr key={item.id} className="border-b border-neutral-100 last:border-0">
            <td className="p-4">{item.image_url ? <img src={item.image_url} alt="" className="h-12 w-12 object-cover" /> : <span className="text-neutral-400">-</span>}</td><td className="p-4 font-medium">{item.name}</td><td className="p-4 text-neutral-500">/{item.slug}</td><td className="max-w-sm p-4 text-neutral-500">{item.description || "-"}</td><td className="p-4">{item.is_active ? "Active" : "Inactive"}</td><td className="p-4 text-right"><div className="flex justify-end gap-3"><button onClick={() => openEditModal(item)} className="text-sm text-neutral-700 hover:underline">Edit</button><button onClick={() => void remove(item.id)} className="text-sm text-red-600 hover:underline">Delete</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <div className="w-full max-w-lg border border-neutral-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h3 id="category-modal-title" className="text-xl font-semibold">{editingCategory ? "Edit Category" : "Add Category"}</h3><p className="mt-1 text-sm text-neutral-500">{editingCategory ? "Update this category in your product catalog." : "Create a category for your product catalog."}</p></div><button type="button" className="text-2xl leading-none text-neutral-500 hover:text-neutral-950" aria-label="Close dialog" onClick={closeModal}>&times;</button></div>
        <form onSubmit={submit}>
          {formError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <input
            className={`${input} mb-3`}
            required
            placeholder="Name"
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => {
                const prevAuto = slugify(current.name);
                const shouldSync = !current.slug || current.slug === prevAuto;
                return { ...current, name, slug: shouldSync ? slugify(name) : current.slug };
              });
            }}
          />
          <div className="mb-3">
            <input
              className={input}
              required
              placeholder="slug"
              value={form.slug}
              onChange={(event) => {
                const slug = event.target.value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                setForm({ ...form, slug });
              }}
            />
            <p className="mt-1 text-xs text-neutral-400">Slug: /{form.slug || slugify(form.name) || "category-slug"}</p>
          </div>
          <fieldset className="mb-3">
            <legend className="mb-2 text-sm font-medium">Category image</legend>
            <div className="flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="category-image-mode" checked={imageMode === "url"} onChange={() => setImageMode("url")} />Paste URL</label>
              <label className="flex items-center gap-2"><input type="radio" name="category-image-mode" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} />Upload image</label>
            </div>
          </fieldset>
          {imageMode === "url" ? <input className={`${input} mb-3`} type="url" placeholder="Image URL" value={form.image_url} onChange={(event) => { setForm({ ...form, image_url: event.target.value }); setPreviewError(false); }} /> : <div className="mb-3"><input className={`${input} mb-1`} required={imageMode === "upload" && !editingCategory?.image_url} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0] ?? null; setSelectedImage(file); setUploadPreviewUrl(file ? URL.createObjectURL(file) : ""); setPreviewError(false); }} /><p className="text-xs text-neutral-500">JPG, PNG, WEBP, or GIF up to 5 MB{selectedImage ? `: ${selectedImage.name}` : ""}</p></div>}
          <div className="mb-5 flex min-h-28 items-center gap-4 border border-dashed border-neutral-300 bg-neutral-50 p-3">
            {previewUrl && !previewError ? <img src={previewUrl} alt="Category preview" className="h-24 w-24 shrink-0 object-cover" onError={() => setPreviewError(true)} /> : <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-neutral-200 bg-white text-center text-xs text-neutral-400">{previewError ? "Preview unavailable" : "No image selected"}</div>}
            <div className="min-w-0"><p className="text-sm font-medium">Image preview</p><p className="mt-1 wrap-break-word text-xs text-neutral-500">{previewError ? "Check the image URL or choose another file." : previewUrl ? "This image will appear in the category table." : "Choose an image or paste a URL to preview it here."}</p></div>
          </div>
          <textarea className={`${input} mb-5`} placeholder="Description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="flex justify-end gap-3"><button type="button" className="border border-neutral-300 px-4 py-2.5 text-sm hover:bg-neutral-100" onClick={closeModal}>Cancel</button><button className={button} disabled={saving}>{saving ? "Saving..." : editingCategory ? "Save changes" : "Create category"}</button></div>
        </form>
      </div>
    </div>}
  </>;
}

function ProductsTablePanel({ items, categories, refresh }: { items: Product[]; categories: Category[]; refresh: () => Promise<void> }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: "", offer_price: "", stock: "", image_url: "", category: "", additional_image_urls: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [selectedAdditionalImages, setSelectedAdditionalImages] = useState<File[]>([]);
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>([]);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const previewUrl = imageMode === "upload" ? uploadPreviewUrl || form.image_url.trim() : form.image_url.trim();
  const additionalPreviewItems = [
    ...form.additional_image_urls.map((url) => ({ type: "saved" as const, url })),
    ...additionalPreviewUrls.map((url) => ({ type: "new" as const, url })),
  ].slice(0, 5);
  const offerPriceValue = form.offer_price.trim() ? Number(form.offer_price) : null;
  const offerDiscount = offerPriceValue !== null && Number(form.price) > 0 && offerPriceValue < Number(form.price)
    ? Math.round(((Number(form.price) - offerPriceValue) / Number(form.price)) * 100)
    : null;

  function resetForm() {
    setForm({ name: "", slug: "", description: "", price: "", offer_price: "", stock: "", image_url: "", category: "", additional_image_urls: [] });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedAdditionalImages([]);
    setAdditionalPreviewUrls([]);
    setPreviewError(false);
    setFormError("");
  }

  function closeModal() {
    if (!saving) {
      setIsModalOpen(false);
      setEditingProduct(null);
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: String(product.price),
      offer_price: product.offer_price === null ? "" : String(product.offer_price),
      stock: String(product.stock),
      image_url: product.image_url,
      category: product.category.id,
      additional_image_urls: product.additional_image_urls ?? [],
    });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedAdditionalImages([]);
    setAdditionalPreviewUrls([]);
    setPreviewError(false);
    setFormError("");
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function selectAdditionalImages(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    const availableSlots = 5 - form.additional_image_urls.length;
    const acceptedFiles = nextFiles.slice(0, Math.max(availableSlots, 0));
    additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedAdditionalImages(acceptedFiles);
    setAdditionalPreviewUrls(acceptedFiles.map((file) => URL.createObjectURL(file)));
    if (nextFiles.length > availableSlots) {
      setFormError("You can add up to 5 additional product images.");
    } else {
      setFormError("");
    }
  }

  function removeSavedAdditionalImage(index: number) {
    setForm((current) => ({
      ...current,
      additional_image_urls: current.additional_image_urls.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  function clearNewAdditionalImages() {
    additionalPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedAdditionalImages([]);
    setAdditionalPreviewUrls([]);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      let imageUrl = form.image_url;
      if (imageMode === "upload") {
        if (selectedImage) {
          imageUrl = (await api.uploadProductImage(selectedImage)).image_url;
        } else if (!imageUrl) {
          throw new Error("Please select an image to upload.");
        }
      }
      const uploadedAdditionalUrls = selectedAdditionalImages.length
        ? await Promise.all(selectedAdditionalImages.map((file) => api.uploadProductImage(file).then((result) => result.image_url)))
        : [];
      const additionalImageUrls = [...form.additional_image_urls, ...uploadedAdditionalUrls].slice(0, 5);
      const cleanSlug = slugify(form.slug || form.name);
      if (!cleanSlug) {
        throw new Error("Product name is required to generate a slug.");
      }
      const productData = { ...form, slug: cleanSlug, image_url: imageUrl, additional_image_urls: additionalImageUrls, price: Number(form.price), offer_price: offerPriceValue, stock: Number(form.stock) || 0 };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productData);
      } else {
        await api.createProduct(productData);
      }
      resetForm();
      setIsModalOpen(false);
      setEditingProduct(null);
      await refresh();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : `Unable to ${editingProduct ? "update" : "create"} product.`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (window.confirm("Delete this product?")) {
      setDeleteError("");
      try {
        await api.deleteProduct(id);
        await refresh();
      } catch (reason) {
        setDeleteError(reason instanceof Error ? reason.message : "Unable to delete product.");
      }
    }
  }

  return <>
    <div className="mb-6 flex items-start justify-between gap-4">
      <Header title="Products" description="Products must be assigned to an existing category." />
      <button className={`${button} shrink-0`} onClick={openCreateModal} disabled={categories.length === 0}>Add Product</button>
    </div>
    {deleteError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
    <div className="overflow-x-auto border border-neutral-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
          <tr><th className="p-4">Image</th><th className="p-4">Name</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Offer</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
        </thead>
        <tbody>
          {items.length === 0 ? <tr><td className="p-8 text-center text-neutral-500" colSpan={8}>{categories.length === 0 ? "Add a category before creating products." : "No products yet."}</td></tr> : items.map((item) => <tr key={item.id} className="border-b border-neutral-100 last:border-0">
            <td className="p-4">{item.image_url ? <img src={item.image_url} alt="" className="h-12 w-12 object-cover" /> : <span className="text-neutral-400">-</span>}</td>
            <td className="p-4"><p className="font-medium">{item.name}</p><p className="text-xs text-neutral-500">/{item.slug}</p></td>
            <td className="p-4 text-neutral-500">{item.category.name}</td>
            <td className="p-4">
              {typeof item.offer_price === "number" ? <><p className="font-semibold">Rs. {item.offer_price}</p><p className="text-xs text-neutral-400 line-through">Rs. {item.price}</p></> : <>Rs. {item.price}</>}
            </td>
            <td className="p-4">{typeof item.discount_percent === "number" ? <span className="bg-[#ffea00] px-2 py-1 text-xs font-bold text-black">{item.discount_percent}% OFF</span> : <span className="text-neutral-400">-</span>}</td>
            <td className="p-4">{item.stock}</td>
            <td className="p-4">{item.is_active ? "Active" : "Inactive"}</td>
            <td className="p-4 text-right"><div className="flex justify-end gap-3"><button onClick={() => openEditModal(item)} className="text-sm text-neutral-700 hover:underline">Edit</button><button onClick={() => void remove(item.id)} className="text-sm text-red-600 hover:underline">Delete</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <div className="max-h-full w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h3 id="product-modal-title" className="text-xl font-semibold">{editingProduct ? "Edit Product" : "Add Product"}</h3><p className="mt-1 text-sm text-neutral-500">{editingProduct ? "Update this product in your catalog." : "Create a product for an existing category."}</p></div><button type="button" className="text-2xl leading-none text-neutral-500 hover:text-neutral-950" aria-label="Close dialog" onClick={closeModal}>&times;</button></div>
        <form onSubmit={submit}>
          {formError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <input
                className={input}
                required
                placeholder="Name"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => {
                    const prevAuto = slugify(current.name);
                    const shouldSync = !current.slug || current.slug === prevAuto;
                    return { ...current, name, slug: shouldSync ? slugify(name) : current.slug };
                  });
                }}
              />
            </div>
            <div>
              <input
                className={input}
                required
                placeholder="slug"
                value={form.slug}
                onChange={(event) => {
                  const slug = event.target.value.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
                  setForm({ ...form, slug });
                }}
              />
              <p className="mt-1 text-xs text-neutral-400">Slug: /{form.slug || slugify(form.name) || "product-slug"}</p>
            </div>
          </div>
          <select className={`${input} mt-3`} required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            <option value="">Select category</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input className={input} required min="0" step="0.01" type="number" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <input className={input} min="0" step="0.01" type="number" placeholder="Offer price" value={form.offer_price} onChange={(event) => setForm({ ...form, offer_price: event.target.value })} />
            <input className={input} required min="0" type="number" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} />
          </div>
          {offerDiscount !== null && <p className="mt-2 inline-flex bg-[#ffea00] px-3 py-1 text-xs font-bold text-black">{offerDiscount}% OFF will be shown on the storefront.</p>}
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">Product image</legend>
            <div className="flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="product-image-mode" checked={imageMode === "url"} onChange={() => setImageMode("url")} />Paste URL</label>
              <label className="flex items-center gap-2"><input type="radio" name="product-image-mode" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} />Upload image</label>
            </div>
          </fieldset>
          {imageMode === "url" ? <input className={`${input} mt-3`} type="url" placeholder="Image URL" value={form.image_url} onChange={(event) => { setForm({ ...form, image_url: event.target.value }); setPreviewError(false); }} /> : <div className="mt-3"><input className={`${input} mb-1`} required={imageMode === "upload" && !editingProduct?.image_url} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0] ?? null; setSelectedImage(file); setUploadPreviewUrl(file ? URL.createObjectURL(file) : ""); setPreviewError(false); }} /><p className="text-xs text-neutral-500">JPG, PNG, WEBP, or GIF up to 5 MB{selectedImage ? `: ${selectedImage.name}` : ""}</p></div>}
          <div className="mt-3 flex min-h-28 items-center gap-4 border border-dashed border-neutral-300 bg-neutral-50 p-3">
            {previewUrl && !previewError ? <img src={previewUrl} alt="Product preview" className="h-24 w-24 shrink-0 object-cover" onError={() => setPreviewError(true)} /> : <div className="flex h-24 w-24 shrink-0 items-center justify-center border border-neutral-200 bg-white text-center text-xs text-neutral-400">{previewError ? "Preview unavailable" : "No image selected"}</div>}
            <div className="min-w-0"><p className="text-sm font-medium">Image preview</p><p className="mt-1 break-words text-xs text-neutral-500">{previewError ? "Check the image URL or choose another file." : previewUrl ? "This image will appear in the product table." : "Choose an image or paste a URL to preview it here."}</p></div>
          </div>
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm font-medium">Additional product images</legend>
            <input className={`${input} mb-1`} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => selectAdditionalImages(event.target.files)} />
            <p className="text-xs text-neutral-500">Upload up to 5 additional images for the product details gallery.</p>
          </fieldset>
          {additionalPreviewItems.length > 0 && <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {additionalPreviewItems.map((item, index) => (
              <div key={`${item.type}-${item.url}`} className="relative h-24 overflow-hidden border border-neutral-200 bg-neutral-50">
                <img src={item.url} alt={`Additional product image ${index + 1}`} className="h-full w-full object-cover" />
                {item.type === "saved" && <button type="button" className="absolute right-1 top-1 bg-black px-1.5 py-0.5 text-xs font-bold text-white" onClick={() => removeSavedAdditionalImage(index)}>Remove</button>}
              </div>
            ))}
          </div>}
          {selectedAdditionalImages.length > 0 && <button type="button" className="mt-2 text-xs font-semibold text-neutral-600 underline" onClick={clearNewAdditionalImages}>Clear newly selected images</button>}
          <textarea className={`${input} mt-3`} placeholder="Description" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="mt-5 flex justify-end gap-3"><button type="button" className="border border-neutral-300 px-4 py-2.5 text-sm hover:bg-neutral-100" onClick={closeModal}>Cancel</button><button className={button} disabled={saving}>{saving ? "Saving..." : editingProduct ? "Save changes" : "Create product"}</button></div>
        </form>
      </div>
    </div>}
  </>;
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function BannersTablePanel({ items, refresh }: { items: Banner[]; refresh: () => Promise<void> }) {
  const [form, setForm] = useState({ title: "", subtitle: "", image_url: "", link_url: "", starts_at: "", ends_at: "" });
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    return () => {
      if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
    };
  }, [uploadPreviewUrl]);

  const previewUrl = imageMode === "upload" ? uploadPreviewUrl || form.image_url.trim() : form.image_url.trim();

  function resetForm() {
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", starts_at: "", ends_at: "" });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    setFormError("");
    setPreviewError(false);
  }

  function closeModal() {
    if (!saving) {
      setIsModalOpen(false);
      setEditingBanner(null);
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingBanner(null);
    setIsModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      image_url: banner.image_url,
      link_url: banner.link_url,
      starts_at: toDateTimeLocal(banner.starts_at),
      ends_at: toDateTimeLocal(banner.ends_at),
    });
    setImageMode("url");
    setSelectedImage(null);
    setUploadPreviewUrl("");
    setFormError("");
    setPreviewError(false);
    setEditingBanner(banner);
    setIsModalOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      let imageUrl = form.image_url;
      if (imageMode === "upload") {
        if (selectedImage) {
          imageUrl = (await api.uploadBannerImage(selectedImage)).image_url;
        } else if (!imageUrl) {
          throw new Error("Please select an image to upload.");
        }
      }
      const bannerData = {
        ...form,
        image_url: imageUrl,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
      };
      if (editingBanner) {
        await api.updateBanner(editingBanner.id, bannerData);
      } else {
        await api.createBanner(bannerData);
      }
      resetForm();
      setIsModalOpen(false);
      setEditingBanner(null);
      await refresh();
    } catch (reason) {
      setFormError(reason instanceof Error ? reason.message : `Unable to ${editingBanner ? "update" : "create"} banner.`);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (window.confirm("Delete this banner?")) {
      setDeleteError("");
      try {
        await api.deleteBanner(id);
        await refresh();
      } catch (reason) {
        setDeleteError(reason instanceof Error ? reason.message : "Unable to delete banner.");
      }
    }
  }

  return <>
    <div className="mb-6 flex items-start justify-between gap-4">
      <Header title="Offer banners" description="Control promotional banners shown across the storefront." />
      <button className={`${button} shrink-0`} onClick={openCreateModal}>Add Banner</button>
    </div>
    {deleteError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{deleteError}</p>}
    <div className="overflow-x-auto border border-neutral-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
          <tr><th className="p-4">Image</th><th className="p-4">Title</th><th className="p-4">Link</th><th className="p-4">Starts</th><th className="p-4">Ends</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr>
        </thead>
        <tbody>
          {items.length === 0 ? <tr><td className="p-8 text-center text-neutral-500" colSpan={7}>No banners yet.</td></tr> : items.map((item) => <tr key={item.id} className="border-b border-neutral-100 last:border-0">
            <td className="p-4">{item.image_url ? <img src={item.image_url} alt="" className="h-12 w-20 object-cover" /> : <span className="text-neutral-400">-</span>}</td>
            <td className="p-4"><p className="font-medium">{item.title}</p><p className="max-w-xs truncate text-xs text-neutral-500">{item.subtitle || "-"}</p></td>
            <td className="max-w-[180px] truncate p-4 text-neutral-500">{item.link_url || "-"}</td>
            <td className="p-4 text-neutral-500">{new Date(item.starts_at).toLocaleString()}</td>
            <td className="p-4 text-neutral-500">{new Date(item.ends_at).toLocaleString()}</td>
            <td className="p-4">{item.is_active ? "Active" : "Inactive"}</td>
            <td className="p-4 text-right"><div className="flex justify-end gap-3"><button onClick={() => openEditModal(item)} className="text-sm text-neutral-700 hover:underline">Edit</button><button onClick={() => void remove(item.id)} className="text-sm text-red-600 hover:underline">Delete</button></div></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {isModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 py-8" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
      <div className="max-h-full w-full max-w-2xl overflow-y-auto border border-neutral-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="banner-modal-title">
        <div className="mb-5 flex items-start justify-between gap-4"><div><h3 id="banner-modal-title" className="text-xl font-semibold">{editingBanner ? "Edit Banner" : "Add Banner"}</h3><p className="mt-1 text-sm text-neutral-500">{editingBanner ? "Update the banner details and display dates." : "Create a banner with start and end dates."}</p></div><button type="button" className="text-2xl leading-none text-neutral-500 hover:text-neutral-950" aria-label="Close dialog" onClick={closeModal}>&times;</button></div>
        <form onSubmit={submit}>
          {formError && <p className="mb-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
          <input className={`${input} mb-3`} required placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <input className={`${input} mb-3`} placeholder="Subtitle" value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
          <fieldset className="mb-3">
            <legend className="mb-2 text-sm font-medium">Banner image</legend>
            <div className="flex gap-5 text-sm">
              <label className="flex items-center gap-2"><input type="radio" name="banner-image-mode" checked={imageMode === "url"} onChange={() => setImageMode("url")} />Paste URL</label>
              <label className="flex items-center gap-2"><input type="radio" name="banner-image-mode" checked={imageMode === "upload"} onChange={() => setImageMode("upload")} />Upload image</label>
            </div>
          </fieldset>
          {imageMode === "url" ? <input className={`${input} mb-3`} required type="url" placeholder="Image URL" value={form.image_url} onChange={(event) => { setForm({ ...form, image_url: event.target.value }); setPreviewError(false); }} /> : <div className="mb-3"><input className={`${input} mb-1`} required={imageMode === "upload" && !editingBanner?.image_url} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { const file = event.target.files?.[0] ?? null; setSelectedImage(file); setUploadPreviewUrl(file ? URL.createObjectURL(file) : ""); setPreviewError(false); }} /><p className="text-xs text-neutral-500">JPG, PNG, WEBP, or GIF up to 5 MB{selectedImage ? `: ${selectedImage.name}` : ""}</p></div>}
          <div className="mb-3 flex min-h-28 items-center gap-4 border border-dashed border-neutral-300 bg-neutral-50 p-3">
            {previewUrl && !previewError ? <img src={previewUrl} alt="Banner preview" className="h-24 w-40 shrink-0 object-cover" onError={() => setPreviewError(true)} /> : <div className="flex h-24 w-40 shrink-0 items-center justify-center border border-neutral-200 bg-white text-center text-xs text-neutral-400">{previewError ? "Preview unavailable" : "No image selected"}</div>}
            <div className="min-w-0"><p className="text-sm font-medium">Image preview</p><p className="mt-1 break-words text-xs text-neutral-500">{previewError ? "Check the image URL or choose another file." : previewUrl ? "This image will appear in the banner table." : "Choose an image or paste a URL to preview it here."}</p></div>
          </div>
          <input className={`${input} mb-3`} type="url" placeholder="Link URL" value={form.link_url} onChange={(event) => setForm({ ...form, link_url: event.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs text-neutral-500">Starts<input className={`${input} mt-1`} required type="datetime-local" value={form.starts_at} onChange={(event) => setForm({ ...form, starts_at: event.target.value })} /></label>
            <label className="block text-xs text-neutral-500">Ends<input className={`${input} mt-1`} required type="datetime-local" value={form.ends_at} onChange={(event) => setForm({ ...form, ends_at: event.target.value })} /></label>
          </div>
          <div className="mt-5 flex justify-end gap-3"><button type="button" className="border border-neutral-300 px-4 py-2.5 text-sm hover:bg-neutral-100" onClick={closeModal}>Cancel</button><button className={button} disabled={saving}>{saving ? "Saving..." : editingBanner ? "Save changes" : "Create banner"}</button></div>
        </form>
      </div>
    </div>}
  </>;
}

function UsersPanel({ items }: { items: AdminUser[] }) { return <><Header title="Users" description="Registered accounts and staff access." /><div className="overflow-x-auto border border-neutral-200 bg-white"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500"><tr><th className="p-4">User ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th></tr></thead><tbody>{items.map((item) => <tr key={item.user_id} className="border-b border-neutral-100"><td className="p-4 font-mono text-xs">{item.user_id}</td><td className="p-4">{item.name}</td><td className="p-4">{item.email}</td><td className="p-4">{item.is_staff ? "Super admin" : "Customer"}</td></tr>)}</tbody></table></div></>; }

function OrdersTablePanel({ items, refresh }: { items: Order[]; refresh: () => Promise<void> }) {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <Header title="Orders" description="Manage incoming customer orders and their custom attachments." />
      </div>
      <div className="overflow-x-auto border border-neutral-200 bg-white">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Attachment</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="p-8 text-center text-neutral-500" colSpan={6}>No orders yet.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                  <td className="p-4 font-medium text-xs font-mono">{item.order_id}</td>
                  <td className="p-4 text-neutral-500 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.email}</p>
                  </td>
                  <td className="p-4">
                    {item.items.map((i, idx) => (
                      <div key={idx} className="text-xs">
                        {i.quantity}x {i.name}
                      </div>
                    ))}
                  </td>
                  <td className="p-4 font-bold whitespace-nowrap">Rs. {item.total.toFixed(2)}</td>
                  <td className="p-4">
                    {item.attachment_url ? (
                      <a 
                        href={item.attachment_url}
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-black px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#ffea00] hover:text-black"
                      >
                        <FiImage /> View
                      </a>
                    ) : (
                      <span className="text-xs text-neutral-400">None</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
