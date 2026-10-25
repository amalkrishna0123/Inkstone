"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiUploadCloud, FiTrash2, FiImage } from "react-icons/fi";
import { Product } from "@/src/lib/inkstone-api";

export default function ProductAttachmentPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedProduct = sessionStorage.getItem("crystal_checkout_product");
    if (storedProduct) {
      try {
        setProduct(JSON.parse(storedProduct) as Product);
      } catch {
        sessionStorage.removeItem("crystal_checkout_product");
      }
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
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
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
        const url = URL.createObjectURL(droppedFile);
        setPreview(url);
      } else {
        alert("Please drop an image file.");
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (file) {
      setIsUploading(true);
      try {
        const { api } = await import("@/src/lib/inkstone-api");
        const res = await api.uploadOrderAttachment(file);
        sessionStorage.setItem("crystal_checkout_attachment", res.image_url);
        router.push("/checkout");
      } catch (e) {
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      router.push("/checkout");
    }
  };

  if (!product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 py-20">
        <div className="w-full max-w-md border border-black/10 bg-white p-8 text-center">
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
      <div className="mx-auto max-w-4xl px-5 py-8 sm:py-12 pt-24">
        <Link href={`/product/${productId}`} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-black">
          <FiArrowLeft /> Back to product
        </Link>
        
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8d8300]">Customize your order</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Attach an Image.</h1>
          <p className="mt-4 text-sm text-neutral-500">Provide an image for customization or reference. You can optionally skip this step.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Main upload section */}
          <div className="border border-black/10 bg-white p-6 sm:p-10 shadow-sm">
            <h2 className="mb-6 text-xl font-bold">Upload Image</h2>
            
            {!preview ? (
              <div 
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors duration-200 ${
                  isDragging ? "border-[#ffea00] bg-[#ffea00]/5" : "border-neutral-200 bg-neutral-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-[#4a5c3a]">
                  <FiUploadCloud className="text-2xl" />
                </div>
                <h3 className="mb-2 text-lg font-bold">Drag & Drop to Upload</h3>
                <p className="mb-6 text-sm text-neutral-400">or click below to browse your files (PNG, JPG, max 5MB)</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#ffea00] hover:text-black"
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
                      <p className="text-xs text-neutral-400">{(file?.size! / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
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
                onClick={() => router.push("/checkout")}
                className="rounded-full bg-neutral-100 px-6 py-3 text-sm font-bold text-neutral-600 transition hover:bg-neutral-200"
              >
                Skip this step
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isUploading}
                className="rounded-full bg-[#ffea00] px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-900 hover:text-[#ffea00] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Submit & Continue"}
              </button>
            </div>
          </div>

          {/* Sidebar order summary */}
          <aside className="h-fit border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-6 text-lg font-bold">Selected Product</h2>
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
                <p className="mt-1 text-xs text-neutral-500">{product.category.name}</p>
                <p className="mt-2 font-semibold text-sm">Rs. {product.price}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
