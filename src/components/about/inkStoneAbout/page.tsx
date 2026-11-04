const InkStoneAbout = () => {
    return(
        <div className="w-full">
            <section className="w-full">
                <div className="w-full max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                    <div>
                        <div>
                            <span className="font-medium text-xs sm:text-sm px-3.5 py-1.5 tracking-tight rounded-md bg-[#e8e8e8] inline-block">Overview</span>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-3px] leading-tight text-gray-900 mt-2 sm:mt-3">
                                lorem ipsum lorem ipsum lorem
                            </h2>
                        </div>
                        <div className="mt-2">
                            <p className="text-xs sm:text-sm md:text-base text-gray-600">
                                Lorem ipsum dolor sit, amet consectetur adipisicing elit Odio at
                            </p>
                        </div>
                    </div>

                    {/* Row 1 */}
                    <div className="mt-8 sm:mt-12">
                        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
                            {/* Wide Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl bg-[#e5e5e5] min-h-[300px]">
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-2xl tracking-[-1px] text-gray-900 font-normal">lorem ipsum</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 mt-4 mb-6 leading-relaxed">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur dolorem repudiandae rem. Suscipit temporibus maxime error aut quidem eum at optio reprehenderit doloremque. Vel exercitationem sunt dolore saepe maxime minima.
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

                            {/* Narrow Card */}
                            <div className="min-h-[200px] md:min-h-[300px] w-full bg-[#e5e5e5] rounded-3xl flex flex-col justify-between p-6 sm:p-8">
                                <span className="text-2xl tracking-[-1px] text-gray-900 font-normal">lorem ipsum lorem ipsum</span>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-5 w-full mt-6">
                                    <span className="text-xs sm:text-sm text-gray-600 max-w-[180px] leading-relaxed">Lorem ipsum dolor sit amet consectetur</span>
                                    <span className="text-xs sm:text-sm text-gray-900 font-medium shrink-0">lorem ispum</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="mt-4 sm:mt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4 sm:gap-6">
                            {/* Narrow Card */}
                            <div className="min-h-[200px] md:min-h-[300px] w-full bg-[#e5e5e5] rounded-3xl flex flex-col justify-between p-6 sm:p-8 order-2 lg:order-1">
                                <span className="text-2xl tracking-[-1px] text-gray-900 font-normal">lorem ipsum lorem ipsum</span>
                                <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-5 w-full mt-6">
                                    <span className="text-xs sm:text-sm text-gray-600 max-w-[180px] leading-relaxed">Lorem ipsum dolor sit amet consectetur</span>
                                    <span className="text-xs sm:text-sm text-gray-900 font-medium shrink-0">lorem ispum</span>
                                </div>
                            </div>

                            {/* Wide Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 p-6 sm:p-8 rounded-3xl bg-[#e5e5e5] min-h-[300px] order-1 lg:order-2">
                                <div className="flex flex-col justify-between py-1">
                                    <div>
                                        <h3 className="text-2xl tracking-[-1px] text-gray-900 font-normal">lorem ipsum</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 mt-4 mb-6 leading-relaxed">
                                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur dolorem repudiandae rem. Suscipit temporibus maxime error aut quidem eum at optio reprehenderit doloremque. Vel exercitationem sunt dolore saepe maxime minima.
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