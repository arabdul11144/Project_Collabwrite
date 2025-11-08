import React from 'react';
import { Link } from 'react-router-dom';
import './landingpage.css';

import Navbar from './Navbar'
import Hero from './Hero'
import PurposeSection from './PurposeSection'
import FeaturesSection from './FeaturesSection'
import ScheduleSection from './ScheduleSection'
import MonitorSection from './MonitorSection'
//import PricingSection from './PricingSection'
import ServicesSection from './ServicesSection'
import TestimonialsSection from './TestimonialsSection'
//import NewsletterSection from './NewsletterSection'
import Footer from './Footer'

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';



function Landingpage() {
  return (
    <main className="landingpage">
      <div className="background-circle"></div>
      <div className="content-wrapper">
        <Navbar />
        <Hero />
        
        <PurposeSection />
        <FeaturesSection />
        <ScheduleSection />
        <MonitorSection />
       
        <ServicesSection />
        <TestimonialsSection />
    
        <Footer />
      </div>
    </main>
  )
}

export default Landingpage;