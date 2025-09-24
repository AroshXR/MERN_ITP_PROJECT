import React, { useState } from 'react'
import axios from 'axios'
import Title from '../../Components/pasindu/owner/Title'
import { assets } from '../../assets/assets'
import "./RainbowButton.css";

const AddOutfit = () => {

  const currency = process.env.REACT_APP_CURRENCY

  const [mainImage, setMainImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])

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

  const handleAdditionalImageChange = (index, file) => {
    const newImages = [...additionalImages]
    newImages[index] = file
    setAdditionalImages(newImages)
  }

  const onSubmitHandler = async (e)=> {
    e.preventDefault();
    try{
      if(!mainImage){
        alert('Please select a main image')
        return
      }

      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const form = new FormData()
      
      // Add main image
      form.append('mainImage', mainImage)
      
      // Add additional images (up to 3)
      additionalImages.forEach((image, index) => {
        if (image) {
          form.append('additionalImages', image)
        }
      })
      
      form.append('outfitData', JSON.stringify(outfit))

      const { data } = await axios.post(`${BASE_URL}/api/owner/add-outfit`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if(data?.success){
        alert('Outfit Added')
        // reset form
        setMainImage(null)
        setAdditionalImages([])
        setOutfit({
          brand:'', model:'', condition:'', pricePerDay:0, category:'', size:'', color:'', material:'', location:'', description:''
        })
      }else{
        alert(data?.message || 'Failed to add outfit')
      }
    }catch(err){
      console.error(err)
      alert('Error adding outfit')
    }
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1 '>

      <Title title="Add new Outfit" subTitle= "Fill in the details to list a new outfit for booking, including pricing, availability, and car specifications." />

      

      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl '>

        
        {/* Main Outfit Image (Required) */}
        <div className='flex items-center gap-2 w-full '>
          <label htmlFor="main-outfit-image">
            <img src={mainImage ? URL.createObjectURL(mainImage) : assets.upload_icon} alt=""  className='h-14 rounded cursor-pointer'/>
            <input type="file"  id="main-outfit-image" accept="image/*" hidden onChange={e=>setMainImage(e.target.files[0])} />
          </label>
          <p className='text-sm text-gray-500'>Upload main picture of your Outfit (Required)</p>
        </div>

        {/* Additional Images (Optional) */}
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-gray-500'>Additional Images (Optional - up to 3)</p>
          <div className='grid grid-cols-3 gap-3'>
            {[0, 1, 2].map((index) => (
              <div key={index} className='flex items-center gap-2'>
                <label htmlFor={`additional-image-${index}`}>
                  <img 
                    src={additionalImages[index] ? URL.createObjectURL(additionalImages[index]) : assets.upload_icon} 
                    alt=""  
                    className='h-12 rounded cursor-pointer'
                  />
                  <input 
                    type="file"  
                    id={`additional-image-${index}`} 
                    accept="image/*" 
                    hidden 
                    onChange={e=>handleAdditionalImageChange(index, e.target.files[0])} 
                  />
                </label>
              </div>
            ))}
          </div>
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

           <div className="rainbow  w-[175px]">
      <button type="button">
        List Your Outfit
      </button>
    </div>

    

      </form>

      


    </div>
  )
}

export default AddOutfit