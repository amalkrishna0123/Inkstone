import { GiVineFlower } from "react-icons/gi";
import { MdNewReleases } from "react-icons/md";


const Business = () => {
    return(
        <div className="pt-32 md:pt-20">   
            <section className="flex flex-col items-center justify-center w-full">
                <div className="w-full px-2 md:px-10 max-w-[1200px] mx-auto">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-3">
                            <span className="bg-[#ffea00] p-1 text-xl"><MdNewReleases /></span>
                            <span>What's New</span>
                        </div>
                        <h2 className="text-[40px] leading-tight md:text-6xl tracking-[-3px]">Making news, making impact</h2>
                    </div>

                    <div className="grid md:grid-cols-3 w-full gap-5 mb-10">
                        <div className="w-full h-[400px] rounded-3xl bg-amber-100 overflow-hidden">
                            <div className="w-full h-full">
                                <img src="https://i.pinimg.com/1200x/6d/d8/fa/6dd8fa35daa081bb4258fdc2761ab13d.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                        </div>
                        <div className="w-full h-[400px] rounded-3xl bg-amber-100 overflow-hidden">
                            <div className="w-full h-full">
                                <img src="https://i.pinimg.com/736x/f0/73/5d/f0735d57a44e6a89e504216a93880989.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="w-full h-[190px] relative rounded-3xl bg-[#ffea00] flex flex-col justify-center items-center px-4 py-10 overflow-hidden">
                                {/* <div className="w-full h-full">
                                <img src="https://i.pinimg.com/736x/47/5d/b5/475db5f2fc6e2ae8134d10849ea749ea.jpg" alt="" className="w-full h-full object-cover"/>
                            </div> */}
                            <div className="">
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <h3 className="text-3xl font-medium text-[#292929] font mb-2 tracking-[-2px]">Preserve Your Most Precious Memories</h3>
                                    <GiVineFlower className=" md:text-[70px] opacity-70 absolute right-0 top-0 text-[#fffdfd]" />
                                </div>
                                <p className="text-gray-700 text-sm italic">Create unforgettable gifts with premium crystal engravings that preserve your most cherished memories forever.</p>
                            </div>
                            </div>
                            <div className="w-full h-[190px]">
                                <div className="px-2">
                                    <p>Transform your favorite photographs into breathtaking crystal masterpieces with precision laser engraving and exceptional craftsmanship. Designed to celebrate life's special moments, each piece captures memories with remarkable clarity and timeless elegance, making it a meaningful keepsake for generations to come.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Business