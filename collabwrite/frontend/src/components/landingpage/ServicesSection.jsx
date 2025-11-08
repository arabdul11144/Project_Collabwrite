import React from 'react';
import './landingpage.css';
import { BsStack } from 'react-icons/bs';
import { HiLightBulb } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import { BiTime } from 'react-icons/bi';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";

const ServicesSection = () => {
  const services = [
    {
      icon: <BsStack className="service-icon indigo" />,
      title: "AI-Powered Writing Assistance",
      description: "Get smart suggestions to enhance grammar, clarity, and tone—instantly.",
      link: "#learn-more"
    },
    {
      icon: <HiLightBulb className="service-icon amber" />,
      title: "Real-Time Editing with Collaboration",
      description: "Edit together, leave comments, and stay in sync—live and effortless.",
      link: "#learn-more"
    },
    {
      icon: <FiSettings className="service-icon red" />,
      title: "Q&A Forum",
      description: "Ask, answer, and share knowledge right inside your workspace.",
      link: "#learn-more"
    },
    {
      icon: <BiTime className="service-icon cyan" />,
      title: "Cloud Storage",
      description: "Access your documents anytime, anywhere—with secure cloud backup.",
      link: "#learn-more"
    }
  ];

  return (
    <section id="services" className="services-section">
      <motion.div variants={fadeIn('up', 0.3)} className="services-wrapper">
        {/* Header */}
        <motion.div variants={fadeIn('right', 0.4)} className="services-header">
          <motion.h2 variants={textVariant(0.2)} className="services-title">
            Smart Features Built for Modern Teams
          </motion.h2>
          <motion.p variants={fadeIn('up', 0.5)} className="services-subtext">
            Work faster, collaborate better, and write smarter—with tools designed for today’s teams.
          </motion.p>
          <motion.div variants={fadeIn('up', 0.6)} className="services-list">
            {[
              "UX design content strategy",
              "10+ Real-time Collaboration Tools",
              "20+ Ready-to-Use Document Templates",
              "25+ Formatting & Styling Options"
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeIn('right', 0.7 + i * 0.1)}
                className="service-list-item"
              >
                <div className="bullet-outer">
                  <div className="bullet-inner"></div>
                </div>
                <span className="bullet-text">{item}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.button
            variants={fadeIn('up', 0.9)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="services-btn"
          >
            Get started
          </motion.button>
        </motion.div>

        {/* Services Grid */}
        <motion.div variants={fadeIn('left', 0.4)} className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeIn('up', 0.3 * (index + 1))}
              whileHover={{ scale: 1.05 }}
              className="service-card"
            >
              <motion.div
                variants={fadeIn('down', 0.4 * (index + 1))}
                className="service-icon-wrap"
              >
                {service.icon}
              </motion.div>
              <motion.h3 variants={textVariant(0.3)} className="service-card-title">
                {service.title}
              </motion.h3>
              <motion.p variants={fadeIn('up', 0.5 * (index + 1))} className="service-card-text">
                {service.description}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ServicesSection;
