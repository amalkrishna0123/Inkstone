import { FaPlayCircle } from "react-icons/fa";

const aboutGallery = () => {
    return(
        <div className="mt-10">
            <section>
                <div className="bg-[#fff4ce] pb-10">
                    <div className="flex flex-col mb-10 justify-center items-center w-full pt-10">
                        <span className="text-sm tracking-[-1px] px-8 mb-2 py-2 rounded-3xl bg-[#fff]">Featured Videos</span>
                        <h2 className="text-5xl tracking-[-3px]">lorem ipsum in Action</h2>
                        <p className="mt-2 max-w-[400px] text-center text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum voluptatum ab explicabo numquam quo commodi, ut nam quibusdam atque nemo?</p>
                    </div>
                    <div className=" max-w-[1220px] mx-auto flex flex-col justify-center items-center">
                        <div className="w-full h-[500px] bg-[#fff] rounded-3xl px-6 py-6 flex justify-between items-center gap-3">
                            <div className="md:w-[65%] h-full bg-[#000] rounded-[20px]">
                                <div className="w-full h-full flex flex-col justify-end items-start gap-5 p-5">
                                    <h3 className="text-white text-3xl">Eleviq Vision X --- <span className="block">Cinematic Perfomance</span></h3>
                                    <p className="max-w-[400px] text-sm text-gray-400">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Nihil iure at est corrupti eos vitae rerum nisi suscipit. Illum, quod</p>
                                    <div className="flex items-center">
                                        <div className="flex items-center gap-2 pr-5 border-r border-[#fff]">
                                            <span className="text-[#ffea00] text-3xl"><FaPlayCircle/></span>
                                            <span className="text-gray-100">Watch Video</span>
                                        </div>
                                        <div className="pl-5 text-gray-100">12:48</div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:w-[35%] h-full flex flex-col gap-3 overflow-auto">
                                <div className="w-full flex justify-between items-center gap-2">
                                    <div className="w-[50%] h-[120px] rounded-2xl bg-[#000]"></div>
                                    <div className="md:w-[50%] flex flex-col justify-between h-[120px]">
                                        <div><span className="text-sm bg-[#e3e3e3] px-2 py-1 rounded-3xl">lorem</span></div>
                                        <p>Lorem ipsum dolor sit amet consectetur</p>
                                    </div>
                                </div>
                                <div className="w-full flex justify-between items-center gap-2">
                                    <div className="w-[50%] h-[120px] rounded-2xl bg-[#000]"></div>
                                    <div className="md:w-[50%] flex flex-col justify-between h-[120px]">
                                        <div><span className="text-sm bg-[#e3e3e3] px-2 py-1 rounded-3xl">lorem</span></div>
                                        <p>Lorem ipsum dolor sit amet consectetur</p>
                                    </div>
                                </div>
                                <div className="w-full flex justify-between items-center gap-2">
                                    <div className="w-[50%] h-[120px] rounded-2xl bg-[#000]"></div>
                                    <div className="md:w-[50%] flex flex-col justify-between h-[120px]">
                                        <div><span className="text-sm bg-[#e3e3e3] px-2 py-1 rounded-3xl">lorem</span></div>
                                        <p>Lorem ipsum dolor sit amet consectetur</p>
                                    </div>
                                </div>
                                <div className="w-full flex justify-between items-center gap-2">
                                    <div className="w-[50%] h-[120px] rounded-2xl bg-[#000]"></div>
                                    <div className="md:w-[50%] flex flex-col justify-between h-[120px]">
                                        <div><span className="text-sm bg-[#e3e3e3] px-2 py-1 rounded-3xl">lorem</span></div>
                                        <p>Lorem ipsum dolor sit amet consectetur</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default aboutGallery