import React from 'react';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import heroImage from '../../assets/landingpageimages/hero-image.png';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      {/* Left Column */}
      <div className="hero-left-col">
        <motion.div variants={fadeIn('right', 0.2)} initial="hidden" whileInView="show">
          {/* Star badge */}
          <div className="star-badge">
            <span className="star-icon">★</span>
            <span className="star-text">Jump start your writing</span>
          </div>
        </motion.div>

        <motion.h1
          variants={textVariant(0.3)}
          initial="hidden"
          whileInView="show"
          className="hero-title"
        >
          Write Together, Create Better With{' '}
          <span className="highlighted-text">
            CollabWrite — Write, Edit, Collaborate
            <span className="underline-gradient"></span>
          </span>{' '}
          Anytime, Anywhere
          <span className="pulse-emoji">⏰</span>
        </motion.h1>

        <motion.p
          variants={fadeIn('up', 0.4)}
          initial="hidden"
          whileInView="show"
          className="hero-description"
        >
          CollabWrite helps you connect and write effortlessly with our real-time collaborative text editor.
        </motion.p>

        <motion.div variants={fadeIn('up', 0.5)} initial="hidden" whileInView="show" className="hero-cta-wrapper">
          <Link to="/signup">
            <button
              aria-label="Try CollabWrite and start writing"
              className="hero-cta-button"
            >
              Try CollabWrite
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Right Column - Image */}
      <motion.div variants={fadeIn('left', 0.5)} initial="hidden" whileInView="show" className="hero-right-col">
        <div className="hero-image-wrapper">
          <img
            src={heroImage}
            alt="CollabWrite team collaborating on a project"
            className="hero-image"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
