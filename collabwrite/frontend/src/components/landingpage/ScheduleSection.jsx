import './landingpage.css';
import scheduleImage from '../../assets/landingpageimages/05.gif';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";

const ScheduleSection = () => {
  return (
    <motion.section
      variants={fadeIn('up', 0.2)}
      initial="hidden"
      whileInView="show"
      className="schedule-section"
    >
      <div className="schedule-container">
        <motion.div
          variants={fadeIn('right', 0.3)}
          className="schedule-image-wrapper"
        >
          <motion.img
            variants={fadeIn('up', 0.4)}
            src={scheduleImage}
            alt="Statistics dashboard"
            className="schedule-image"
          />
        </motion.div>

        <motion.div
          variants={fadeIn('left', 0.3)}
          className="schedule-content"
        >

          <motion.h2
            variants={textVariant(0.5)}
            className="schedule-heading"
          >
            Collaborate easily, edit in real-time, and stay perfectly in sync with your team
          </motion.h2>
          <motion.p
            variants={fadeIn('up', 0.6)}
            className="schedule-description"
          >
            Whether you're brainstorming, drafting reports, or refining ideas, CollabWrite empowers you with live editing, version control, and role-based access for a smooth, efficient workflow. Say goodbye to scattered revisions and miscommunication—work together, smarter, and faster
          </motion.p>
          <motion.a
            variants={fadeIn('up', 0.7)}
            href="#"
            className="schedule-link"
          >
            Try Collabwrite            <motion.svg
              variants={fadeIn('left', 0.8)}
              className="schedule-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </motion.svg>
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ScheduleSection;
