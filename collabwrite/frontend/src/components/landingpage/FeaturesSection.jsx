import React from 'react';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import './landingpage.css';

const FeaturesSection = () => {
  const features = [
    {
      icon: "🤝",
      title: "Collaborate easily",
      description: "Work together in a shared space where ideas flow freely. No more emailing documents back and forth—everything happens in one place"
    },
    {
      icon: "🚀",
      title: "Edit in real-time",
      description: "Make changes simultaneously with your team. See updates as they happen, so you’re always on the same page—literally"
    },
    {
      icon: "🔄",
      title: "Avoid scattered revisions ",
      description: "With built-in version control, say goodbye to confusion and lost edits. Every change is tracked and organized for clarity and control"
    }
  ];

  return (
    <motion.section
      variants={fadeIn('up', 0.2)}
      initial="hidden"
      whileInView="show"
      className="features-section"
    >
      <motion.div
        variants={fadeIn('up', 0.3)}
        className="features-header"
      >
        <motion.h2
          variants={textVariant(0.2)}
          className="features-title"
        >
          How can we help your Writing Work?
        </motion.h2>
        <motion.p
          variants={fadeIn('up', 0.4)}
          className="features-subtitle"
        >
          Whether you’re a student team, a startup, or a growing organization, we help you
        </motion.p>
      </motion.div>

      <motion.div
        variants={fadeIn('up', 0.5)}
        className="features-grid"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={fadeIn('up', 0.3 * (index + 1))}
            className="feature-card"
          >
            <motion.div
              variants={fadeIn('down', 0.4 * (index + 1))}
              className={`feature-icon ${index === 0 ? 'bg-light-purple' : index === 1 ? 'bg-light-red' : 'bg-light-orange'}`}
            >
              <motion.div
                variants={fadeIn('up', 0.5 * (index + 1))}
                className="icon-emoji"
              >
                {feature.icon}
              </motion.div>
            </motion.div>
            <motion.h3
              variants={textVariant(0.3)}
              className="feature-title"
            >
              {feature.title}
            </motion.h3>
            <motion.p
              variants={fadeIn('up', 0.6 * (index + 1))}
              className="feature-description"
            >
              {feature.description}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        variants={fadeIn('up', 0.7)}
        className="features-cta"
      >
        <motion.button
          variants={fadeIn('up', 0.8)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cta-button"
        >
          Try Collabwrite
          <div className="cta-glow"></div>
        </motion.button>
      </motion.div>
    </motion.section>
  );
};

export default FeaturesSection;
