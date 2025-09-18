import React, { useEffect, useState } from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import { assets, dummyOutfitData } from '../assets/assets'
import Loader from '../components/Loader'

const OutfitDetails = () => {
  const {id}= useParams()
  const navigate = useNavigate()
  const [outfit,setOutfit] = useState(null)

  useEffect(()=>{
    setOutfit(dummyOutfitData.find(outfit => outfit._id === id))
  },[id])
  return outfit ? (
    <div className='px-6 md:px lg:-24 xl:px-32 mt-16'>
      <button onClick={()=> navigate(-1)} className='flex items-center gap-2 mb-2 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65'/>
        Back to all Outfits
      </button>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/*Left: Outfit Image and details*/}
        <div className='lg:col-span-2'>
          <img src={outfit.image} alt="" className='w-auto h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold'>{outfit.brand} {outfit.model}</h1>
              <p className='text-gray-500 text-lg'>{outfit.category} • {outfit.year} </p>
            </div>
            <hr className='border-borderColor my-6' />
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                {icon:assets.users_icon, text: `${outfit.color} color`},
                {icon:assets.material_icon, text: outfit.fuel_type},
                {icon:assets.car_icon, text: outfit.transmission},
                {icon:assets.location_icon, text: outfit.location},

              ].map(({icon,text})=>(
                <div key={text} className='flex flex-col items-center bbg-light p-4 rounded-lg'>
                  <img src={icon} alt="" className='h-5 mb-2'/>
                  {text}
                </div>
              ))}
            </div>

            {/*Description*/}
            <div>
              <h1 className='text-xl font-medium mb-3'>Description</h1>
              <p className='text-gray-500'>{outfit.description}</p>
            </div>

            {/*Features*/}

            <div>
              <h1 className='text-xl font-medium mb-3'>Features</h1>
              <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {
                  ["Silk Material","Available in Sizes S, M, L","Handcrafted Details","Dry Clean Only",
                   "Limited Edition", "Perfect for Weddings & Parties", "Comfortable Fit","Luxury Brand"].map((item)=>(
                    <li key={item} className='flex items-center tet-gray-500'>
                      <img src={assets.check_icon} alt="" className='h-4 mr-2'/>
                      {item}
                    </li>
                   ))
                }

              </ul>

            </div>

          </div>

        </div>
        {/*Right: booking form*/}
        <form action=""></form>

      </div>

    </div>
  ) : <Loader/>
}

export default OutfitDetails