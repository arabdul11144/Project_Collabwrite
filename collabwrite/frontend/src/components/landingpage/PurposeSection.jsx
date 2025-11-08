import './landingpage.css';
import { motion } from "framer-motion";
import { fadeIn, textVariant } from "./utils/motion";

const PurposeSection = () => {
  const features = [
    {
      icon: "🟣",
      title: "Built for impact",
      description:
        "We design every feature with purpose—empowering designers, developers, and decision-makers to create meaningful results, together."
    },
    {
      icon: "🔴",
      title: "In sync with you",
      description:
        "Your team has a rhythm. CollabWrite adapts to it — supporting your unique workflows, collaboration style, and pace without disruption."
    }
  ];

  return (
    <section id="about" className="purpose-section">
      <div className="purpose-container">
        <motion.div
          variants={fadeIn('right', 0.2)}
          initial="hidden"
          whileInView="show"
          className="purpose-grid"
        >
          <motion.div variants={fadeIn('right', 0.3)}>
    
            <motion.h2
              variants={textVariant(0.5)}
              className="purpose-title"
            >
              Built for results. Made to match your workflow
            </motion.h2>
          </motion.div>

          <motion.div
            variants={fadeIn('left', 0.3)}
            className="purpose-features"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn('up', 0.3 * (index + 1))}
                className="purpose-feature-item"
              >
                <motion.div
                  variants={fadeIn('right', 0.4 * (index + 1))}
                  className="purpose-icon"
                >
                  {feature.icon}
                </motion.div>
                <motion.div variants={fadeIn('left', 0.4 * (index + 1))}>
                  <motion.h3
                    variants={textVariant(0.3)}
                    className="purpose-feature-title"
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p
                    variants={fadeIn('up', 0.4)}
                    className="purpose-feature-description"
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PurposeSection;
