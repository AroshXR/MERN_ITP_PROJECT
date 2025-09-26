import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Title from '../../Components/pasindu/owner/Title'
import { assets } from '../../assets/assets'
import "./RainbowButton.css";
import { useAuth } from '../../AuthGuard/AuthGuard'

const EditOutfit = () => {
  const { outfitId } = useParams()
  const navigate = useNavigate()
  const currency = process.env.REACT_APP_CURRENCY
  const { getToken } = useAuth()

  const [loading, setLoading] = useState(true)
  const [mainImage, setMainImage] = useState(null)
  const [additionalImages, setAdditionalImages] = useState([])
  const [currentMainImage, setCurrentMainImage] = useState('')
  const [currentAdditionalImages, setCurrentAdditionalImages] = useState([])

  const [outfit, setOutfit] = useState({
    brand: '',
    model: '',
    condition: '',
    pricePerDay: 0,
    category: '',
    size: '',
    color: '',
    material: '',
    location: '',
    description: '',
  })

  // Fetch outfit details on component mount
  useEffect(() => {
    fetchOutfitDetails()
  }, [outfitId])

  const fetchOutfitDetails = async () => {
    try {
      setLoading(true)
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const token = getToken()
      
      const { data } = await axios.get(`${BASE_URL}/api/owner/outfit/${outfitId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (data?.success) {
        const outfitData = data.outfit
        setOutfit({
          brand: outfitData.brand,
          model: outfitData.model,
          condition: outfitData.condition,
          pricePerDay: outfitData.pricePerDay,
          category: outfitData.category,
          size: outfitData.size,
          color: outfitData.color,
          material: outfitData.material,
          location: outfitData.location,
          description: outfitData.description,
        })
        setCurrentMainImage(outfitData.image)
        setCurrentAdditionalImages(outfitData.additionalImages || [])
      } else {
        alert(data?.message || 'Failed to fetch outfit details')
        navigate('/owner/manage-outfits')
      }
    } catch (err) {
      console.error(err)
      alert('Error fetching outfit details')
      navigate('/owner/manage-outfits')
    } finally {
      setLoading(false)
    }
  }

  const handleAdditionalImageChange = (index, file) => {
    const newImages = [...additionalImages]
    newImages[index] = file
    setAdditionalImages(newImages)
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'
      const form = new FormData()
      
      // Add main image if changed
      if (mainImage) {
        form.append('mainImage', mainImage)
      }
      
      // Add additional images if changed
      additionalImages.forEach((image, index) => {
        if (image) {
          form.append('additionalImages', image)
        }
      })
      
      form.append('outfitData', JSON.stringify(outfit))

      const token = getToken()
      const { data } = await axios.put(`${BASE_URL}/api/owner/outfit/${outfitId}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })

      if (data?.success) {
        alert('Outfit Updated Successfully')
        navigate('/owner/manage-outfits')
      } else {
        alert(data?.message || 'Failed to update outfit')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating outfit')
    }
  }

  if (loading) {
    return (
      <div className='px-4 py-10 md:px-10 flex-1 flex items-center justify-center'>
        <div className="text-gray-500">Loading outfit details...</div>
      </div>
    )
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1 '>
      <div className="w-[800px] h-full bg-gradient-to-br from-[#e6e5e5] to-[#858585] rounded-[50px] p-10 ml-40 shadow-lg shadow-gray-400/30 relative overflow-hidden">
        
        <div className="text-center mt-26">
          <Title title="Edit Outfit" subTitle="Update the details of your outfit listing, including pricing, availability, and specifications." />
        </div>

        <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-10 max-w-xl ml-20 '>

          {/* Main Outfit Image */}
          <div className='flex items-center gap-2 w-full '>
            <label htmlFor="main-outfit-image">
              <img 
                src={mainImage ? URL.createObjectURL(mainImage) : currentMainImage || assets.upload_icon} 
                alt=""  
                className='h-14 rounded cursor-pointer'
              />
              <input type="file" id="main-outfit-image" accept="image/*" hidden onChange={e=>setMainImage(e.target.files[0])} />
            </label>
            <p className='text-sm text-gray-500'>Update main picture of your Outfit (Optional)</p>
          </div>

          {/* Additional Images */}
          <div className='flex flex-col gap-3'>
            <p className='text-sm text-gray-500'>Additional Images (Optional - up to 3)</p>
            <div className='grid grid-cols-3 gap-3'>
              {[0, 1, 2].map((index) => (
                <div key={index} className='flex items-center gap-2'>
                  <label htmlFor={`additional-image-${index}`}>
                    <img 
                      src={
                        additionalImages[index] ? URL.createObjectURL(additionalImages[index]) : 
                        currentAdditionalImages[index] || assets.upload_icon
                      } 
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
              <label>Brand</label>
              <input 
                type="text" 
                placeholder='e.g Chanel Black Tie Dress, Glamorous Evening Gown... ' 
                required 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={outfit.brand} 
                onChange={e=> setOutfit({...outfit, brand: e.target.value})} 
              />
            </div>

            <div className='flex flex-col w-full'>
              <label>Model</label>
              <input 
                type="text" 
                placeholder='e.g Evening Wear, Red Carpet ' 
                required 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={outfit.model} 
                onChange={e=> setOutfit({...outfit, model: e.target.value})} 
              />
            </div>
          </div>

          {/* Outfit Condition, Price and Category */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            <div className='flex flex-col w-full'>
              <label>Condition</label>
              <input 
                type="text" 
                placeholder='e.g New , Gently Used ' 
                required 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={outfit.condition} 
                onChange={e=> setOutfit({...outfit, condition: e.target.value})} 
              />
            </div>

            <div className='flex flex-col w-full'>
              <label>Daily Price ({currency})</label>
              <input 
                type="number" 
                placeholder='100' 
                required 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={outfit.pricePerDay} 
                onChange={e=> setOutfit({...outfit, pricePerDay: e.target.value})} 
              />
            </div>

            <div className='flex flex-col w-full'>
              <label>Category</label>
              <select 
                onChange={e=> setOutfit({...outfit, category: e.target.value})} 
                value={outfit.category} 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              >
                <option value="">Select a Category</option>
                <option value="Party Dresses & Suits">Party Dresses & Suits</option>
                <option value="Evening Gowns">Evening Gowns</option>
                <option value="Cocktail Dresses">Cocktail Dresses</option>
                <option value="Wedding & Bridal Wear">Wedding & Bridal Wear</option>
                <option value="Men's Tuxedos & Suits">Men's Tuxedos & Suits</option>
                <option value="Mini Dresses">Mini Dresses</option>
                <option value="Maxi Dresses">Maxi Dresses</option>
                <option value="Top">Top</option>
                <option value="Skirt & Top">Skirt & Top</option>
              </select>
            </div>
          </div>

          {/* Outfit Size, Color and Material */}
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
            <div className='flex flex-col w-full'>
              <label>Size</label>
              <select 
                onChange={e=> setOutfit({...outfit, size: e.target.value})} 
                value={outfit.size} 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              >
                <option value="">Select the size</option>
                <option value="Small (UK8)">Small (UK8)</option>
                <option value="Medium (UK10)">Medium (UK10)</option>
                <option value="Large (UK12)">Large (UK12)</option>
                <option value="XL (UK14)">XL (UK14)</option>
              </select>
            </div>

            <div className='flex flex-col w-full'>
              <label>Color</label>
              <select 
                onChange={e=> setOutfit({...outfit, color: e.target.value})} 
                value={outfit.color} 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
              >
                <option value="">Select the color</option>
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
              <label>Material</label>
              <input 
                type="text" 
                placeholder='e.g Satin , Silk  ' 
                required 
                className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
                value={outfit.material} 
                onChange={e=> setOutfit({...outfit, material: e.target.value})} 
              />
            </div>
          </div>

          {/* Outfit Location */}
          <div className='flex flex-col w-full'>
            <label>Location</label>
            <select 
              onChange={e=> setOutfit({...outfit, location: e.target.value})} 
              value={outfit.location} 
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none'
            >
              <option value="">Select Location</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kadawatha">Kadawatha</option>
              <option value="Rajagiriya">Rajagiriya</option>
            </select>
          </div>

          {/* Outfit Description */}
          <div className='flex flex-col w-full'>
            <label>Description</label>
            <textarea 
              rows={5}  
              placeholder='e.g. Elegant gowns, Trendy cocktail dresses, Timeless evening wear  ' 
              required 
              className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' 
              value={outfit.description} 
              onChange={e=> setOutfit({...outfit, description: e.target.value})}
            />
          </div>

          <div className="rainbow w-[175px] mx-auto">
            <button type="submit">
              Update Outfit
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditOutfit
