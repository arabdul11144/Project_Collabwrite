import React, { useState } from 'react';
import { motion } from "framer-motion";
import { fadeIn } from "./utils/motion";
import { Link } from 'react-router-dom';
import './landingpage.css';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('#home');

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#services", label: "Our Service" },
    { href: "#testimonials", label: "Our Team" },
  ];

  return (
    <motion.nav
      variants={fadeIn('down', 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="navbar"
    >
      <div className="navbar-container">
        {/* Logo */}
        <motion.div
          variants={fadeIn('right', 0.3)}
          className="navbar-logo"
        >
          <motion.div>
            <img src="\logo.png" alt="logo" className="logo" />
          </motion.div>
        </motion.div>


        {/* Navigation Links */}
        <motion.div
          variants={fadeIn('down', 0.3)}
          className="nav-links"
        >
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              variants={fadeIn('down', 0.1 * (index + 1))}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={`nav-link ${activeLink === link.href ? 'active' : ''}`}
            >
              {link.label}
            </motion.a>
          ))}
        </motion.div>

        {/* Sign-In, Sign-Up Button */}
        <motion.button
          variants={fadeIn('left', 0.3)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="signin"
        >
          <Link  to='/loginpage'>Log In</Link>
        </motion.button>



      </div>


    </motion.nav>
  );
};

export default Navbar;
