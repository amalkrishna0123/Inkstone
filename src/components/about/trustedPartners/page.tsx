import { GiCrystalBall } from "react-icons/gi";

const TrustedPartners = () => {
    return(
        <div className="w-full">
            <section className="w-full">
                <div className="w-full max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-10 md:pt-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                        <div>
                            <div>
                                <span className="font-medium text-xs sm:text-sm px-3.5 py-1.5 tracking-tight rounded-md bg-[#e8e8e8] flex gap-2 items-center justify-center max-w-[250px]"><GiCrystalBall/> THE INKSTONE STANDARD</span>
                            </div>
                            <div className="mt-2 sm:mt-3">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-3px] leading-tight text-gray-900">
                                    Made with care 
                                    <span className="block">Chosen with purpose.</span>
                                </h2>
                            </div>
                        </div>
                        <div className="w-full md:max-w-[400px]">
                            <p className="text-left md:text-right text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                A closer look at the materials, people and attention to detail that shape our work.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12">
                        {/* Left column */}
                        <div className="w-full h-auto lg:h-[520px] flex flex-col gap-3 sm:gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:h-[300px]">
                                <div className="min-h-[180px] sm:min-h-0 sm:h-full w-full bg-amber-50 rounded-3xl border border-amber-100/60 shadow-sm"></div>
                                <div className="min-h-[180px] sm:min-h-0 sm:h-full w-full bg-amber-50 rounded-3xl border border-amber-100/60 shadow-sm"></div>
                                <div className="min-h-[180px] sm:min-h-0 sm:h-full w-full bg-amber-50 rounded-3xl border border-amber-100/60 shadow-sm"></div>
                            </div>
                            <div className="w-full bg-[#000] min-h-[160px] sm:min-h-[180px] lg:flex-1 rounded-3xl"></div>
                        </div>

                        {/* Right column */}
                        <div className="w-full bg-[#e3e3e2] rounded-3xl flex flex-col sm:flex-row gap-4 sm:gap-6 pr-2 sm:pr-4 lg:pr-4 min-h-[440px] lg:h-[520px]">
                            <div className="w-full sm:w-1/2 h-56 sm:h-full rounded-2xl sm:rounded-3xl bg-amber-200 shrink-0"></div>
                            <div className="w-full sm:w-1/2 flex flex-col justify-between py-2 sm:py-4 px-1 sm:px-2">
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900">The Art of Every Detail</h3>
                                    <span className="text-[#565656] text-xs sm:text-sm block mt-1">Beauty is found in the finest details.</span>
                                </div>
                                <div className="pt-6 sm:pt-10">
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                        At InkStone, we appreciate the beauty of thoughtful design and fine craftsmanship. Every crystal piece brings its own character through its form, clarity and finish. Our focus is on presenting creations that add a distinctive touch of elegance to everyday spaces and meaningful occasions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default TrustedPartners