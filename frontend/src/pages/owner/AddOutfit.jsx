import React, { useState } from 'react'
import Title from '../../components/pasindu/owner/Title'
import { assets } from '../../assets/assets'

const AddOutfit = () => {

  const currency = import.meta.env.VITE_CURRENCY

  const [image,setImage] = useState(null)

  const [outfit , setOutfit] = useState({
    brand : '',
    model : '',
    condition : '',
    pricePerDay : 0,
    category : '',
    size: '',
    color : '',
    material : '',
    location : '',
    description : '',
  })

  const onSubmitHandler = async (e)=> {
    e.preventDefault();

  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>

      <Title title="Add new Outfit" subTitle= "Fill in the details to list a new outfit for booking, including pricing, availability, and car specifications." />

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>

        {/* Outfit Image */}
        <div className='flex items-center gap-2 w-full'>
          <label htmlFor="outfit-image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_icon} alt=""  className='h-14 rounded cursor-pointer'/>
            <input type="file"  id="outfit-image" accept="image/*" hidden onChange={e=>setImage(e.target.files[0])} />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your Outfit</p>
        </div>

        {/* Outfit Brand and Model */}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-col w-full'>
            <label >Brand</label>
            <input type="text" placeholder='e.g Chanel Black Tie Dress, Glamorous Evening Gown... ' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.brand} onChange={e=> setOutfit({...outfit, brand: e.target.value})} />

          </div>

          <div className='flex flex-col w-full'>
            <label >Model</label>
            <input type="text" placeholder='e.g Evening Wear, Red Carpet ' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.model} onChange={e=> setOutfit({...outfit, model: e.target.value})} />

          </div>
          
        </div>

        {/* Outfit Condition , Price  and Category */}

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>

          <div className='flex flex-col w-full'>
            <label >Condition</label>
            <input type="text" placeholder='e.g New , Gently Used ' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.condition} onChange={e=> setOutfit({...outfit, condition: e.target.value})} />
          </div>

           <div className='flex flex-col w-full'>
            <label >Daily Price ({currency}) </label>
            <input type="number" placeholder='100' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.pricePerDay} onChange={e=> setOutfit({...outfit, pricePerDay: e.target.value})} />
          </div>

          <div className='flex flex-col w-full'>
            <label >Category  </label>
            <select onChange={e=> setOutfit({...outfit, category: e.target.value})} value= {outfit.category} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select a Category</option>
              <option value="Party Dresses & Suits">Party Dresses & Suits</option>
              <option value="Evening Gowns">Evening Gowns</option>
              <option value="Cocktail Dresses">Cocktail Dresses</option>
              <option value="'Wedding & Bridal Wear">P'Wedding & Bridal Wear</option>
              <option value="Men’s Tuxedos & Suits">Men’s Tuxedos & Suits</option>
            </select>
          </div>
        </div>

        {/* Outfit Size , Color  and material */}

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          <div className='flex flex-col w-full'>
            <label >Size  </label>
            <select onChange={e=> setOutfit({...outfit, size: e.target.value})} value= {outfit.size} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select the size </option>
              <option value="Small (UK8)">Small (UK8) </option>
              <option value="Medium (UK10)">Medium (UK10) </option>
              <option value="Large (UK12)">Large (UK12) </option>
              <option value="XL (UK14)">XL (UK14) </option>
              
            </select>
          </div>

          <div className='flex flex-col w-full'>
            <label >Color  </label>
            <select onChange={e=> setOutfit({...outfit, color: e.target.value})} value= {outfit.color} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select the size </option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Red">Red</option>
              <option value="Royal Blue">Royal Blue</option>
              <option value="Emerald Green">Emerald Green</option>
              <option value="Olive Green">Olive Green</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Pink">Pink</option>
              <option value="Burgundy">Burgundy</option>
              <option value="Champagne">Champagne</option>
              <option value="Purple">Purple</option>
              <option value="Other">Other</option>
              
            </select>
          </div>

          <div className='flex flex-col w-full'>
            <label >Material</label>
            <input type="text" placeholder='e.g Satin , Silk  ' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.material} onChange={e=> setOutfit({...outfit, material: e.target.value})} />
          </div>

        </div>

        {/* Outfit Location */}

        <div className='flex flex-col w-full' >

          <label >Location  </label>
            <select onChange={e=> setOutfit({...outfit, location: e.target.value})} value= {outfit.location} className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'>
              <option value="">Select Location </option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kadawatha">Kadawatha</option>
              <option value="Rajagiriya">Rajagiriya</option>
            </select>

        </div>

        {/* Outfit Description */}

        <div className='flex flex-col w-full'>
            <label >Description</label>
            <textarea rows={5}  placeholder='e.g. Elegant gowns, Trendy cocktail dresses, Timeless evening wear  ' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={outfit.description} onChange={e=> setOutfit({...outfit, description: e.target.value})} > </textarea>
          </div>


          <button className='flex items-center gap-2 px-4 py-2.5 mt-4 bg-primary text-white rounded-md font-medium w-max cursor-pointer'>
            <img src={assets.tick_icon} alt="" />
            List Your Car
          </button>

      </form>
        
    </div>
  )
}

export default AddOutfit