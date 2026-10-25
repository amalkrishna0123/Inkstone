import { GiCrystalGrowth } from "react-icons/gi";
import { IoArrowRedoCircleSharp } from "react-icons/io5";

const AboutUsHomePage = () => {
    return (
        <div className="w-full flex flex-col gap-10 min-h-screen">
            <section className="w-full h-screen bg-gradient-to-b from-[#ffea00] to-[#cbba00] flex flex-col items-center justify-center">
                <div className="flex justify-center items-center gap-2 text-lg font-bold tracking-[-1px] mb-10">
                    <span><GiCrystalGrowth/></span>
                    <span>About SetBy</span>
                </div>

                <div className="mb-20">
                    <h2 className="text-[40px] md:text-6xl leading-tight tracking-[-3px] text-center">We bring logistics with flair and <span className="md:block">bright innovation. Trusted by those</span> <span className="md:block">who prize care, speed, and dedication.</span></h2>
                </div>

                <div>
                    <button className="flex items-center gap-3 tracking-[-1px] font-bold text-white px-10 py-2 bg-gradient-to-r from-[#000] to-[#272727cc] cursor-pointer transition-all hover:rounded-3xl">Who we are <span className="transition-all hover:translate-y-[-2px]"><IoArrowRedoCircleSharp/></span></button>
                </div>
             </section>
             </div>
    )
}

export default AboutUsHomePage;