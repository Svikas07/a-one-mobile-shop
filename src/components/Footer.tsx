'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldAlert, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-primary text-gray-300 border-t border-border/10 pt-16 pb-8 z-30 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-gray-800">
        
        {/* Column 1: Brand Info */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-1.5 text-white">
            <span className="font-playfair text-xl md:text-2xl font-bold tracking-tight">
              A-One Mobile
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-secondary text-white px-1.5 py-0.5 rounded-full">
              Accessories
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed pt-2">
            Your destination for premium mobile covers, tempered glass, cables, high-speed GaN chargers, and portable power. We specialize exclusively in top-tier protection and power products.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-secondary hover:text-white rounded-full transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-secondary hover:text-white rounded-full transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 hover:bg-secondary hover:text-white rounded-full transition-colors" aria-label="YouTube">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Popular Categories */}
        <div className="space-y-4">
          <h4 className="font-playfair font-bold text-white text-base tracking-wider uppercase">Categories</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/shop?category=c1" className="hover:text-white transition-colors">
                Premium Mobile Covers
              </Link>
            </li>
            <li>
              <Link href="/shop?category=c2" className="hover:text-white transition-colors">
                Tempered Screen Glass
              </Link>
            </li>
            <li>
              <Link href="/shop?category=c3" className="hover:text-white transition-colors">
                Anti-Spy Privacy Glass
              </Link>
            </li>
            <li>
              <Link href="/shop?category=c5" className="hover:text-white transition-colors">
                GaN Fast Chargers
              </Link>
            </li>
            <li>
              <Link href="/shop?category=c8" className="hover:text-white transition-colors">
                TWS Bluetooth Earbuds
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Info */}
        <div className="space-y-4">
          <h4 className="font-playfair font-bold text-white text-base tracking-wider uppercase">Customer Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/track" className="hover:text-white transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=newest" className="hover:text-white transition-colors">
                New Arrivals
              </Link>
            </li>
            <li>
              <span className="text-gray-500 cursor-not-allowed hover:text-gray-400">Return Policy (7 Days)</span>
            </li>
            <li>
              <span className="text-gray-500 cursor-not-allowed hover:text-gray-400">Shipping Information</span>
            </li>
            <li>
              <span className="text-gray-500 cursor-not-allowed hover:text-gray-400">Privacy Policy & Terms</span>
            </li>
          </ul>
        </div>

        {/* Column 4: Store Location & Address */}
        <div className="space-y-4">
          <h4 className="font-playfair font-bold text-white text-base tracking-wider uppercase">Our Store</h4>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-2.5 leading-snug">
              <MapPin className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
              <span>Shop 12, Ground Floor, Aggarwal Plaza, Sector 12, Noida, UP, 201301</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
              <span>support@aonemobile.com</span>
            </li>
          </ul>
          
          {/* Simulated Google Map Button */}
          <div className="pt-2">
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 bg-gray-800 rounded-button border border-gray-700 hover:bg-gray-750 transition-colors text-xs font-semibold text-white"
            >
              <span className="flex items-center gap-1.5">📍 View Location on Google Maps</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} A-One Mobile Store. All Rights Reserved. Exclusively selling Premium Mobile Accessories.</p>
        
        {/* Payment Icons */}
        <div className="flex items-center gap-3">
          <span className="bg-gray-800 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">UPI</span>
          <span className="bg-gray-800 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">RAZORPAY</span>
          <span className="bg-gray-800 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">VISA</span>
          <span className="bg-gray-800 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">MASTERCARD</span>
          <span className="bg-gray-800 text-[10px] font-bold text-gray-400 px-2 py-1 rounded">COD</span>
        </div>
      </div>
    </footer>
  );
};
