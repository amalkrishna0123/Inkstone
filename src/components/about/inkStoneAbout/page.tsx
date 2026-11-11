import { MdOutlineViewInAr } from "react-icons/md";

const InkStoneAbout = () => {
    return(
        <div className="w-full">
            <section className="w-full">
                <div className="w-full max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-20">
                    <div>
                        <div>
                            <span className="font-medium text-xs sm:text-sm px-3.5 py-1.5 tracking-tight rounded-md bg-[#e8e8e8] flex gap-2 items-center max-w-[120px] justify-center"><MdOutlineViewInAr/>Overview</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-3px] leading-tight text-gray-900 mt-2 sm:mt-3">
                                Every Detail Reflects a Touch of Brilliance.
                            </h2>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                It feels sophisticated, meaningful and perfectly suited to a premium crystal brand like InkStone
                            </p>
                        </div>
                    </div>

                    {/* Row 1 */}
                    <div className="mt-8 sm:mt-12">
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
                            {/* Wide Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 rounded-3xl bg-[#e5e5e5] min-h-[300px]">
                                <div className="flex flex-col justify-between p-6 sm:p-8">
                                    <div>
                                        <h3 className="text-2xl tracking-[-1px] text-gray-900 font-normal">A Passion for Timeless Beauty</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 mt-4 mb-6 leading-relaxed">
                                            At InkStone, we believe every crystal holds a unique charm. Our passion lies in transforming beautiful ideas into elegant creations that bring sophistication, character, and lasting beauty to every space.
                                        </p>
                                    </div>
                                    <div>
                                        <button className="bg-[#ffea00] hover:bg-[#ffe300] transition-colors px-6 py-2.5 rounded-full text-xs sm:text-sm tracking-[-1px] font-medium text-gray-900 cursor-pointer">
                                            lorem ipsum
                                        </button>
                                    </div>
                                </div>
                                <div className="h-48 sm:h-56 md:h-full min-h-[180px] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-300 flex items-center justify-center">
                                    <div className="w-full h-full bg-gradient-to-tr from-neutral-400/40 to-neutral-200/60" >
                                        <img src="" alt="" className="w-full h-full object-cover"/>
                                    </div>
                                </div>
                            </div>

                            {/* Narrow Card */}
                            <div className="min-h-[200px] md:min-h-[300px] w-full bg-[#e5e5e5] rounded-3xl flex flex-col justify-between p-6 sm:p-8">
                                <span className="text-2xl tracking-[-1px] text-gray-900 font-normal">Beauty Beyond Appearance</span>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-5 w-full mt-6">
                                    <span className="text-xs sm:text-sm text-gray-600 max-w-[180px] leading-relaxed">We believe true elegance lives in the details, from thoughtful designs to the beauty of every finish.</span>
                                    <span className="text-xs sm:text-sm text-gray-900 font-medium shrink-0">Our Philosophy</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
                            {/* Narrow Card */}
                            <div className="min-h-[200px] md:min-h-[300px] w-full bg-[#e5e5e5] rounded-3xl flex flex-col justify-between p-6 sm:p-8 order-2 lg:order-1">
                                <span className="text-2xl tracking-[-1px] text-gray-900 font-normal">Creating Moments That Last</span>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-5 w-full mt-6">
                                    <span className="text-xs sm:text-sm text-gray-600 max-w-[180px] leading-relaxed">Lorem ipsum dolor sit amet consectetur</span>
                                    <span className="text-xs sm:text-sm text-gray-900 font-medium shrink-0">lorem ispum</span>
                                </div>
                            </div>

                            {/* Wide Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 rounded-3xl bg-[#e5e5e5] min-h-[300px] order-1 lg:order-2">
                                <div className="flex flex-col justify-between p-6 sm:p-8">
                                    <div>
                                        <h3 className="text-2xl tracking-[-1px] text-gray-900 font-normal">Creating Moments That Last</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 mt-4 mb-6 leading-relaxed">
                                            Our vision is to make crystal artistry a part of meaningful moments. We aim to create pieces that capture attention, inspire creativity, and become lasting expressions of elegance.
                                        </p>
                                    </div>
                                    <div>
                                        <button className="bg-[#ffea00] hover:bg-[#ffe300] transition-colors px-6 py-2.5 rounded-full text-xs sm:text-sm tracking-[-1px] font-medium text-gray-900 cursor-pointer">
                                            lorem ipsum
                                        </button>
                                    </div>
                                </div>
                                <div className="h-48 sm:h-56 md:h-full min-h-[180px] w-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-300 flex items-center justify-center">
                                    <div className="w-full h-full bg-gradient-to-tr from-neutral-400/40 to-neutral-200/60" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default InkStoneAbout