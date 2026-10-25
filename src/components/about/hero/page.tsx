import Image from "next/image"
import aboutHero from "../../../../public/about_hero.png"

const AboutHero = () => {
    return(
        <div>
            <section className="min-h-screen w-full">
                <div className="relative min-h-screen w-full bg-[#000] flex flex-col justify-end">
                    <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-b from-transparent to-[#000] z-10"></div>
                    <div className="absolute top-0 bottom-0 left-0 right-0">
                        <Image src={aboutHero} alt="About Hero" className="w-full h-full object-cover" />
                    </div>
                    <div className="px-10 z-20 relative py-10 md:flex md:justify-between md:items-end md:gap-10">
                        
                        <div className="flex flex-col items-baseline gap-3">
                            {/* <p className="text-[#dbdbdbb5] max-w-[400px]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi facilis ex distinctio aliquid quos quis obcaecati nisi ratione, sapiente cupiditate.</p> */}
                            <h3 className="text-white text-[10vw] tracking-[-12px] leading-[120px]">About <span className="block text-[#ffea00]">InkStone</span></h3>
                        </div>
                        <div className="max-w-[400px]">
                            <p className="text-[#dbdbdbb5]">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque recusandae veniam velit molestiae? Consequatur fugit officiis consequuntur aliquam et eaque?</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutHero