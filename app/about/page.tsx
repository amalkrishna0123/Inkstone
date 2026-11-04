import AboutHero from "@/src/components/about/hero/page"
import TrustedPartners from "@/src/components/about/trustedPartners/page"
import InkStoneAbout from "@/src/components/about/inkStoneAbout/page"
import AboutGallery from "@/src/components/about/aboutGallery/page"

const AboutUs = () => {
    return(
        <main className="w-full overflow-x-hidden min-h-screen">
            <section className="w-full">
                <AboutHero/>
            </section>

            <section className="w-full">
                <TrustedPartners/>
            </section>

            <section className="w-full">
                <InkStoneAbout/>
            </section>

            <section className="w-full">
                <AboutGallery/>
            </section>
        </main>
    )
}

export default AboutUs