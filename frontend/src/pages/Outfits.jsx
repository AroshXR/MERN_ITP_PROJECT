import React, { useState, useEffect } from 'react'
import Title from '../Components/pasindu/Title'
//import { assets } from '../assets/assets'
import OutfitCard from '../Components/pasindu/OutfitCard'
import Navbar from '../Components/pasindu/Navbar'
import axios from 'axios'
import Footer from '../Components/Footer/Footer'
import "./outfits.css"

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
        <div className="outfit-filters-container">
      {/* Search Bar */}
      <div className="search-bar">
        <div className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <input
          onChange={handleSearch}
          value={input}
          type="text"
          placeholder="Search by brand, model or features"
          className="search-input"
        />
        <div className="filter-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-grid">
        <select value={selectedCategory} onChange={handleCategoryChange} className="filter-select">
          <option value="">All Categories</option>
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

        <select value={selectedLocation} onChange={handleLocationChange} className="filter-select">
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
          onChange={(e) => handlePriceChange("min", e.target.value)}
          className="price-input"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={priceRange.max}
          onChange={(e) => handlePriceChange("max", e.target.value)}
          className="price-input"
        />
      </div>
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
      <Footer></Footer>
    </div>
  )
}

export default Outfits