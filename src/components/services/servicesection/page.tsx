import { HiCursorArrowRipple } from "react-icons/hi2";

const ServiceSection = () => {
    return (
        <div>
            <section>
                <div className="min-h-[100svh] bg-[#ffffd2]">
                    <div className="max-w-[1200px] mx-auto py-10">
                        <div className="flex justify-between items-end gap-10">
                            <div>
                                <div className="mb-2">
                                    <label className="px-3 py-2 flex items-center gap-2 max-w-[160px] justify-center font-semibold bg-[#ffea00] text-sm font-medium tracking-[-1px]"><HiCursorArrowRipple/>Why Choose Us</label>
                                </div>
                                <div>
                                    <h2 className="text-5xl tracking-[-3px] max-w-[600px]">Creating Timeless Crystal Memories Shouldn't Be Complicated</h2>
                                </div>
                            </div>
                            <div>
                                <p className="md:max-w-[400px] text-right">From selecting the perfect design to precision engraving, we help you create personalized crystal keepsakes with confidence and lasting quality.</p>
                            </div>
                        </div>
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                            <div>
                                <ul className="flex flex-col gap-2">
                                    <li className="px-4 bg-[#fff] rounded-lg">
                                        <div className="flex items-center pt-3 justify-between h-[80px] overflow-hidden">
                                            <span className="text-9xl tracking-[-4px] pt-8 text-[#a8a8a830]">01</span>
                                            <span>Choosing the Perfect Crystal Design</span>
                                        </div>
                                    </li>
                                    <li className="px-4 bg-[#fff] rounded-lg">
                                        <div className="flex items-center pt-3 justify-between h-[80px] overflow-hidden">
                                            <span className="text-9xl tracking-[-4px] pt-8 text-[#a8a8a830]">02</span>
                                            <span>Finding a Truly Meaningful Gift</span>
                                        </div>
                                    </li>
                                    <li className="px-4 bg-[#fff] rounded-lg">
                                        <div className="flex items-center pt-3 justify-between h-[80px] overflow-hidden">
                                            <span className="text-9xl tracking-[-4px] pt-8 text-[#a8a8a830]">03</span>
                                            <span>Unsure About Photo Quality & Engraving</span>
                                        </div>
                                    </li>
                                    <li className="px-4 bg-[#fff] rounded-lg">
                                        <div className="flex items-center pt-3 justify-between h-[80px] overflow-hidden">
                                            <span className="text-9xl tracking-[-4px] pt-8 text-[#a8a8a830]">04</span>
                                            <span>Need Fast Delivery Without Compromise</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="h-full w-full bg-[#fff] rounded-2xl overflow-hidden">
                                <div className="h-[60%] w-full bg-[#000] rounded-b-2xl"></div>
                                <div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ServiceSection