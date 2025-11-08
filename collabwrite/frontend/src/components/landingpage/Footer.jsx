import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import './landingpage.css';

const Footer = () => {
  const footerLinks = {
    company: [
      { name: 'About', href: '#' },
      { name: 'Terms of Use', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'How it Works', href: '#' },
      { name: 'Contact Us', href: '#' },
    ],
    getHelp: [
      { name: 'Support Carrer', href: '#' },
      { name: '24h Service', href: '#' },
      { name: 'Quick Chat', href: '#' },
    ],
    support: [
      { name: 'FAQ', href: '#' },
      { name: 'Policy', href: '#' },
      { name: 'Business', href: '#' },
    ],
    contact: [
      { name: 'WhatsApp', href: '#' },
      { name: 'Support 24', href: '#' },
    ],
  };

  return (
    <motion.footer
      variants={fadeIn('up', 0.2)}
      initial="hidden"
      whileInView="show"
      className="footer"
    >
      <div className="footer-container">
        <motion.div
          variants={fadeIn('up', 0.3)}
          className="footer-grid"
        >
          {/* Brand Column */}
          <motion.div
            variants={fadeIn('right', 0.4)}
            className="footer-brand"
          >
            <motion.div
              variants={fadeIn('down', 0.5)}
              className="footer-logo"
            >
              <div className="logo-dot blue-dot"></div>
              <div className="logo-dot red-dot"></div>
              <span className="brand-name">CollabWrite Team</span>
            </motion.div>
            <motion.p
              variants={fadeIn('up', 0.6)}
              className="footer-description"
            >
              The copy warned the Little Blind Text, that where it came from it would have been rewritten a thousand times.
            </motion.p>
            <motion.div
              variants={fadeIn('up', 0.7)}
              className="social-icons"
            >
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="social-icon facebook">
                <FaFacebookF />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="social-icon twitter">
                <FaTwitter />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="social-icon linkedin">
                <FaLinkedinIn />
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Links Columns */}
          <motion.div
            variants={fadeIn('left', 0.4)}
            className="footer-links-section"
          >
            <div className="links-grid">
              {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  variants={fadeIn('up', 0.3 * (categoryIndex + 1))}
                >
                  <motion.h3
                    variants={textVariant(0.2)}
                    className="links-title"
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.h3>
                  <motion.ul
                    variants={fadeIn('up', 0.4)}
                    className="links-list"
                  >
                    {links.map((link, index) => (
                      <motion.li
                        key={index}
                        variants={fadeIn('up', 0.1 * (index + 1))}
                      >
                        <motion.a whileHover={{ x: 5 }} href={link.href} className="link-item">
                          {link.name}
                        </motion.a>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Copyright */}
        <motion.div
          variants={fadeIn('up', 0.8)}
          className="footer-bottom"
        >
          <motion.div
            variants={fadeIn('up', 0.9)}
            className="footer-bottom-content"
          >
            <motion.p variants={fadeIn('right', 1.0)} className="footer-text">
              Copyright © {new Date().getFullYear()} Collabwrite.com
            </motion.p>
            <motion.p variants={fadeIn('left', 1.0)} className="footer-text">
              Created by Collabwrite Team
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
