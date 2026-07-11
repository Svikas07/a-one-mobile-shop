'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const WhatsAppButton: React.FC = () => {
  const whatsappNumber = '919876543210'; // Replace with actual store number
  const message = encodeURIComponent('Hello A-One Mobile Store,\nI want to know about your accessories.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-large flex items-center justify-center cursor-pointer hover:bg-[#128C7E] transition-colors focus:outline-none"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Contact us on WhatsApp"
    >
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.638 1.973 14.162.95 11.533.95c-5.438 0-9.863 4.372-9.867 9.802-.001 1.73.461 3.42 1.337 4.908l-.989 3.615 3.708-.971zM17.95 14.43c-.303-.151-1.793-.883-2.073-.984-.28-.102-.484-.151-.688.151-.204.3-.79.985-.969 1.187-.18.203-.36.228-.663.077-1.619-.792-2.774-1.39-3.882-3.292-.292-.498.292-.463.837-1.547.09-.18.044-.337-.023-.487-.067-.15-.584-1.406-.8-.192-.211-.5-.43-.448-.688-.448-.258 0-.584-.025-.842.228-.258.254-1.01 1.01-1.01 2.463s1.054 2.85 1.202 3.053c.149.203 2.073 3.176 5.025 4.453.702.303 1.25.484 1.677.62.705.224 1.347.193 1.854.117.566-.084 1.793-.733 2.048-1.441.254-.707.254-1.314.178-1.44-.076-.127-.28-.203-.583-.354z" />
      </svg>
    </motion.a>
  );
};
