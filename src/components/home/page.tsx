import LoginPage from "../auth/login/page";
import About from "./about/page"
import Business from "./business/page";
import Connect from "./connect/page";
import CustomerStories from "./customer stories/page";
import Enhanced from "./enhanced/page";
import Hero from "./hero/page"
import PreFooter from "./pre footer/page";
import ProductHomePage from "./product/page";
import HomeServices from "./services/page";

const HomePage = () => {
    return (
        <div>
            <section>
                <Hero/>
            </section>

            <section>
                <About/>
            </section>

            <section>
                <ProductHomePage/>
            </section>

            <section>
                <Enhanced/>
            </section>

            <section>
                <HomeServices/>
            </section>

            <section>
                <Business/>
            </section>

            <section>
                <CustomerStories />
            </section>

            <section>
                <Connect/>
            </section>
{/* 
            <section>
                <PreFooter/>
            </section> */}

            {/* <section>
                <LoginPage/>
            </section> */}
        </div>
        
    )
}

export default HomePage;