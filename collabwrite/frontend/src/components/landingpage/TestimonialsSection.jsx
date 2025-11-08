import './landingpage.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";

const testimonials = [
  { id: 1, name: "Mohamed Sasan", image: "/ourteam/sihan.png", text: "Team Leader & Backend Developer..." },
  { id: 2, name: "Abdul Rahman", image: "/ourteam/abd.png", text: "Frontend Developer, Abthul focuses..." },
  { id: 3, name: "Fathima Insirah", image: "/ourteam/ins.png", text: "UI/UX Designer ,Insirah is responsible..." },
  { id: 4, name: "Rizny", image: "/ourteam/rizny.png", text: "Database Manager, Rizny handles..." },
  { id: 5, name: "Mohamed Manaseer", image: "/ourteam/mana.png", text: "Quality Assurance (QA) Tester..." },
  { id: 6, name: "Fathima Hamdhila", image: "/ourteam/ham.png", text: "Backend Developer & Documentation..." }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="testimonials-section">
      <motion.div variants={fadeIn('up', 0.3)} className="testimonials-header">
        <motion.h2 variants={textVariant(0.2)} className="testimonials-title">
          Collaboration Starts with Us
        </motion.h2>
        <motion.p variants={fadeIn('up', 0.4)} className="testimonials-subtext">
"What makes it the best place for collaborative text editing"
        </motion.p>
      </motion.div>

      <motion.div variants={fadeIn('up', 0.5)} className="testimonials-container">
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          navigation={{
            nextEl: '.swiper-button-next-custom',
            prevEl: '.swiper-button-prev-custom',
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="testimonials-swiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={testimonial.id} className="testimonial-slide">
              <motion.div variants={fadeIn('up', 0.3 * (index + 1))} className="testimonial-card">
                <motion.div variants={fadeIn('down', 0.4 * (index + 1))} className="testimonial-avatar">
                  <motion.img variants={fadeIn('up', 0.5 * (index + 1))} src={testimonial.image} alt={testimonial.name} className="testimonial-avatar-img" />
                </motion.div>
                <motion.h3 variants={textVariant(0.3)} className="testimonial-name">
                  {testimonial.name}
                </motion.h3>
                <motion.p variants={fadeIn('up', 0.6 * (index + 1))} className="testimonial-text">
                  {testimonial.text}
                </motion.p>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation */}
        <motion.div variants={fadeIn('up', 0.7)} className="testimonial-nav">
          <motion.button variants={fadeIn('right', 0.8)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="swiper-button-prev-custom nav-btn">
            <BsChevronLeft className="nav-icon" />
          </motion.button>
          <motion.button variants={fadeIn('left', 0.8)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="swiper-button-next-custom nav-btn">
            <BsChevronRight className="nav-icon" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TestimonialsSection;
