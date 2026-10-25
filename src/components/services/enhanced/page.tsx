const ServiceEnhanced = () => {
    return(
        <div className="pt-10">
            <section className="min-h-screen w-full bg-gradient-to-r flex flex-col items-center justify-center from-[#000] to-[#292929]">
                <div className="w-full flex justify-between gap-10 p-10">
                    <div className="md:w-[40%] flex flex-col justify-center items-center">
                        <h2 className="text-[#fff] text-6xl tracking-[-3px] mb-3">Lorem ipsum dolor sit amet</h2>
                        <p className="text-[#c1c1c1]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem ipsum esse odit doloribus amet neque et suscipit itaque porro repellat. Obcaecati facilis quod in reprehenderit commodi natus qui, eligendi minima!</p>
                    </div>
                    <div className="md:w-[60%] flex justify-center items-center gap-5">
                        <div className="w-full h-[400px] bg-[#000] rounded-3xl relative overflow-hidden">
                            <div className="w-full h-full">
                                <img src="https://masterpics.com/images/masterpics.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                            <div className="absolute top-5 left-5 text-[#fff] text-2xl tracking-[-1px]">
                                <span>Relax and Rejuvenate</span>
                            </div>
                            <div className="absolute bottom-5 right-5">
                            <button className="bg-[#ffea00] text-sm font-medium px-5 py-2 rounded-3xl tracking-[-1px]">Explore Here</button></div>
                        </div>
                        <div className="w-full h-[400px] bg-[#000] rounded-3xl relative overflow-hidden">
                            <div className="w-full h-full">
                                <img src="https://masterpics.com/images/masterpics.jpg" alt="" className="w-full h-full object-cover"/>
                            </div>
                            <div className="absolute top-5 left-5 text-[#fff] text-2xl tracking-[-1px]">
                                <span>Relax and Rejuvenate</span>
                            </div>
                            <div className="absolute bottom-5 right-5">
                            <button className="bg-[#ffea00] text-sm font-medium px-5 py-2 rounded-3xl tracking-[-1px]">Explore Here</button></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ServiceEnhanced