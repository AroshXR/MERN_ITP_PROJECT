import React, { useState, useEffect } from 'react';
import { assets, cityList } from '../../assets/assets';
import { useAuth } from '../../AuthGuard/AuthGuard';
import { useNavigate } from 'react-router-dom';
import "./hero.css"

const Hero = () => {
  const [pickupCategory, setPickupCategory] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // Slideshow images
  const slideImages = [
    assets.main_homepage2,
    assets.main_homepage3,
    assets.main_homepage4
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slideImages.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [slideImages.length]);


  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-14 bg-gray-100 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl md:text-5xl font-semibold mt-10">
          Luxury Outfits for Rent
        </h1>
        {/*{isAuthenticated() && (currentUser?.type === 'Customer' || currentUser?.type === 'Applicant') && (
          <button 
            onClick={() => navigate('/my-bookings')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            My Bookings
          </button> 
        )}*/}
      </div>

      <form className="flex flex-col md:flex-row items-start md:items-center justify-between p-2 rounded-lg md:rounded-full w-full max-w-4xl classic-form">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-14 md:ml-8">
        <div className="flex flex-col items-start gap-2">
          <select
            required
            value={pickupCategory}
            onChange={(e) => setPickupCategory(e.target.value)}
            className="classic-select"
          >
            <option value="">Choose Your Style</option>
            {cityList.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <p className="px-1 text-sm text-gray-400">{pickupCategory ? pickupCategory : "Please Select Your Style"}</p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <label htmlFor="reservation-date" className="text-sm text-white">
            Reservation Date
          </label>
          <input
            type="date"
            id="reservation-date"
            min={new Date().toISOString().split("T")[0]}
            className="classic-input"
            required
          />
        </div>

        <div className="flex flex-col items-start gap-2">
          <label htmlFor="return-date" className="text-sm text-white">
            Return Date
          </label>
          <input type="date" id="return-date" className="classic-input" required />
        </div>
      </div>

      <button className="flex items-center justify-center gap-2 px-6 py-3 mt-6 md:mt-0 classic-button">Search</button>
    </form>

      {/* Image Slideshow */}
      <div className="w-full mt-8">
        <div className="overflow-hidden rounded-md">
          {/* Slide Images */}
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slideImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Outfit Slide ${index + 1}`}
                className="w-full flex-shrink-0 object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
