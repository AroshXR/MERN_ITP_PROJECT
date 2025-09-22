import React from 'react'
import { assets } from '../../assets/assets';

const Testimonial = () => {
    const testimonials = [
        {   name: "Anjali Silva", 
            location: "Colombo, Sri Lanka",
            image: assets.testimonial_image_1,  
            testimonial: "Amazing service and seamless experience. The dresses were beautiful, and everything was handled with care and professionalism from start to finish. Highly recommended!" },

        {   name: "Sara Perera", 
            location: "Colombo, Sri Lanka", 
            image: assets.testimonial_image_2,  
            testimonial: "Fantastic experience! The dresses were stunning, and the entire process from booking to return was smooth and stress-free. Will definitely rent again!" },

        {   name: "Nisha Fernando", 
            location: "Kandy, Sri Lanka", 
            image: assets.testimonial_image_1,  
            testimonial: "Highly recommend Klassy Shirts! The dress I rented was perfect for my event, and the service was impeccable. Everything was taken care of with great attention to detail." }
    ];
  return (
   <div className="py-28 px-6 md:px-16 lg:px-24 xl:px-44">

    <title title="What our customers say"  subTitle="Discover why fashion-forward individuals trust Klassy Shirts for their luxury party dress rentals."></title>

            <div className="grid grid-col-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
                {testimonials.map((testimonial,index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:--translate-y-1 transition-all duration-500">
                        <div className="flex items-center gap-3">
                            <img className="w-12 h-12 rounded-full" src={testimonial.image} alt={testimonial.name} />
                            <div>
                                <p className=" text-xl">{testimonial.name}</p>
                                <p className="text-gray-500">{testimonial.location}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4">
                            {Array(5).fill(0).map((_, index) => (
                                <img key={index}src={assets.star_icon} alt="star-icon" />
                                
                            ))}
                        </div>
                        <p className="text-gray-500 max-w-90 mt-4 font-light">"{testimonial.testimonial}"</p>
                    </div>
                ))}
            </div>
        </div>
  )
}

export default Testimonial