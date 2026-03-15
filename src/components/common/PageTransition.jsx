import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }} // smooth standardized easing
            className={`w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
