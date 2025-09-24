import React from 'react'
import Hero from '../Components/pasindu/Hero'
import FeaturedSection from '../Components/pasindu/FeaturedSection'
import Banner from '../Components/pasindu/Banner'
import Testimonial from '../Components/pasindu/Testimonial'
import Newsletter from '../Components/pasindu/Newsletter'
import Navbar from '../Components/pasindu/Navbar'
import Footer from '../Components/Footer/Footer'
//import RentalFooter from '../Components/pasindu/rentalFooter'


const RentalHome = () => {
  return (
    <>
    <Navbar />
    <Hero></Hero>
    <FeaturedSection></FeaturedSection>
    <Banner></Banner>
    <Testimonial></Testimonial>
    <Newsletter></Newsletter>
    
    <Footer></Footer>
    
    </>
  )
}

export default RentalHome