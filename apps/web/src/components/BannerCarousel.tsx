'use client';

import { useState, useEffect, useCallback } from 'react';

const BANNERS = [
  '/img/banners/banner-1.png',
  '/img/banners/banner-2.png',
  '/img/banners/banner-3.jpg',
];

export default function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="relative w-full bg-white group border-b border-gray-100">
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden">
        <div 
          className="flex h-full w-full transition-transform duration-700 ease-in-out" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {BANNERS.map((src, index) => (
            <div key={index} className="w-full h-full flex-shrink-0 relative">
              <img 
                src={src} 
                alt={`Banner principal ${index + 1}`} 
                className="w-full h-full object-cover sm:object-contain bg-gray-50"
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white text-blue-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all opacity-0 md:group-hover:opacity-100 hover:scale-110"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm hover:bg-white text-blue-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all opacity-0 md:group-hover:opacity-100 hover:scale-110"
          aria-label="Siguiente"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6 6-6"/></svg>
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full shadow-sm ${
                idx === currentIndex ? 'w-10 h-3 bg-blue-600' : 'w-3 h-3 bg-white hover:bg-blue-100'
              }`}
              aria-label={`Ir a la diapositiva ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
