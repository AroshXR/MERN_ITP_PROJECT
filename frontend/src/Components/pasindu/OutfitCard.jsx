import React from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const OutfitCard = ({ outfit }) => {
    const currency = process.env.REACT_APP_CURRENCY;
    //const currency = import.meta.env.VITE_CURRENCY || 'LKR';
    //console.log(import.meta.env.VITE_CURRENCY);
    const navigate = useNavigate();
    
    return (
        <div className="group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-white">
            <div
                onClick={() => { navigate(`/outfit-details/${outfit._id}`); window.scrollTo(0, 0); }} // Use window.scrollTo instead of scrollTo
                className="relative h-auto overflow-hidden"
            >
                <img
                    src={outfit.image}
                    alt="outfit image"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {outfit.isAvailable && (
                    <p className="absolute top-4 left-4 bg-blue-500/90 text-white text-xs px-2.5 py-1 rounded-full">Available Now</p> // Replaced bg-primary with bg-blue-500/90
                )}

                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                    <span className="font-semibold">{currency}{outfit.pricePerDay}</span>
                    <span className="text-sm text-white/80">/ day</span>
                </div>
            </div>

            <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-medium">{outfit.brand} {outfit.model}</h3>
                        <p className="text-gray-500 text-sm">{outfit.category} • {outfit.condition}</p> {/* Fixed texxt-muted-foreground */}
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-2 text-gray-600">
                    <div className="flex items-center text-sm text-gray-500">
                        <img src={assets.users_icon} alt="Icon representing users" className="h-4 mr-2" />
                        <span>{outfit.size} Size</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <img src={assets.shirt_icon} alt="Icon representing shirt" className="h-4 mr-2" />
                        <span>{outfit.color} Color</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <img src={assets.material_icon} alt="Icon representing material" className="h-4 mr-2" />
                        <span>{outfit.material} Material</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <img src={assets.location_icon} alt="Icon representing location" className="h-4 mr-2" />
                        <span>{outfit.location}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutfitCard;
