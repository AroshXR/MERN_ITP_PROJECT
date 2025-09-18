import React, { useEffect } from 'react'
import { assets, dummyOutfitData } from '../../assets/assets'
import Title from '../../components/pasindu/owner/Title'
import { useState } from 'react'

const ManageOutfits = () => {

  const currency = import.meta.env.VITE_CURRENCY

  const [outfits,setOutfits] = useState([])

  const fetchOwnerOutfits = async ()=>{
    setOutfits(dummyOutfitData)
  }

  useEffect(()=>{
    fetchOwnerOutfits()
  },[])



  return (
    <div className='px-4 pt-10 md:px-10 w-full'>

      <Title title="Manage Outfits"  subTitle="View all listed outfits, update their details or remove them from the booking platform." />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>

        <table className='w-full border-collapse text-left text-sm text-gray-600'>
          <thead className='text-gray-500'>
            <tr>
              <th className="p-3 font-medium">Outfit</th>
              <th className="p-3 font-medium max-md:hidden">Category</th>
              <th className="p-3 font-medium'">Price</th>
              <th className="p-3 font-medium max-md:hidden">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {outfits.map((outfit,index)=>(
              <tr key={index} className='border-t border-borderColor'>
                <td className='p-3 flex items-center gap-3'>
                  <img src={outfit.image} alt="" className="h-22 w-15 aspect-square rounded-md object-cover" />
                  <div className='max-md:hidden'>
                    <p className='font-medium'>{outfit.brand} {outfit.model} </p>
                    <p className='text-xs text-gray-500'>{outfit.material} • {outfit.size} </p>
                  </div>
                  
                </td>
                <td className='p-3 max-md:hidden'> {outfit.category}</td>
                <td className='p-3 '>{currency} {outfit.pricePerDay}/day</td>

                <td className='p-3 max-md:hidden'>
                  <span className={`px-3 py-1 rounded-full text-xs ${outfit.isAvailable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>{outfit.isAvailable ? "Available " : "Unavailable"} </span>

                </td>
                <td className='flex items-center p-3'>
                  <img src={outfit.isAvailable ? assets.eye_close_icon : assets.eye_icon} alt="" className='cursor-pointer'/>
                  <img src={assets.delete_icon} alt="" className='cursor-pointer'/>

                </td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>
        
    </div>
  )
}

export default ManageOutfits