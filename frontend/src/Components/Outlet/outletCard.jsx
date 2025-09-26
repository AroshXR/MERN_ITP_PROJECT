import React from 'react';
import { useNavigate } from 'react-router-dom';

// Reusable card for Outlet clothing items
// Expected item shape: {
//   _id, imageUrl, name, brand, category, price, rating, numReviews
// }
const OutletCard = ({ item }) => {
  const navigate = useNavigate();
  const currency = process.env.REACT_APP_CURRENCY || '$';

  const handleClick = () => {
    navigate(`/outlet/${item._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div
      onClick={handleClick}
      className="group rounded-xl overflow-hidden shadow hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white border border-gray-100"
    >
      <div className="relative h-44 sm:h-48 overflow-hidden">
        {item.stock === 0 && (
          <span className="absolute top-3 left-3 bg-red-600/90 text-white text-xs px-2.5 py-1 rounded-full z-10">Sold Out</span>
        )}
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {typeof item.price === 'number' && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm">
            <span className="font-semibold">{currency}{item.price}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-lg font-medium line-clamp-1">{item.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-1">{item.brand} {item.category}</p>

        <div className="mt-2 flex items-center justify-between">
          {typeof item.rating === 'number' ? (
            <span className="text-amber-500 text-sm">★ {item.rating.toFixed(1)} <span className="text-gray-400">({item.numReviews || 0})</span></span>
          ) : <span />}
        </div>
      </div>
    </div>
  );
};

export default OutletCard;

