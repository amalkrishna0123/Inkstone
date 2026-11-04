import { FaPlayCircle } from "react-icons/fa";

const AboutGallery = () => {
    return(
        <div className="w-full mt-10">
            <section className="w-full">
                <div className="bg-[#fff4ce] py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col mb-8 sm:mb-12 justify-center items-center text-center w-full max-w-3xl mx-auto">
                        <span className="text-xs sm:text-sm tracking-tight px-6 py-2 rounded-full bg-[#fff] font-medium shadow-xs mb-3">Featured Videos</span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight sm:tracking-[-2px] md:tracking-[-3px] text-gray-900 leading-tight">
                            lorem ipsum in Action
                        </h2>
                        <p className="mt-2.5 max-w-[440px] text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum voluptatum ab explicabo numquam quo commodi, ut nam quibusdam atque nemo?
                        </p>
                    </div>

                    <div className="max-w-[1220px] mx-auto">
                        <div className="w-full bg-[#fff] rounded-3xl p-4 sm:p-6 lg:p-7 shadow-sm flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[540px]">
                            {/* Main Video Highlight */}
                            <div className="w-full lg:w-[62%] xl:w-[65%] min-h-[320px] sm:min-h-[380px] lg:h-full bg-[#000] rounded-2xl sm:rounded-[20px] flex flex-col justify-end p-5 sm:p-8 relative overflow-hidden">
                                <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
                                    <h3 className="text-white text-xl sm:text-2xl md:text-3xl font-normal tracking-tight">
                                        Eleviq Vision X --- <span className="block sm:inline lg:block">Cinematic Perfomance</span>
                                    </h3>
                                    <p className="max-w-[440px] text-xs sm:text-sm text-gray-400 leading-relaxed">
                                        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil iure at est corrupti eos vitae rerum nisi suscipit. Illum, quod
                                    </p>
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-2 pr-4 sm:pr-5 border-r border-[#fff]/40 cursor-pointer group">
                                            <span className="text-[#ffea00] text-2xl sm:text-3xl group-hover:scale-110 transition-transform"><FaPlayCircle/></span>
                                            <span className="text-gray-100 text-xs sm:text-sm font-medium">Watch Video</span>
                                        </div>
                                        <div className="text-gray-100 text-xs sm:text-sm font-mono">12:48</div>
                                    </div>
                                </div>
                            </div>

                            {/* Playlist */}
                            <div className="w-full lg:w-[38%] xl:w-[35%] flex flex-col gap-3 sm:gap-4 overflow-y-auto max-h-[380px] lg:max-h-none lg:h-full pr-1">
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="w-full flex items-center gap-3 sm:gap-4 p-2 rounded-2xl hover:bg-neutral-50 transition-colors cursor-pointer border border-transparent hover:border-neutral-200/60">
                                        <div className="w-28 sm:w-32 h-20 sm:h-22 rounded-2xl bg-[#000] shrink-0"></div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between h-20 sm:h-22 py-1">
                                            <div>
                                                <span className="text-[11px] font-medium bg-[#e3e3e3] px-2.5 py-0.5 rounded-3xl inline-block">lorem</span>
                                            </div>
                                            <p className="text-xs sm:text-sm text-gray-800 line-clamp-2 leading-snug">
                                                Lorem ipsum dolor sit amet consectetur
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutGallery