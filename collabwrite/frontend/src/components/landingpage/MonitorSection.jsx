import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";
import 'swiper/css';
import 'swiper/css/navigation';

import monitorCardBg from '../../assets/landingpageimages/06.gif';
import './landingpage.css';

const MonitorSection = () => {
  return (
    <motion.section
      variants={fadeIn('up', 0.2)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="monitor-section"
    >
      <div className="monitor-container">
        {/* Left side - Content */}
        <motion.div
          variants={fadeIn('right', 0.3)}
          className="monitor-content"
        >
          <motion.span
            variants={fadeIn('up', 0.4)}
            className="monitor-tag"
          >
            AI-POWERED ASSISTANCE 
          </motion.span>
          <motion.h2
            variants={textVariant(0.5)}
            className="monitor-title"
          >
            CollabWrite enhances your writing with smart AI-powered assistance
          </motion.h2>
          <motion.p
            variants={fadeIn('up', 0.6)}
            className="monitor-description"
          >
            AI-powered assistance designed to boost productivity and clarity. Whether you're drafting reports, composing proposals, or refining team documents, our AI helps you generate content, improve grammar, suggest better phrasing, and maintain a consistent tone. It adapts to your writing style and context, offering real-time suggestions that save time and elevate quality. With CollabWrite, you don’t just write—you write smarter.
          </motion.p>

        </motion.div>

        {/* Right side - Swiper with background */}
        <motion.div
          variants={fadeIn('left', 0.3)}
          className="monitor-image-wrapper"
        >
          <motion.div
            variants={fadeIn('up', 0.4)}
            className="monitor-image-container"
          >
            <motion.img
              variants={fadeIn('up', 0.5)}
              src={monitorCardBg}
              alt="Dashboard statistics"
              className="monitor-image"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default MonitorSection;
