import React, { useState, useEffect } from 'react';
import Title from './Title';
import { assets } from '../../assets/assets';
import OutfitCard from './OutfitCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FeaturedSection = () => {
  const navigate = useNavigate();
  const [outfits, setOutfits] = useState([]);

  const fetchOutfits = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const { data } = await axios.get(`${BASE_URL}/api/owner/all-outfits`);
      if (data?.success) {
        setOutfits(data.outfits);
      }
    } catch (err) {
      console.error('Error fetching outfits:', err);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, []);

  return (
    <div className="flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32">
      <div>
        <Title title="Featured Outfits" subTitle="Make every occasion unforgettable with our curated collection of luxury party dresses." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
        {
          outfits.slice(0, 6).map((outfit) => (
            <div key={outfit._id}>
              <OutfitCard outfit={outfit} />
            </div>
          ))
        }
      </div>
      <button
        onClick={() => { navigate('/Outfits'); window.scrollTo(0, 0); }}
        className="flex items-center justify-center gap-2 px-6 py-2 border border-borderColor hover:bg-gray-50 rounded-md mt-18 cursor-pointer"
      >
        Explore All Outfits <img src={assets.arrow_icon} alt="arrow" />
      </button>
    </div>
  );
}

export default FeaturedSection;
