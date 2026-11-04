const TrustedPartners = () => {
    return(
        <div className="w-full">
            <section className="w-full">
                <div className="w-full max-w-[1220px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                        <div>
                            <div>
                                <span className="font-medium text-xs sm:text-sm px-3.5 py-1.5 tracking-tight rounded-md bg-[#e8e8e8] inline-block">lorem ipsum</span>
                            </div>
                            <div className="mt-2 sm:mt-3">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-3px] leading-tight text-gray-900">
                                    Trusted Partners
                                    <span className="block">Chosen for Every Mission.</span>
                                </h2>
                            </div>
                        </div>
                        <div className="w-full md:max-w-[400px]">
                            <p className="text-left md:text-right text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                                lore ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
                        <div className="w-full bg-[#e3e3e2] rounded-3xl flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 min-h-[440px] lg:h-[520px]">
                            <div className="w-full sm:w-1/2 h-56 sm:h-full rounded-2xl sm:rounded-3xl bg-amber-200 shrink-0"></div>
                            <div className="w-full sm:w-1/2 flex flex-col justify-between py-2 sm:py-4 px-1 sm:px-2">
                                <div>
                                    <h3 className="text-2xl sm:text-3xl font-normal tracking-tight text-gray-900">lorem ipsum</h3>
                                    <span className="text-[#565656] text-xs sm:text-sm block mt-1">lorem ipsum dolor sit</span>
                                </div>
                                <div className="pt-6 sm:pt-10">
                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Deleniti, dolorem, aperiam optio veniam illo ea nobis distinctio cumque blanditiis recusandae minus iste corporis ratione ipsa laboriosam eveniet odit ab quae.
                                        Explicabo, optio neque. Sapiente inventore unde est ipsum quae officia optio nihil deleniti quas dolore sunt, ratione rem, quod dignissimos saepe eius distinctio corrupti debitis! Ratione animi alias fugit vero!
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