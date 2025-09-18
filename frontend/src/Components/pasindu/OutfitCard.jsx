import React from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const OutfitCard = ({outfit}) => {
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()
  return (
    <div className='group rounded-1xl overflow-hiddden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer'>

        <div onClick={()=>{navigate(`/outfit-details/${outfit._id}`); scrollTo(0,0)}} className='relative h-auto overflow-hidden'>
            <img src={outfit.image} alt="outfit image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105' />

            {outfit.isAvailable &&  <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available Now</p>}

            <div className='absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
            <span className='font-semibold'>{currency}{outfit.pricePerDay}</span>
            <span className='text-sm text-white/80'>/ day</span>

            </div >
        </div>
        <div className='p-4 sm:p-5'>
            <div className='flex justify-between items-starts mb-2'>
                <div>
                    <h3 className='text-lg font-medium'>{outfit.brand} {outfit.model}</h3>
                    <p className='texxt-muted-foreground text-sm'>{outfit.category} • {outfit.condition} </p>
                </div>
            </div>
            <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <img src={assets.users_icon} alt="" className='h-4 mr-2'/>
                    <span>{outfit.size } Size </span>
                </div>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <img src={assets.shirt_icon} alt="" className='h-4 mr-2'/>
                    <span>{outfit.color } Color</span>
                </div>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <img src={assets.material_icon} alt="" className='h-4 mr-2'/>
                    <span>{outfit.material } Material</span>
                </div>
                <div className='flex items-center text-sm text-muted-foreground'>
                    <img src={assets.location_icon} alt="" className='h-4 mr-2'/>
                    <span>{outfit.location } </span>
                </div>

            </div>
        </div>

    </div>
  )
}

export default OutfitCard