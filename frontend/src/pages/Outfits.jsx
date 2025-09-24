import React, { useState, useEffect } from 'react'
import Title from '../Components/pasindu/Title'
import { assets } from '../assets/assets'
import OutfitCard from '../Components/pasindu/OutfitCard'
import Navbar from '../Components/pasindu/Navbar'
import axios from 'axios'

const Outfits = () => {
  const [input, setInput] = useState('')
  const [outfits, setOutfits] = useState([])
  const [filteredOutfits, setFilteredOutfits] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const fetchOutfits = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const params = new URLSearchParams();
      
      if (input) params.append('search', input);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);

      const { data } = await axios.get(`${BASE_URL}/api/owner/all-outfits?${params}`);
      if (data?.success) {
        setOutfits(data.outfits);
        setFilteredOutfits(data.outfits);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [input, selectedCategory, selectedLocation, priceRange]);

  const handleSearch = (e) => {
    setInput(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  const handlePriceChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <Navbar></Navbar>
      <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Outfits' subTitle= 'Find Your Perfect Fit with Stunning Dresses for Every Celebration!'/>

        {/* Search Bar */}
        <div className='flex items-center bg-white px-4 mt-6 max-w-2xl w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h.4.5 mr-2' />
          <input 
            onChange={handleSearch} 
            value={input} 
            type="text" 
            placeholder='Search by brand, model or features' 
            className='w-full h-full outline-none text-gray-500' 
          />
          <img src={assets.filter_icon} alt="" className='w-4.5 h.4.5 ml-2' />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap gap-4 mt-6 max-w-4xl w-full justify-center'>
          <select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className='px-3 py-2 border border-borderColor rounded-md outline-none'
          >
            <option value="">All Categories</option>
            <option value="Party Dresses & Suits">Party Dresses & Suits</option>
            <option value="Evening Gowns">Evening Gowns</option>
            <option value="Cocktail Dresses">Cocktail Dresses</option>
            <option value="Wedding & Bridal Wear">Wedding & Bridal Wear</option>
            <option value="Men's Tuxedos & Suits">Men's Tuxedos & Suits</option>
          </select>

          <select 
            value={selectedLocation} 
            onChange={handleLocationChange}
            className='px-3 py-2 border border-borderColor rounded-md outline-none'
          >
            <option value="">All Locations</option>
            <option value="Colombo">Colombo</option>
            <option value="Gampaha">Gampaha</option>
            <option value="Kadawatha">Kadawatha</option>
            <option value="Rajagiriya">Rajagiriya</option>
          </select>

          <input 
            type="number" 
            placeholder="Min Price" 
            value={priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            className='px-3 py-2 border border-borderColor rounded-md outline-none w-24'
          />
          <input 
            type="number" 
            placeholder="Max Price" 
            value={priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            className='px-3 py-2 border border-borderColor rounded-md outline-none w-24'
          />
        </div>
      </div>

      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>Showing {filteredOutfits.length} Outfits </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
          {filteredOutfits.map((outfit, index) => (
            <div key={outfit._id}>
              <OutfitCard outfit={outfit}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Outfits