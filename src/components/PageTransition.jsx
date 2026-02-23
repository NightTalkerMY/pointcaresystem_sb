import React from "react";
import { motion } from "framer-motion";

const variants = {
  left: {
    // Enter from Left
    initial: { x: "-100%" }, 
    animate: { 
      x: 0, 
      transition: { delay: 0.1, duration: 0.4, ease: "circOut" } 
    },
    // Exit to Left
    exit: { 
      x: "-100%", 
      transition: { duration: 0.3, ease: "easeIn" } 
    },
  },
  right: {
    // Enter from Right
    initial: { x: "100%" },   
    animate: { 
      x: 0, 
      transition: { delay: 0.1, duration: 0.4, ease: "circOut" } 
    },
    // Exit to Right
    exit: { 
      x: "100%", 
      transition: { duration: 0.3, ease: "easeIn" } 
    },
  },
};

export default function PageTransition({ children, mode = "right" }) {
  return (
    <motion.div
      variants={variants[mode]}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}