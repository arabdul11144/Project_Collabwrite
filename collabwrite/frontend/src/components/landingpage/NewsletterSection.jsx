import React from 'react';
import { HiArrowRight } from 'react-icons/hi';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import './landingpage.css';

const NewsletterSection = () => {
  return (
    <section id="newsletter" className="newsletter-section">
      <motion.div
        variants={fadeIn('up', 0.2)}
        initial="hidden"
        whileInView="show"
        className="newsletter-container"
      >
        <div className="newsletter-inner">
          {/* Background Gradient */}
          <motion.div
            variants={fadeIn('left', 0.4)}
            className="newsletter-gradient"
          ></motion.div>

          <div className="newsletter-content">
            {/* Left Content */}
            <motion.div
              variants={fadeIn('right', 0.5)}
              className="newsletter-text"
            >
              <motion.h2
                variants={textVariant(0.3)}
                className="newsletter-title"
              >
                Subscribe newsletter
              </motion.h2>
              <motion.p
                variants={fadeIn('up', 0.6)}
                className="newsletter-description"
              >
                Best cooks and best delivery guys all at your service. Hot tasty food
              </motion.p>
            </motion.div>

            {/* Email Form */}
            <motion.div
              variants={fadeIn('left', 0.5)}
              className="newsletter-form-container"
            >
              <motion.div
                variants={fadeIn('up', 0.6)}
                className="newsletter-form"
              >
                <motion.input
                  variants={fadeIn('right', 0.7)}
                  type="email"
                  placeholder="Enter your email address"
                  className="newsletter-input"
                />
                <motion.button
                  variants={fadeIn('left', 0.7)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="newsletter-button"
                >
                  <span>Discover</span>
                  <HiArrowRight className="newsletter-icon" />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsletterSection;
