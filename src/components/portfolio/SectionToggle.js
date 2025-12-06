import React from 'react';
import { motion } from 'framer-motion';

const SectionToggle = ({ currentSection, onToggle }) => {
  const isThoughtCorner = currentSection === 'thoughts';

  return (
    <motion.button
      onClick={onToggle}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 15 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-8 right-8 bg-black text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-shadow duration-300 z-30 flex items-center gap-2 font-medium"
    >
      <span>{isThoughtCorner ? 'experience' : 'thought corner'}</span>
      <motion.svg
        animate={{ rotate: isThoughtCorner ? 180 : 0 }}
        transition={{ duration: 0.3 }}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 12L3 7L4.5 5.5L8 9L11.5 5.5L13 7L8 12Z"
          fill="currentColor"
        />
      </motion.svg>
    </motion.button>
  );
};

export default SectionToggle;
