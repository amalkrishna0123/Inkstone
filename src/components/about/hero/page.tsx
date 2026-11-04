import Image from "next/image"
import aboutHero from "../../../../public/about_hero.png"

const AboutHero = () => {
    return(
        <div className="w-full">
            <section className="min-h-[85vh] sm:min-h-screen w-full relative bg-[#000] flex flex-col justify-end overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={aboutHero}
                        alt="About Hero"
                        priority
                        fill
                        className="object-cover object-center"
                        sizes="100vw"
                    />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-48 sm:h-72 md:h-96 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

                <div className="relative z-20 w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 md:py-16 max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-10">
                    <div className="flex flex-col items-baseline gap-2 sm:gap-3">
                        <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[9vw] tracking-[-2] sm:tracking-[-2px] md:tracking-[-4px] lg:tracking-[-8px] leading-[1.05] sm:leading-[1] md:leading-[0.95]">
                            About <span className="block text-[#ffea00]">InkStone</span>
                        </h1>
                    </div>
                    <div className="w-full md:max-w-[400px] shrink-0">
                        <p className="text-[#dbdbdbb5] text-sm sm:text-base leading-relaxed">
                            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque recusandae veniam velit molestiae? Consequatur fugit officiis consequuntur aliquam et eaque?
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default AboutHero