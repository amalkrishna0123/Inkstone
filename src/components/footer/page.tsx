import { FaArrowRight } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebook } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa6";
import { SiThreads } from "react-icons/si";

const PreFooter = () => {
    return(
        <div className="">
            <section className="bg-gradient-to-r from-[#000] to-[#202020ea] py-10">
                <div>
                    <div className="px-2 md:px-10 max-w-[1200px] mx-auto md:flex grid gap-5 md:gap-20 justify-between">
                        <div>
                            <span className="text-[#f1f1f1]">
                                Stay connected with us and continue your journey towards better health.
                                <span className="md:block">Explore helpful resources, nutrition tips, and updates about our latest juice blends and wellness programs.</span>
                            </span>
                            {/* <div>
                                <button>Order Now
                                    <span>
                                        <FaArrowRight />
                                    </span>
                                </button>
                            </div> */}
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[#ffea00]">Follow Us</span>
                            <div>
                                <ul className="flex items-center gap-5">
                                    <li className="p-2 bg-[#f1f1f1] rounded-3xl"><RiInstagramFill/></li>
                                    <li className="p-2 bg-[#f1f1f1] rounded-3xl "><IoLogoWhatsapp/></li>
                                    <li className="p-2 bg-[#f1f1f1] rounded-3xl "><FaFacebook/></li>
                                    <li className="p-2 bg-[#f1f1f1] rounded-3xl "><SiThreads/></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="md:flex grid gap-5 items-center justify-between pt-10 max-w-[1200px] mx-auto px-2 md:px-10 border-b border-[#f1f1f166] pb-10">
                        <div>
                            <button className="bg-[#ffea00] px-6 py-2.5 rounded-2xl flex items-center gap-2 tracking-[-1px]">Order Now
                                <span>
                                    <FaArrowRight />
                                </span>
                            </button>
                        </div>

                        <div className="text-[#f1f1f1]">© 2026 InkStone. All rights reserved</div>
                    </div>

                    <div className="flex items-center justify-between pt-10 max-w-full mx-auto px-2 md:px-10">
                        <div className="w-full overflow-hidden">
                            <h1 className="w-full text-center text-[26vw] font-light leading-[0.85] tracking-[-0.1em] text-[#f1f1f1]">
                                InkStone
                            </h1>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default PreFooter