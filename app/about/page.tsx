import AboutHero from "@/src/components/about/hero/page"
import TrustedPartners from "@/src/components/about/trustedPartners/page"
import InkStoneAbout from "@/src/components/about/inkStoneAbout/page"
import AboutGallery from "@/src/components/about/aboutGallery/page"

const AboutUs = () => {
    return(
        <div>
            <section>
                <AboutHero/>
            </section>

            <section>
                <TrustedPartners/>
            </section>

            <section>
             <InkStoneAbout/>
            </section>

            <section>
                <AboutGallery/>
            </section>
        </div>
    )
}

export default AboutUs