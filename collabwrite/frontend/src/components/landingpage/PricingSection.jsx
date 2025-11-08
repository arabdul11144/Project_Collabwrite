import { useState } from 'react';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import './landingpage.css';

const PricingSection = () => {
  const [productCount, setProductCount] = useState(1);

  const starterPrice = Math.round(4000 * (productCount / 50));
  const businessPrice = Math.round(7500 * (productCount / 50));

  return (
    <motion.section
      variants={fadeIn('up', 0.2)}
      initial="hidden"
      whileInView="show"
      className="pricing-section"
    >
      <div className="pricing-container">
        <motion.h2 variants={textVariant(0.3)} className="pricing-title">
          Pricing
        </motion.h2>

        <motion.div variants={fadeIn('up', 0.4)} className="pricing-grid">
          {/* Starter Plan */}
          <motion.div variants={fadeIn('right', 0.5)} className="pricing-card">
            <motion.h3 variants={fadeIn('up', 0.6)} className="pricing-plan-title">
              Starter
            </motion.h3>
            <motion.p variants={fadeIn('up', 0.7)} className="pricing-amount">
              ${starterPrice}/mo
            </motion.p>
          </motion.div>

          {/* Business Plan */}
          <motion.div variants={fadeIn('left', 0.5)} className="pricing-card">
            <motion.h3 variants={fadeIn('up', 0.6)} className="pricing-plan-title">
              Business
            </motion.h3>
            <motion.p variants={fadeIn('up', 0.7)} className="pricing-amount">
              ${businessPrice}/mo
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeIn('up', 0.8)} className="pricing-slider-container">
          <motion.p variants={fadeIn('up', 0.9)} className="product-count">
            {productCount} products
          </motion.p>

          <motion.div variants={fadeIn('up', 1.0)} className="slider-wrapper">
            <div className="slider-range">
              <span className="slider-label">1</span>
              <input
                type="range"
                min="1"
                max="50"
                value={productCount}
                onChange={(e) => setProductCount(parseInt(e.target.value))}
                className="range-input"
              />
              <span className="slider-label">50</span>
            </div>
          </motion.div>

          <motion.div variants={fadeIn('up', 1.1)} className="cta-container">
            <motion.p variants={fadeIn('up', 1.2)} className="cta-text">
              Ready to get started?
            </motion.p>
            <motion.button
              variants={fadeIn('up', 1.3)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cta-button"
            >
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PricingSection;
