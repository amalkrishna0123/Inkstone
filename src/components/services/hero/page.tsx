import Image from "next/image"
import inkStoneService1 from "../../../../public/inkstone_service_1.png"
import inkStoneService2 from "../../../../public/inkstone_service_2.png"
import inkStoneService3 from "../../../../public/inkstone_service_3.png"
import { RiDrawFill } from "react-icons/ri";
import { RxTransform } from "react-icons/rx";
import { GiButterfly } from "react-icons/gi";

const ServiceHero = () => {
    return(
        <div className="pt-20">
            <section>
                <div className="max-w-[1200px] w-full mb-5 mx-auto">
                    <div className="w-full relative px-10 py-10 flex flex-col md:flex-row justify-center items-end md:items-start md:justify-between min-h-[300px] bg-gradient-to-r from-[#e8e8e8] overflow-hidden to-[#f8f8f28c] rounded-3xl">
                        <div className="absolute top-0 bottom-0 left-0 right-0">
                            <video src="https://www.pexels.com/download/video/30767274/" autoPlay muted loop className="w-full h-full object-cover"></video>
                        </div>
                        <div className="relative z-10 text-white">
                            <h2 className="text-6xl tracking-[-3px]">Services</h2>
                        </div>

                        <div className="relative z-10 md:max-w-[400px] text-white mt-auto">
                            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde excepturi doloremque quasi nemo maxime blanditiis consequatur amet ipsa, nulla delectus.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="max-w-[1200px] w-full mx-auto">
                    <div>
                        <div className="grid lg:grid-cols-3 gap-x-5">
                            <div className="w-full relative h-[450px] bg-[#000] overflow-hidden rounded-3xl">
                                <div>
                                    <span className="bg-[#ffea00] p-2 rounded-full absolute top-3 right-3"><RiDrawFill/></span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#000] to-transparent h-[250px]"></div>
                                <div>
                                    <Image
                                      src={inkStoneService1}
                                      alt="InkStone Crystal"
                                      className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute z-20 bottom-5 p-5 text-white">
                                    <h6 className="text-2xl tracking-[-2px] mb-2">Capture the Memory</h6>
                                    <p className="text-sm text-[#dddddd]">We transform your photo into a lifelike 3D model while preserving every detail.</p>
                                </div>
                            </div>
                            <div className="w-full relative h-[450px] bg-[#000] overflow-hidden rounded-3xl">
                                <div>
                                    <span className="bg-[#ffea00] p-2 rounded-full absolute top-3 right-3"><RxTransform/></span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#000] to-transparent h-[250px]"></div>
                                <div>
                                    <Image
                                      src={inkStoneService2}
                                      alt="InkStone Crystal"
                                      className="w-full h-full object-cover object-center"
                                    />
                                </div>
                                <div className="absolute z-20 bottom-5 p-5 text-white">
                                    <h6 className="text-2xl tracking-[-2px] mb-2">Perfect the Details</h6>
                                    <p className="text-sm text-[#dddddd]">We refine every edge and contour for exceptional engraving quality and clarity.</p>
                                </div>
                            </div>
                            <div className="w-full relative h-[450px] bg-[#000] overflow-hidden rounded-3xl">
                                <div>
                                    <span className="bg-[#ffea00] p-2 rounded-full absolute top-3 right-3"><GiButterfly/></span>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[#000] to-transparent h-[250px]"></div>
                                <div>
                                    <Image
                                      src={inkStoneService3}
                                      alt="InkStone Crystal"
                                      className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute z-20 bottom-5 p-5 text-white">
                                    <h6 className="text-2xl tracking-[-2px] mb-2">Bring It to Life</h6>
                                    <p className="text-sm text-[#dddddd]">The finished design is engraved into your chosen crystal, creating a lasting keepsake.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ServiceHero