"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiUploadCloud, FiTrash2, FiImage, FiAlertCircle } from "react-icons/fi";
import { api, Product } from "@/src/lib/inkstone-api";
import { RiImageCircleAiFill } from "react-icons/ri";

export default function ProductAttachmentPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Security check: user must be logged in to upload attachments / customize order
    const isLogged = typeof window !== "undefined" && Boolean(localStorage.getItem("inkstone_access"));
    if (!isLogged) {
      router.replace(`/login?redirect=${encodeURIComponent(`/product/${productId}/attachment`)}`);
      return;
    }

    const storedProduct = sessionStorage.getItem("crystal_checkout_product");
    if (storedProduct) {
      try {
        const prod = JSON.parse(storedProduct) as Product;
        setProduct(prod);
        // If product is ready_stock, it doesn't need attachment, redirect to checkout
        if (prod.product_type === "ready_stock") {
          router.replace("/checkout");
          return;
        }
        setIsLoadingProduct(false);
        return;
      } catch {
        sessionStorage.removeItem("crystal_checkout_product");
      }
    }

    if (productId) {
      api.getProductById(productId)
        .then((data) => {
          setProduct(data);
          sessionStorage.setItem("crystal_checkout_product", JSON.stringify(data));
          if (data.product_type === "ready_stock") {
            router.replace("/checkout");
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsLoadingProduct(false);
        });
    } else {
      setIsLoadingProduct(false);
    }
  }, [productId, router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("File size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      setErrorMessage(null);
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile.type.startsWith("image/")) {
        setErrorMessage("Please drop an image file (PNG, JPG, WEBP).");
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setErrorMessage("File size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      setErrorMessage(null);
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setPreview(url);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      setErrorMessage("Please upload an image to customize your order before proceeding.");
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const res = await api.uploadOrderAttachment(file);
      sessionStorage.setItem("crystal_checkout_attachment", res.image_url);
      
      // Update checkout items array if present
      const storedItems = sessionStorage.getItem("crystal_checkout_items");
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems);
          if (Array.isArray(items) && items.length > 0) {
            items[0].attachment_url = res.image_url;
            sessionStorage.setItem("crystal_checkout_items", JSON.stringify(items));
          }
        } catch { /* ignore */ }
      }

      router.push("/checkout");
    } catch (e) {
      setErrorMessage("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-2 py-20">
        <div className="w-full max-w-md border border-black/10 bg-white px-2 py-8 text-center">
          <h1 className="text-3xl font-black">No product selected</h1>
          <p className="mt-3 text-sm text-neutral-500">Go back and select a product to customize.</p>
          <Link href="/product" className="mt-7 inline-flex bg-[#ffea00] px-5 py-3 text-sm font-bold text-black hover:bg-neutral-900 hover:text-[#ffea00] transition-colors">
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="mx-auto max-w-4xl px-2 py-8 sm:py-5 pt-24 md:mt-[100px]">
        <Link href={`/product/${productId}`} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black">
          <FiArrowLeft /> Back to product
        </Link>
        
        <div className="mb-5">
          <p className="text- font-medium tracking-[-1px] text-center text-[#000] flex gap-2 items-center justify-center">
            <RiImageCircleAiFill className="bg-[#ffea00] p-0.5 text-black" /> Customize your order
          </p>
          <h1 className="mt-2 text-4xl font-medium text-center tracking-tight sm:text-5xl">Attach an Image.</h1>
          <p className="mt-4 text-sm text-center text-neutral-500 max-w-md mx-auto">
            This is a custom crystal product. An image attachment is <span className="font-semibold text-black">required</span> to craft your personalized piece.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_320px] rounded-3xl">
          {/* Main upload section */}
          <div className="border border-black/10 bg-white p-6 sm:p-10 shadow-sm rounded-3xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-medium">Upload Image</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
                Mandatory
              </span>
            </div>

            {errorMessage && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                <FiAlertCircle className="text-lg shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {!preview ? (
              <div 
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-200 ${
                  isDragging ? "border-[#ffea00] bg-[#ffea00]/5" : "border-neutral-200 bg-neutral-50 hover:border-neutral-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-[#4a5c3a]">
                  <FiUploadCloud className="text-2xl" />
                </div>
                <h3 className="mb-2 text-lg font-medium tracking-[-1px]">Drag & Drop to Upload</h3>
                <p className="mb-6 text-sm text-neutral-400">or click below to browse your files (PNG, JPG, max 5MB)</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#ffea00] hover:text-black cursor-pointer"
                >
                  Select File
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="relative mb-4 overflow-hidden rounded-xl bg-neutral-100 aspect-video">
                  <img src={preview} alt="Preview" className="h-full w-full object-contain" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiImage className="text-xl text-neutral-400" />
                    <div>
                      <p className="text-sm font-semibold truncate max-w-[200px]">{file?.name}</p>
                      <p className="text-xs text-neutral-400">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white cursor-pointer"
                    title="Remove file"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isUploading}
                className="w-full sm:w-auto rounded-full bg-[#ffea00] px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-900 hover:text-[#ffea00] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {isUploading ? "Uploading..." : "Submit & Continue to Checkout"}
              </button>
            </div>
          </div>

          {/* Sidebar order summary */}
          <aside className="h-fit border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-24 rounded-3xl">
            <h2 className="mb-6 text-lg font-medium tracking-[-1px]">Selected Product</h2>
            <div className="flex gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f2f2f2]">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl font-bold text-neutral-300">C</div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-bold text-sm">{product.name}</h3>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800">
                  Custom Order
                </span>
                <p className="mt-1 text-xs text-neutral-500">{product.category?.name || "Custom"}</p>
                <p className="mt-2 font-semibold text-sm">Rs. {product.price}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-4">
              <p className="text-xs text-neutral-500 leading-relaxed">
                ⚠️ Custom products require a reference image for precision engraving and crafting.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
