import ServiceEnhanced from "@/src/components/services/enhanced/page"
import ServiceHero from "@/src/components/services/hero/page"
import ServiceRules from "@/src/components/services/rules/page"
import ServiceSection from "@/src/components/services/servicesection/page"
import WallpaperSection from "@/src/components/services/wallpaper/page"

const Service = () => {
    return(
        <div>
            <section>
                <ServiceHero/>
            </section>

            <section>
                <ServiceEnhanced/>
            </section>

            <section>
                <ServiceSection/>
            </section>

            <section>
                <WallpaperSection/>
            </section>

            <section>
                <ServiceRules/>
            </section>
        </div>
    )
}

export default Service