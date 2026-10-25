const ContactHero = () => {
    return(
        <div className="pt-20 pb-10 bg-gradient-to-r from-[#fffcf5] to-[#e2e2e2]">
            <section className="min-h-screen w-full">
                <div className="max-w-[1200px] border border-[#00000010] p-3 gap-3 grid md:grid-cols-[1fr_1.5fr] min-h-screen rounded-3xl w-full mx-auto bg-[#fff]">
                    <div className="w-full rounded-[16px] h-full bg-gradient-to-r from-[#dbdbdb] to-[#f7f6ed] px-5 py-5 flex flex-col justify-center items-center">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-6xl tracking-[-4px] text-[#141414] text-center">We'd love to help</h3>
                            <p className="text-[#1a1a1adb] text-center tracking-[-1px]">We're a full service agency with experts ready to help. We'ill get in touch within 24 hours.</p>
                        </div>

                        <div>
                            <form action="" className="">
                                <div className="grid md:grid-cols-2 gap-5 mt-10 mb-3">
                                <div className="w-full">
                                    <label className="text-[#1c1c1cdb] text-sm tracking-[-1px]">First Name</label>
                                    <input type="text" className="w-full bg-[#ffffff6b] border-[#fff] border-[2px] focus-within:border-[#ffea00] rounded-md px-3 py-2 outline-none"/>
                                </div>
                                <div className="w-full">
                                    <label className="text-[#1c1c1cdb] tracking-[-1px] text-sm">Last Name</label>
                                    <input type="text" className="w-full bg-[#ffffff6b] border-[#fff] border-[2px] focus-within:border-[#ffea00] rounded-md px-3 py-2 outline-none"/>
                                </div>
                                </div>
                                <div className="w-full mb-3">
                                    <label className="text-[#1c1c1cdb] tracking-[-1px] text-sm">E-mail</label>
                                    <input type="text" className="w-full bg-[#ffffff6b] border-[#fff] border-[2px] focus-within:border-[#ffea00] rounded-md px-3 py-2 outline-none"/>
                                </div>
                                <div className="w-full mb-3">
                                    <label className="text-[#1c1c1cdb] tracking-[-1px] text-sm">Phone Number</label>
                                    <input type="text" className="w-full bg-[#ffffff6b] border-[#fff] border-[2px] focus-within:border-[#ffea00] rounded-md px-3 py-2 outline-none"/>
                                </div>
                                <div className="w-full mb-3">
                                    <label className="text-[#1c1c1cdb] tracking-[-1px] text-sm">Phone Number</label>
                                    <textarea className="w-full bg-[#ffffff6b] border-[#fff] border-[2px] focus-within:border-[#ffea00] rounded-md px-3 py-2 outline-none"/>
                                </div>

                                <div className="flex justify-center items-center">
                                    <button className="px-10 py-2 bg-[#fff] rounded-3xl tracking-[-1px] font-medium cursor-pointer">Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="w-full h-full bg-[#000] rounded-[16px]"></div>
                </div>
            </section>
        </div>
    )
}

export default ContactHero