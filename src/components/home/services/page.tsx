import { SiCountingworkspro } from "react-icons/si";

const HomeServices = () => {
    return (
        <div className="w-full mt-36 h-screen flex flex-col justify-center">
            {/* <h2 className="text-6xl tracking-[-3px]">Find out what's possible
                <span className="text-[#ffea00] text-shadow-[#60606009] text-shadow-2xs block"> when work connects</span>
            </h2> */}

            <section className="w-full max-w-[1200px] mx-auto px-2">
                <div>
                    <div className="w-full grid grid-cols-1  md:flex md:justify-between items-start">
                        <div className="flex items-center gap-3 text-2xl font-bold">
                            <span className="bg-[#ffea00] p-2 text-[15px] md:text-base"><SiCountingworkspro /></span>
                            <p className="text-black tracking-[-1px] text-[15px] md:text-base">Featured Services</p>
                        </div>

                        <div className="text-[40px] leading-tight md:text-6xl pt-5 md:pt-0 tracking-[-3px] md:text-right">
                            Personalized crystal gifts <span className="block">for every occasion</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full max-w-[1200px] mx-auto mt-20 px-2">
                <div className="w-full">
                    <div className="w-full flex justify-between border-t border-[#00000054] py-10">
                        <div className="text-2xl font-medium">Custom 3D Crystal Engraving</div>

                        <div className="flex justify-center items-center gap-10 md:w-[40%]">
                            <div className="text-right">Turn your favorite photos into stunning laser engraved crystal keepsakes with exceptional detail and clarity.</div>
                            {/* <div>lorem ipsum</div>
                            <div>lorem ipsum</div> */}
                        </div>
                    </div>

                    <div className="w-full flex justify-between border-t border-[#00000054] py-10">
                        <div className="text-2xl font-medium">Wedding & Anniversary Keepsakes</div>

                        <div className="flex justify-center items-center gap-10 md:w-[40%]">
                            <div className="text-right">Preserve your most meaningful moments with beautifully engraved crystal memories that last forever.</div>
                            {/* <div>lorem ipsum</div>
                            <div>lorem ipsum</div> */}
                        </div>
                    </div>

                    <div className="w-full flex justify-between border-t border-[#00000054] py-10">
                        <div className="text-2xl font-medium">Memorial & Tribute Crystals</div>

                        <div className="flex justify-center items-center gap-10 md:w-[40%]">
                            <div className="text-right">Honor loved ones with elegant crystal keepsakes that preserve treasured memories for generations.</div>
                            {/* <div>lorem ipsum</div>
                            <div>lorem ipsum</div> */}
                        </div>
                    </div>

                    <div className="w-full flex justify-between border-t border-[#00000054] py-10">
                        <div className="text-2xl font-medium">Home Decor & Display Pieces</div>

                        <div className="flex justify-center items-center gap-10 md:w-[40%]">
                            <div className="text-right">Enhance your living space with beautifully crafted crystal décor and display pieces that showcase your unique style.</div>
                            {/* <div>lorem ipsum</div>
                            <div>lorem ipsum</div> */}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default HomeServices;