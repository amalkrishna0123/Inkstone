import { TbCloverFilled } from "react-icons/tb";
import { GiClover } from "react-icons/gi";
import { GiBoxingGlove } from "react-icons/gi";
const backVideo = "/vid1.mp4";

const Hero = () => {
  return (
    <section className="relative h-screen bg-black text-white overflow-hidden">
  <div className="absolute inset-0">
    {/* ThreeJS / particles background */}
  </div>

  <div className="relative z-10 h-full flex items-center justify-center">
    <div className="absolute inset-0 opacity-50">
        <video src={backVideo} autoPlay loop muted className="w-full h-full object-cover" />
    </div>
    <div className="relative flex flex-col justify-center mx-auto">

      {/* Main Heading */}
      <h1
        className="
          text-[clamp(40px,8vw,140px)]
          md:text-[clamp(80px,8vw,140px)]
          leading-[0.95]
          tracking-[-0.06em]
          font-light
          flex flex-col mx-auto
          w-full
        "
      >
        <span className="flex justify-end">
            <span className="text-[#ffea00] md:text-[70px]"><GiClover/></span>
            InkStone
        </span>
        
        bringing your
        {/* <br /> */}
        <span className="flex gap-3 items-center justify-end w-full">memories
            <ul className="text-[12px] font-normal tracking-normal flex flex-col gap-2">
                <li>TIMELESS MEMORIES</li>
                <li>CUSTOM PHOTO FRAMES</li>
                <li>CUSTOM KEEPSAKES</li>
                <li>PREMIUM CRYSTAL ART</li>
            </ul>
        </span>
        <span className="flex gap-2 items-end">
        to life in crystal <span className="text-[#ffea00] text-[40px] md:text-[70px]"><GiBoxingGlove/></span>
        </span>
      </h1>

    </div>
  </div>
</section>
  );
};

export default Hero;