import { SiCrystal } from "react-icons/si";
import { FaArrowTrendDown } from "react-icons/fa6"; 
import AboutUsHomePage from "./about";


const About =() => {
    return (
        <div className="h-auto">
            <section className="">
                <AboutUsHomePage/>
            </section>

            {/* <section className="flex justify-center pt-20">
                <div className="flex justify-between items-end w-full max-w-[1200px] mx-auto">
                    <div>
                        <div className="gap-2 items-baseline">
                            <h2 className="text-6xl tracking-[-3px] flex gap-4">Our <span className="text-[#000000]">Notes</span><div className="text-6xl mb-5 text-[#ffea00]"><SiCrystal/></div></h2>
                            <p className="text-6xl tracking-[-3px]">Your new AI note taker</p>
                        </div>
                    </div>
                    <div className="text-lg cursor-pointer bg-gradient-to-r from-[#000000] to-[#272727cc] text-[#fff] px-10 py-2 rounded-lg flex items-center gap-2">Explore Our Notes <span className=""><FaArrowTrendDown/></span></div>
                </div>
            </section> */}

            {/* <section className="flex justify-center mt-14">
                <div className="h-[600px] w-full max-w-[1200px] mx-auto bg-[#ffffff1a] rounded-lg flex items-center justify-center text-2xl text-[#ffffffc4]">
                    <video src="/vid2.mp4" autoPlay loop muted className="w-full h-full object-cover rounded-lg" />
                </div>
            </section> */}

            {/* <section className="flex flex-col justify-center mt-14 max-w-[1200px] mx-auto">
                <div>
                    <h2 className="text-6xl text-[#000000c4] tracking-[-2px]">lorem ipsum kokann snnnsm smsnnskks
                        <span className="flex gap-3"> nssytrytuy srctcccs fstdrscs <div className="w-32 h-16"><video src="/vid2.mp4" className="w-full h-full object-cover rounded-full" /></div> ctrdstdtds</span>
                        <span>ctdsrdtrdstr tdtsdtdd</span> </h2>
                </div>

                <div className="w-full grid grid-cols-2 gap-10 mt-20">
                    <div></div>
                    <div className="flex flex-col gap-10">
                        <div className="flex gap-5 text-base text-[#000000c4]">
                            <div className="bg-gradient-to-r from-[#000000] to-[#272727cc] text-[#fff] px-10 py-2 rounded-3xl cursor-pointer">Internity</div>
                            <div className="bg-gradient-to-r from-[#000000] to-[#272727cc] text-[#fff] px-10 py-2 rounded-3xl cursor-pointer">Modernity</div>
                            <div className="bg-gradient-to-r from-[#000000] to-[#272727cc] text-[#fff] px-10 py-2 rounded-3xl cursor-pointer">Creativity</div>
                        </div>
                        <div>
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo facere itaque, aliquam, iste eveniet laudantium debitis, iure iusto numquam asperiores fuga quo sint minima adipisci? Sunt consectetur ab provident necessitatibus!
                        </div>
                        <div>
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Illo facere itaque, aliquam, iste eveniet laudantium debitis, iure iusto numquam asperiores fuga quo sint minima adipisci? Sunt consectetur ab provident necessitatibus!
                            lorem ipsum dolor sit amet consectetur adipisicing elit. Illo facere itaque, aliquam, iste eveniet laudantium debitis, iure iusto numquam asperiores fuga quo sint minima adipisci? Sunt consectetur ab provident necessitatibus!
                        </div>
                    </div>
                </div>
            </section> */}
        </div>
    )
}

export default About;