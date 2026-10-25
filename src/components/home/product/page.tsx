"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Category, Product } from "@/src/lib/inkstone-api";
import { LuCircleArrowOutUpRight } from "react-icons/lu";

// Static gradient fallbacks for when a category has no product image
const FALLBACK_GRADIENTS = [
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)",
    "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    "linear-gradient(135deg, #0c0c0c 0%, #403d39 50%, #252422 100%)",
];

const FEATURED_CATEGORIES = [
    {
        id: "cm",
        name: "CM",
        description: "Crystal Moments that speak beyond works",
    },
    {
        id: "key-chain",
        name: "Key Chain",
        description: "Carry your Stories wherever you go",
    },
    {
        id: "locket",
        name: "Locket",
        description: "Personlized keepsakes that last a lifetime",
    },
];

const ProductHomePage = () => {
    const [categories, setCategories] = useState<(Category & { product_image_url?: string })[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [categoriesData, productsData] = await Promise.all([
                    api.getCategories(),
                    api.getProducts()
                ]);

                // Filter active and limit to 3 categories
                const activeCats = categoriesData.filter((c) => c.is_active).slice(0, 3);

                const catsWithProductImage = activeCats.map(cat => {
                    // Find a product in this category that has an image
                    const productInCat = productsData.find(p => p.category.id === cat.id && p.image_url);
                    return {
                        ...cat,
                        product_image_url: productInCat?.image_url || cat.image_url || ""
                    };
                });

                setCategories(catsWithProductImage);
            } catch (error) {
                console.error("Failed to load data:", error);
            }
        }
        void loadData();
    }, []);

    return (
        <div className="w-full flex flex-col items-center justify-center">
            {/* <section className="w-full h-screen flex items-center justify-center text-center">
                <h2 className="text-6xl tracking-[-3px]">Find out what's possible
                    <span className="text-[#ffea00] text-shadow-[#60606009] text-shadow-2xs"> when work connects</span>
                </h2>
            </section> */}

            <section className="w-full min-h-screen flex items-center justify-center text-center bg-gradient-to-r from-[#000] to-[#121212b3] px-2 py-5 md:p-10">
                <div className="w-full pt-10">
                    <h2 className="text-[40px] md:text-6xl tracking-[-3px] text-[#fff] leading-tight md:leading-tight">Create something beautiful 
                        <span className="text-[#ffea00] text-shadow-[#60606009] text-shadow-2xs md:block">from every memory</span>
                    </h2>
                    <div className="flex items-center justify-center gap-10">
                        <p className="max-w-[450px] m-auto pt-3 text-gray-200">Not every memory should look the same. Discover distinct forms made to preserve the moments that mean something to you.</p>
                    </div>
                    <div className="w-full">
                        <div className="w-full max-w-[1100px] display grid grid-cols-1 md:grid-cols-3 gap-3 mt-10 mx-auto px-2 py-5 md:p-10 rounded-lg">
                            {FEATURED_CATEGORIES.map((featuredCategory, index) => {
                                const categoryImageUrl = categories[index]?.product_image_url || "";

                                return (
                                <Link key={featuredCategory.id} href="/product" className="w-full">
                                <div
                                    className="relative w-full cursor-pointer h-[350px] border-1 border-[#ffffff5b] rounded-3xl overflow-hidden group"
                                    style={!categoryImageUrl ? { background: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] } : {}}
                                >
                                    {/* Dynamic product/category image */}
                                    {categoryImageUrl && (
                                        <img
                                            src={categoryImageUrl}
                                            alt={featuredCategory.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                // Show gradient fallback on error
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) parent.style.background = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
                                            }}
                                        />
                                    )}

                                    {/* Gradient overlay for text readability */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff15] to-[#00000090] z-[1] pointer-events-none"></div>
                                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors duration-300 z-[1] pointer-events-none"></div>

                                    {/* Content */}
                                    <div className="relative z-10 h-full flex flex-col items-center justify-end text-white ">
                                        <div className="bg-gradient-to-t from-[#000] w-full p-6">
                                                <div className="w-full flex items-end justify-between mb-2">
                                                    <div className="flex flex-col justify-start items-start max-w-[70%]">
                                                        <h3 className="text-2xl font-bold mb-1 drop-shadow-md text-start">{featuredCategory.name}</h3>
                                                        <p className="text-gray-200 text-sm line-clamp-3 text-start drop-shadow-md">{featuredCategory.description}</p>
                                                    </div>
                                                    <span className="max-w-[40%] text-[#ffea00]"><LuCircleArrowOutUpRight/></span>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProductHomePage;
