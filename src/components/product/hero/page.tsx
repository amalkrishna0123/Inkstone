import { FaArrowRight } from "react-icons/fa6";
import productHero from "../../../../public/product_hero.png"
import Image from "next/image";
import { GiLoveLetter } from "react-icons/gi";

const ProductHero = () => {
    return(
        <div>
            <section className="flex justify-center items-center w-full min-h-screen bg-gradient-to-r from-amber-50 to-amber-200">
                <div className="w-full min-h-screen">
                    <div className="grid w-full min-h-screen max-w-[1200px] mx-auto px-5 pt-20 pb-5 md:p-5 grid-cols-1 md:grid-cols-2 place-items-center">
                        <div className="w-full h-full bg-[#fff] p-5 md:rounded-l-3xl rounded-t-3xl flex flex-col justify-center items-center">
                            <div>
                                <div>
                                    <span></span>
                                    <p></p>
                                </div>
                                <div>
                                    <span></span>
                                </div>
                            </div>
                            <div className="text-center flex flex-col gap-2 mb-5 h-full justify-center">
                                <span className="font-semibold tracking-[-1px] flex justify-center items-center gap-2"><span className="bg-[#ffea00] p-1"><GiLoveLetter/></span>Made to Remember</span>
                                <h3 className="text-4xl tracking-[-2px] md:text-6xl md:tracking-[-3px]">Made for the moments you'll tell stories about years from now</h3>
                            </div>
                            <div className="relative bottom-0 mt-auto pb-0 grid  md:flex justify-between gap-5 md:gap-10 items-end w-full">
                                <button className="pl-5 tracking-[-1px] cursor-pointer pr-2 py-2 bg-gradient-to-r from-[#000] to-[#292929de] text-[#fff] rounded-3xl flex justify-between items-center gap-10">
                                    Start Shopping <span className="text-[#000] w-[30px] h-[30px] flex items-center justify-center p-1.5 rounded-full bg-[#ffea00]"><FaArrowRight/></span>
                                </button>
                                <div>
                                    <p className="max-w-[300px] text-center md:text-start">Give your most meaningful moments a place beyond the screen.</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full h-full bg-[#d8d8d8d2] rounded-b-3xl md:rounded-r-3xl flex justify-end items-center">
                            <div className="w-full h-full max-h-screen">
                                <Image
                                    src={productHero}
                                    alt="InkStone Crystal"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProductHero