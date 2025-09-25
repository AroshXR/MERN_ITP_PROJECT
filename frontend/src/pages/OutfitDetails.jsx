import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Loader from '../Components/pasindu/Loader';
import './OutfitDetails.css';
import axios from 'axios';
import { useAuth } from '../AuthGuard/AuthGuard';
import Navbar from '../Components/pasindu/Navbar';
import Footer from '../Components/Footer/Footer';

const OutfitDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [outfit, setOutfit] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reservationDate, setReservationDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState(null);
  const currency = process.env.REACT_APP_CURRENCY || 'LKR';
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

      if (!phone || !email || !document) {
        alert('Please fill in all required fields: phone, email, and upload a document');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      // Basic phone validation
      const phoneRegex = /^[0-9]{10,}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        alert('Please enter a valid phone number (at least 10 digits)');
        return;
      }

      setIsBooking(true);
      const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';
      const token = getToken();
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('outfit', outfit._id);
      formData.append('reservationDate', reservationDate);
      formData.append('returnDate', returnDate);
      formData.append('phone', phone);
      formData.append('email', email);
      formData.append('document', document);
      
      const { data } = await axios.post(`${BASE_URL}/api/booking/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data?.success) {
        alert('Booking created successfully!');
        // Small delay to ensure booking is saved
        setTimeout(() => {
          navigate('/my-bookings');
        }, 500);
      } else {
        alert(data?.message || 'Failed to create booking');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating booking');
    } finally {
      setIsBooking(false);
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

  // 👇 Paste your auto-slide useEffect here
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // 3 seconds per slide

    return () => clearInterval(interval); // cleanup on unmount
  }, [currentSlide, outfit]);

  if (!outfit) return <Loader />;

  const allImages = [outfit.image, ...(outfit.images || [])].filter(Boolean);
  const totalSlides = allImages.length;

  

  return (
    <div>
      <Navbar/>
      <div className=" ">
    <div className="px-6 md:px-16 lg:px-24 xl:px-32 mt-16 ">
      <button onClick={() => navigate(-1)} className="back-button ">
        <img src={assets.arrow_icon} alt="Back" />
        Back to all Outfits
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left: Outfit Image and Details */}
        <div className="lg:col-span-2">
          <div className="shadow-xl/30 bg-white rounded-xl p-6 mb-6 -ml-6 md:-ml-6 lg:-ml-16 xl:-ml-24">
          {/* Image Slider */}
          <div className="flex items-center -ml-4 mr-4 ">
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
                    className="w-full flex-shrink-0 object-cover h-[500px] md:h-[800px]"
                    alt={`Outfit Image ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <button onClick={nextSlide} className="p-1 md:p-2 bg-black/30 md:ml-1 ml-1 rounded-full hover:bg-black/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-6 pt-6">
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
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-1 shadow-xl">
          <form onSubmit={handleSubmit} className="bg-white h-max sticky top-16 rounded-xl p-6 space-y-6 text-gray-500 shadow-inner">
          <div className="bg-gradient-to-r from-gray-900 to-black text-white p-6 rounded-xl text-center border border-gray-300 shadow-lg">
            <p className="text-4xl font-bold">{currency}{outfit.pricePerDay}</p>
            <p className="text-gray-300 text-sm mt-1">per day</p>
          </div>

          <hr className="border-borderColor my-6" />
          
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              Contact Information
            </h3>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="phone">Phone Number *</label>
              <input 
                type="tel" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                required 
                id="phone" 
                placeholder="e.g., 0771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email">Email Address *</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                required 
                id="email" 
                placeholder="e.g., john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="document">Upload ID Document *</label>
              <input 
                type="file" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                required 
                id="document" 
                accept="image/*,.pdf"
                onChange={(e) => setDocument(e.target.files[0])}
              />
              <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">📄 Upload your NIC, Passport, or Driver's License</p>
            </div>
          </div>

          <hr className="border-borderColor my-6" />
          
          {/* Booking Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              Booking Dates
            </h3>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="reservation-date">Reservation Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white" 
                required 
                id="reservation-date" 
                min={new Date().toISOString().split('T')[0]} 
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
              <label htmlFor="return-date">Return Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                required 
                id="return-date" 
                min={reservationDate || new Date().toISOString().split('T')[0]} 
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isBooking}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 py-4 font-semibold text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isBooking ? '⏳ Booking...' : '🎯 Book Now'}
          </button>
          <p className="text-center text-sm text-gray-600 bg-green-50 p-2 rounded">✅ No credit card required to reserve</p>
          </form>
        </div>
      </div>
    </div>
    </div>
    <Footer/>
    </div>
  );
}

export default OutfitDetails;
