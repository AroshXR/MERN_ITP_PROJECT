import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loader from '../Components/pasindu/Loader';
import './OutfitDetails.css';
import axios from 'axios';
import { useAuth } from '../AuthGuard/AuthGuard';

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reservationDate, setReservationDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const currency = process.env.REACT_APP_CURRENCY || 'USD';
  const { isAuthenticated, getToken } = useAuth();

  const fetchOutfit = async () => {
    try {
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const { data } = await axios.get(`${BASE_URL}/api/owner/all-outfits`);
      if (data?.success) {
        const foundOutfit = data.outfits.find(o => o._id === id);
        setOutfit(foundOutfit);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOutfit();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!isAuthenticated()) {
        alert('Please log in to book an outfit');
        navigate('/login');
        return;
      }

      if (!reservationDate || !returnDate) {
        alert('Please select both reservation and return dates');
        return;
      }

      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const token = getToken();
      
      const { data } = await axios.post(`${BASE_URL}/api/booking/create`, {
        outfit: outfit._id,
        reservationDate,
        returnDate
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data?.success) {
        alert('Booking created successfully!');
        navigate('/MyBookings');
      } else {
        alert(data?.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating booking');
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const totalSlides = outfit?.images?.length ? outfit.images.length + 1 : 1;
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    const totalSlides = outfit?.images?.length ? outfit.images.length + 1 : 1;
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  if (!outfit) return <Loader />;

  const allImages = [outfit.image, ...(outfit.images || [])].filter(Boolean);
  const totalSlides = allImages.length;

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16">
      <button onClick={() => navigate(-1)} className="back-button">
        <img src={assets.arrow_icon} alt="Back" />
        Back to all Outfits
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Outfit Image and Details */}
        <div className="lg:col-span-2">
          {/* Image Slider */}
          <div className="flex items-center">
            <button onClick={prevSlide} className="md:p-2 p-1 bg-black/30 md:mr-6 mr-2 rounded-full hover:bg-black/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="w-full max-w-3xl overflow-hidden relative">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {allImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    className="w-full flex-shrink-0 object-cover h-[900px]"
                    alt={`Outfit Image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button onClick={nextSlide} className="p-1 md:p-2 bg-black/30 md:ml-6 ml-2 rounded-full hover:bg-black/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{outfit.brand} {outfit.model}</h1>
              <p className="text-gray-500 text-lg">{outfit.category} • {outfit.condition}</p>
            </div>
            <hr className="border-solid border-borderColor my-6" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[{ icon: assets.shirt_icon, text: `${outfit.color} color` },
              { icon: assets.material_icon, text: outfit.material },
              { icon: assets.users_icon, text: outfit.size },
              { icon: assets.location_icon, text: outfit.location }].map(({ icon, text }) => (
                <div key={text} className="flex flex-col items-center bg-light p-4 rounded-lg">
                  <img src={icon} alt="Icon" className="h-5 mb-2" />
                  {text}
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h1 className="text-xl font-medium mb-3">Description</h1>
              <p className="text-gray-500">{outfit.description}</p>
            </div>

            {/* Features */}
            <div>
              <h1 className="text-xl font-medium mb-3">Features</h1>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["Silk Material", "Available in Sizes S, M, L", "Handcrafted Details", "Dry Clean Only",
                  "Limited Edition", "Perfect for Weddings & Parties", "Comfortable Fit", "Luxury Brand"]
                  .map((item) => (
                    <li key={item} className="flex items-center text-gray-500">
                      <img src={assets.check_icon} alt="Check Icon" className="h-4 mr-2" />
                      {item}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Booking form */}
        <form onSubmit={handleSubmit} className="shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500 bg-white">
          <p className="flex items-center justify-between text-2xl text-gray-800 font-semibold">{currency}{outfit.pricePerDay} <span className="text-base text-gray-400 font-normal">per day</span> </p>

          <hr className="border-borderColor my-6" />
          <div className="flex flex-col gap-2">
            <label htmlFor="reservation-date">Reservation Date</label>
            <input 
              type="date" 
              className="border border-solid border-borderColor px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none" 
              required 
              id="reservation-date" 
              min={new Date().toISOString().split('T')[0]} 
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="return-date">Return Date</label>
            <input 
              type="date" 
              className="border border-solid border-borderColor px-3 py-2 rounded-lg" 
              required 
              id="return-date" 
              min={reservationDate || new Date().toISOString().split('T')[0]} 
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
          <button className="w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer">Book Now</button>
          <p className="text-center text-sm">No credit card required to reserve</p>
        </form>
      </div>
    </div>
  );
}

export default OutfitDetails;
