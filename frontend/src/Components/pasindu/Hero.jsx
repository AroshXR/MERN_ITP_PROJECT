import React, { useState } from 'react';
import { assets, cityList } from '../../assets/assets';

const Hero = () => {
  const [pickupCategory, setPickupCategory] = useState('');

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-14 bg-gray-100 text-center">
      <h1 className="text-4xl md:text-5xl font-semibold mt-10">
        Luxury Outfits for Rent
      </h1>

      <form className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-4xl bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-14 md:ml-8">
          <div className="flex flex-col items-start gap-2">
            <select
              required
              value={pickupCategory}
              onChange={(e) => setPickupCategory(e.target.value)}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="">Choose Your Style</option>
              {cityList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <p className="px-1 text-sm text-gray-500">
              {pickupCategory ? pickupCategory : 'Please Select Your Style'}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <label htmlFor="reservation-date" className="text-sm">
              Reservation Date
            </label>
            <input
              type="date"
              id="pickup-date"
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div className="flex flex-col items-start gap-2">
            <label htmlFor="return-date" className="text-sm">
              Return Date
            </label>
            <input
              type="date"
              id="return-date"
              className="border border-gray-300 rounded-md p-2"
              required
            />
          </div>
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-3 mt-6 md:mt-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full cursor-pointer">
          <img src={assets.search_icon} alt="search" className="brightness-300" />
          Search
        </button>
      </form>

      <img
        src={assets.main_homepage}
        alt="Outfit"
        className="max-h-72 object-cover rounded-md mt-8"
      />
    </div>
  );
};

export default Hero;
