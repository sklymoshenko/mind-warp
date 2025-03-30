import { TbCards, TbConfetti, TbDeviceGamepad2 } from 'solid-icons/tb'
import { BsArrowThroughHeart } from 'solid-icons/bs'
import { FaSolidDice, FaBrandsSpaceAwesome } from 'solid-icons/fa'

export default (props: { children: any }) => {
  const getRandomFloatStyles = () => {
    const floatX = Math.random() * 40 - 20 // Random between -20px and 20px
    const floatY = Math.random() * 40 - 20 // Random between -20px and 20px
    const floatDuration = Math.random() * 1 // Random between 0s and 4s
    const floatDelay = Math.random() * 3 // Random between 0s and 3s
    return {
      '--float-x': `${floatX}px`,
      '--float-y': `${floatY}px`,
      '--float-duration': `${floatDuration}s`,
      '--float-delay': `${floatDelay}s`,
      'font-size': `${Math.random() * 2 + 4}rem`, // Random between 1rem and 3rem
    }
  }
  return (
    <div class="relative w-screen h-screen bg-void flex flex-col items-center lg:justify-start xl:justify-center p-6 overflow-hidden font-display">
      {/* Creative Background with SVG Elements */}
      <div class="absolute inset-0 pointer-events-none">
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '10%', left: '15%', ...getRandomFloatStyles() }}
        >
          <TbCards class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '10%', left: '25%', ...getRandomFloatStyles() }}
        >
          <FaBrandsSpaceAwesome class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '20%', left: '80%', ...getRandomFloatStyles() }}
        >
          <BsArrowThroughHeart class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '30%', left: '40%', ...getRandomFloatStyles() }}
        >
          <FaSolidDice />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '40%', left: '60%', ...getRandomFloatStyles() }}
        >
          <TbConfetti class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '50%', left: '20%', ...getRandomFloatStyles() }}
        >
          <TbDeviceGamepad2 class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '60%', left: '85%', ...getRandomFloatStyles() }}
        >
          <TbCards />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '70%', left: '30%', ...getRandomFloatStyles() }}
        >
          <BsArrowThroughHeart class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '80%', left: '70%', ...getRandomFloatStyles() }}
        >
          <FaSolidDice class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '15%', left: '50%', ...getRandomFloatStyles() }}
        >
          <TbConfetti />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '25%', left: '90%', ...getRandomFloatStyles() }}
        >
          <TbDeviceGamepad2 class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '35%', left: '10%', ...getRandomFloatStyles() }}
        >
          <TbCards class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '45%', left: '75%', ...getRandomFloatStyles() }}
        >
          <BsArrowThroughHeart />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '55%', left: '35%', ...getRandomFloatStyles() }}
        >
          <FaSolidDice class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '65%', left: '55%', ...getRandomFloatStyles() }}
        >
          <TbConfetti class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '75%', left: '25%', ...getRandomFloatStyles() }}
        >
          <TbDeviceGamepad2 />
        </div>

        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '80%', left: '15%', ...getRandomFloatStyles() }}
        >
          <FaBrandsSpaceAwesome class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-20"
          style={{ top: '85%', left: '65%', ...getRandomFloatStyles() }}
        >
          <TbCards class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '10%', left: '45%', ...getRandomFloatStyles() }}
        >
          <BsArrowThroughHeart class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon w-3 h-3 opacity-25 "
          style={{ top: '20%', left: '95%', ...getRandomFloatStyles() }}
        >
          <FaSolidDice />
        </div>
        <div class=" text-white floating-icon opacity-20" style={{ top: '30%', left: '5%', ...getRandomFloatStyles() }}>
          <TbConfetti class="w-10 h-10" />
        </div>
        <div
          class=" text-white floating-icon opacity-30"
          style={{ top: '40%', left: '50%', ...getRandomFloatStyles() }}
        >
          <TbDeviceGamepad2 class="w-10 h-10" />
        </div>
      </div>
      {props.children}
    </div>
  )
}
