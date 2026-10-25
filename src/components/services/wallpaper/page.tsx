import wallpaperImg from "../../../../public/service_wallpaper.png"
import Image from "next/image"
import { TiTick } from "react-icons/ti";

const WallpaperSection = () => {
    return (
        <div>
            <section>
                <div>
                    <div className="h-[100svh] relative w-full">
                        <Image src={wallpaperImg} className="w-full h-full object-cover absolute top-0 bottom-0 left-0 right-0" alt="Wallpaper" />
                        <div className="bottom-0 left-0 w-full absolute right-0 h-[700px] bg-gradient-to-t from-[#000] to-transparent"></div>
                        <div className="relative flex flex-col items-center justify-end h-full w-full px-4 pb-10">
                            <h2 className="text-white text-5xl mb-2 text-center tracking-[-2px]">Preserve Memories <span className="block">Beyond Time</span></h2>
                            <p className="text-gray-400 text-center max-w-[600px]">Celebrate the people and moments that matter most with premium laser engraved crystal gifts, handcrafted to become treasured keepsakes for generations.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-10 w-full max-w-[600px]">
                                <div className="h-[120px] w-full bg-[#ffea00] rounded-lg px-5 py-5 flex flex-col justify-between">
                                    <label className="text-2xl tracking-[-1px] leading-tight">Custom Design</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Made Just for You</span>
                                        <span ><TiTick  className="bg-green-500 w-[15px] h-[15px] rounded-full"/></span>
                                    </div>
                                </div>
                                <div className="h-[120px] w-full bg-[#fff] rounded-lg px-5 py-5 flex flex-col justify-between">
                                    <label className="text-2xl tracking-[-1px] leading-tight">Premium Crystal</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Exceptional Clarity</span>
                                        <span ><TiTick  className="bg-green-500 w-[15px] h-[15px] rounded-full"/></span>
                                    </div>
                                </div>
                                <div className="h-[120px] w-full bg-[#fff] rounded-lg px-5 py-5 flex flex-col justify-between">
                                    <label className="text-2xl tracking-[-1px] leading-tight">3D Engraving</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Precision Laser Etched</span>
                                        <span ><TiTick  className="bg-green-500 w-[15px] h-[15px] rounded-full"/></span>
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

export default WallpaperSection