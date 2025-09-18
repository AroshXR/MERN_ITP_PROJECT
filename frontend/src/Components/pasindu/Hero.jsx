import React, { useState } from 'react'
import { assets, cityList } from '../../assets/assets'


const Hero = () => {
    const [pickupCategory, setPickupCategory] = useState('')



  return (
    <div className='h- screen flex flex-col items-center justify-center gap-14 bg-light text-center'>

        <h1 className='text-4xl md:text-5xl front-semibold mt-10'>
            Luxury Outfits for Rent
        </h1>

        <form className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadoww-[0px_8px_20px_rgba(0,0,0,0.1]'>

            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8'>
                <div className='flex flex-col items-start gap-2'>
                    <select required value={pickupCategory} onChange={(e)=>setPickupCategory(e.target.value)}>
                        <option value="">Choose Your Style</option>
                        {cityList.map((city)=> <option key={city} value={city}>{city}</option>)}
                    </select>

                    <p className='px-1 text-sm text-grey-500'>{pickupCategory? pickupCategory : 'Please Select Your Style'}</p>

                </div>
                <div className='flex flex-col items-start gap-2'>
                    <lable htmlFor='reservation-date'>Reservation Date</lable>
                    <input type="date"  id="pickup-date" min={new Date().toISOString().split('T')[0] } className='text-sm text-grey-500' required />
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <lable htmlFor='return-date'>Return Date</lable>
                    <input type="date"  id="return-date" className='text-sm text-grey-500' required />
                </div>
            </div>
            
            <button className='flex itemss-center justify-center gap-1 px-9 py-3 max-sm:mt-4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'>
                    <img src={assets.search_icon} alt="search" className='brightness-300' />
                    Search
                </button>

        </form>

        <img src={assets.main_homepage} alt="Outfit" className='max-h-74' />
        
         </div>

  )
}

export default Hero