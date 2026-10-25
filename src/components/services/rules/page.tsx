const ServiceRules = () => {
    return(
        <div>
            <section>
                <div className="bg-[#dddddd]">
                    <div className="min-h-[100svh] flex flex-col justify-center items-center max-w-[1200px] mx-auto">
                        <div className="flex flex-col justify-center items-center">
                            <span className="text-sm mb-2 bg-gray-100 px-2 rounded-3xl py-1">lorem ipsum</span>
                            <h2 className="text-5xl tracking-[-3px] mb-3">lorem ipsum lorem ipsum</h2>
                            <p className="max-w-[400px] text-center text-sm">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam quo officiis obcaecati nulla vitae aliquam voluptate beatae hic ad distinctio.</p>
                        </div>
                        <div className="grid grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-2 items-end w-full mt-10">
                            <div className="w-full h-[200px] bg-[#fff] rounded-2xl"></div>
                            <div className="w-full h-[300px] bg-[#fefdfd] overflow-hidden rounded-3xl">
                                <div className="h-[55%] w-full overflow-hidden rounded-3xl bg-[#0f0f0f]">
                                    <img src="" className="w-full h-full object-cover" alt="" />
                                </div>
                                <div></div>
                            </div>
                            <div className="w-full h-[200px] bg-gray-300 rounded-2xl"></div>
                            <div className="w-full h-[200px] bg-gray-300 rounded-2xl"></div>
                            <div className="w-full h-[200px] bg-gray-300 rounded-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ServiceRules