'use client';

import React, { useState, useEffect } from 'react';

export const AnnouncementBar: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [message, setMessage] = useState('🔥 Free Delivery Above ₹499 | Flat 20% OFF on Fast Chargers');
  const [bgColor, setBgColor] = useState('bg-primary');
  const [textColor, setTextColor] = useState('text-white');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEnabled = localStorage.getItem('aone_announcement_enabled');
      const storedMsg = localStorage.getItem('aone_announcement_text');
      const storedBg = localStorage.getItem('aone_announcement_bg');
      const storedText = localStorage.getItem('aone_announcement_text_color');
      
      if (storedEnabled !== null) setEnabled(storedEnabled === 'true');
      if (storedMsg) setMessage(storedMsg);
      if (storedBg) setBgColor(storedBg);
      if (storedText) setTextColor(storedText);
    }

    // Set up a listener for administrative updates
    const handleStorageChange = () => {
      const storedEnabled = localStorage.getItem('aone_announcement_enabled');
      const storedMsg = localStorage.getItem('aone_announcement_text');
      const storedBg = localStorage.getItem('aone_announcement_bg');
      const storedText = localStorage.getItem('aone_announcement_text_color');
      
      if (storedEnabled !== null) setEnabled(storedEnabled === 'true');
      if (storedMsg) setMessage(storedMsg);
      if (storedBg) setBgColor(storedBg);
      if (storedText) setTextColor(storedText);
    };

    window.addEventListener('storage', handleStorageChange);
    // Listen for custom event from admin panel updates
    window.addEventListener('aone_announcement_update', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aone_announcement_update', handleStorageChange);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className={`w-full py-2.5 px-4 ${bgColor} ${textColor} text-xs md:text-sm font-semibold tracking-wide text-center flex items-center justify-center transition-all duration-300 z-50`}>
      <span className="animate-pulse mr-2">⚡</span>
      <span>{message}</span>
    </div>
  );
};
