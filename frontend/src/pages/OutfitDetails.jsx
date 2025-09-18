import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyOutfitData } from '../assets/assets'
import Loader from '../components/pasindu/Loader'

const OutfitDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [outfit, setOutfit] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = 4;  // 1 for main image + 3 for gallery images
  const currency = import.meta.env.VITE_CURRENCY
  const handleSubmit = async (e)=>{
    e.preventDefault();
  }

  useEffect(() => {
    setOutfit(dummyOutfitData.find(outfit => outfit._id === id))
  }, [id])

  const goToSlide = (index) => {
    setCurrentSlide(index);
  }

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  }

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  }

  useEffect(() => {
    const slideInterval = setInterval(nextSlide, 3000);
    return () => clearInterval(slideInterval); // Clean up the interval
  }, []);

  return outfit ? (
    <div className='px-6 md:px lg:-24 xl:px-32 mt-16'>
      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-2 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' />
        Back to all Outfits
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Outfit Image and Details */}
        <div className='lg:col-span-2'>
          {/* Image Slider (Gallery of additional images) */}
          <div className="flex items-center">
            <button onClick={prevSlide} className="md:p-2 p-1 bg-black/30 md:mr-6 mr-2 rounded-full hover:bg-black/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full max-w-3xl overflow-hidden relative">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {/* First slide is the main image */}
                <img
                  src={outfit.image}  // Use the main outfit image for the first slide
                  className="w-full flex-shrink-0 object-cover h-[900px]"  // Adjust the height here (500px for example)
                  alt="Main Outfit Image"
                />

                {/* Additional gallery images */}
                <img
                  src={assets.dress1_2}  // Second image from assets
                  className="w-full flex-shrink-0 object-cover h-[900px]"  // Ensure same height as the first image
                  alt="Gallery Slide 2"
                />
                <img
                  src={assets.dress1_3}  // Third image from assets
                  className="w-full flex-shrink-0 object-cover h-[900px]"  // Ensure same height as the first image
                  alt="Gallery Slide 3"
                />
                <img
                  src={assets.dress1_4}  // Fourth image from assets
                  className="w-full flex-shrink-0 object-cover h-[900px]"  // Ensure same height as the first image
                  alt="Gallery Slide 4"
                />
              </div>
            </div>

            <button onClick={nextSlide} className="p-1 md:p-2 bg-black/30 md:ml-6 ml-2 rounded-full hover:bg-black/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className='text-3xl font-bold'>{outfit.brand} {outfit.model}</h1>
              <p className='text-gray-500 text-lg'>{outfit.category} • {outfit.condition} </p>
            </div>
            <hr className='border-borderColor my-6' />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[{ icon: assets.shirt_icon, text: `${outfit.color} color` },
              { icon: assets.material_icon, text: outfit.material },
              { icon: assets.users_icon, text: outfit.size },
              { icon: assets.location_icon, text: outfit.location }].map(({ icon, text }) => (
                <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2' />
                  {text}
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{outfit.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {["Silk Material", "Available in Sizes S, M, L", "Handcrafted Details", "Dry Clean Only",
                  "Limited Edition", "Perfect for Weddings & Parties", "Comfortable Fit", "Luxury Brand"]
                  .map((item) => (
                    <li key={item} className='flex items-center text-gray-500'>
                      <img src={assets.check_icon} alt="" className='h-4 mr-2' />
                      {item}
                    </li>
                  ))}
              </ul>
            </div>

          </div>
        </div>
        {/* Right: booking form (can be added later) */}

        <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500' >
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{outfit.pricePerDay} <span className='tex-base text-gray-400 font-normal'>per day</span> </p>

          <hr className='border-borderColor my-6'/>
          <div className='flex flex-col gap-2'>
            <label htmlFor="reservation-date">Reservation Date</label>
            <input type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='reservation-date' min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input type="date" className='border border-borderColor px-3 py-2 rounded-lg' required id='return-date' min={new Date().toISOString().split('T')[0]} />
          </div>
          <button className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer'>Book Now</button>
          <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>

      </div>
    </div>
  ) : <Loader />
}

export default OutfitDetails
