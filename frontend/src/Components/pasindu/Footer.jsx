import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-60 text-sm text-gray-500'>
            <div className='flex flex-wrap justify-between items-start gap-8 pb-6 border-borderColor border-b'>
                <div >
                    <img src={assets.logo} alt="logo" className=' h-auto md:h-30' />
                    <p className='max-w-80 mt-3'>
                         Ready to turn heads at your next event? Explore our stunning collection of luxury party dresses designed to make you shine at any occasion!
                    </p>
                    <div className='flex items-center gap-3 mt-6'>
                        <a href="#"><img src={assets.facebook_logo} className='w-5 h-5' alt="facebook-logo" /></a>
                        <a href="#"><img src={assets.instagram_logo} className='w-5 h-5' alt="instagram_logo" /></a>
                        <a href="#"><img src={assets.twitter_logo} className='w-5 h-5' alt="twitter_logo" /></a>
                        <a href="#"><img src={assets.gmail_logo} className='w-5 h-5' alt="gmail_logo" /></a>
                       
                    </div>
                </div>

                <div className='mt-25'>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>Quik Links</h2>
                    <ul className='mt-3 flex flex-col gap-1.5 '>
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Brouse Outfits</a></li>
                        <li><a href="#">List Your Outfit</a></li>
                        <li><a href="#">About Us</a></li>
                        
                    </ul>
                </div>
                <div className='mt-25'>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>Resources</h2>
                    <ul className='mt-3 flex flex-col gap-1.5 '>
                        <li><a href="#">Help Center</a></li>
                        <li><a href="#">Terms of Service</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Insurance</a></li>
                        
                    </ul>
                </div>
                <div className='mt-25'>
                    <h2 className='text-base font-medium text-gray-800 uppercase'>Contact</h2>
                    <ul className='mt-3 flex flex-col gap-1.5 '>
                        <li>123 Klassy Shirts </li>
                        <li>Colombo 07, Sri Lanka.</li>
                        <li>+94 77 123 4567</li>
                        <li>contact@klassyshirts.lk</li>
                        
                    </ul>
                </div>

            </div>
            
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} Klassy Shirts. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#">Privacy</a></li>
                    <li>|</li>
                    <li><a href="#">Terms</a></li>
                    <li>|</li>
                    <li><a href="#">Cookies</a></li>
                </ul>
            </div>
        </div>
  )
}

export default Footer