import React from 'react'
import Title from './Title'
import { assets, dummyOutfitData } from '../../assets/assets'
import OutfitCard from './OutfitCard'
import { useNavigate } from 'react-router-dom'

const FeaturedSection = () => {
    const navigate = useNavigate()
  return (
    <div className='flex flex-col items-center py-24 px-6 md:px-16 lg:px24 xl:px-32'>
        <div>
            <Title title='Featured Outfits' subTitle='Make every occasion unforgettable with our curated collection of luxury party dresses.'/>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18'>
            {
                dummyOutfitData.slice(0,6).map((outfit) =>(
                    <div key = { outfit._id}>
                        <OutfitCard outfit={outfit}/>
                    </div>
                ) )
            }

        </div>
        <button onClick={()=>{navigate('/Outfits');scrollTo(0,0)}} className='flex items-center justify-center gap-2 px-6 py-2 border border-borderColor hover:bg-gray-50 rounded-md mt-18 cursor-pointer'>Explore All Outfits <img src={assets.arrow_icon} alt="arrow" /></button>

    </div>
  )
}

export default FeaturedSection