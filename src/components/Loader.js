import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  return (
    <AnimatePresence>
      <div className="loader-container">
        <motion.div
          key="loader"
          className="loader"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: [1, 2, 2, 1, 1],
            rotate: [0, 0, 270, 270, 0],
            borderRadius: ["20%", "20%", "50%", "50%", "20%"],
          }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="loader-text"
        >
          Loading...
        </motion.p>
      </div>
    </AnimatePresence>
  );
};

export default Loader; 