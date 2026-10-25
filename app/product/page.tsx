import ProductHero from "@/src/components/product/hero/page"
import ProductDetail from "@/src/components/product/product details/page"

const MainProduct = () => {
    return(
        <div>
            <section>
                <ProductHero/>
            </section>

            <section>
                <ProductDetail/>
            </section>
        </div>
    )
}

export default MainProduct