import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { fadeIn } from "./utils/motion";
import { Link } from 'react-router-dom';
import './landingpage.css';

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('#home');
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About Us" },
    { href: "#services", label: "Our Service" },
    { href: "#testimonials", label: "Our Team" },
  ];

  // ✅ Detect scroll position for background change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Update active link while scrolling
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.6 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.nav
      variants={fadeIn('down', 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="navbar-container">
        {/* Logo */}
        <motion.div
          variants={fadeIn('right', 0.3)}
          className="navbar-logo"
        >
          <motion.div>
            <img src="/logo.png" alt="logo" className="logo" />
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

        {/* Log In & Sign Up Buttons */}
        <motion.div
          className="auth-buttons"
          variants={fadeIn('left', 0.3)}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="signin"
          >
            <Link to='/loginpage'>Log In</Link>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="signup"
          >
            <Link to='/signuppage'>Sign Up</Link>
          </motion.button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
