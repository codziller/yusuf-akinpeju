import React from 'react';

const Header = ({ jazzEnabled, setJazzEnabled, onSocialProofClick }) => {
  return (
    <header className="w-full border-b border-grey-border py-4 px-6 md:px-8 flex justify-between items-start bg-white fixed top-0 left-0 right-0 z-40">
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Yusuf Akinpeju</h1>
        <p className="text-grey-text mt-0.5 text-sm md:text-base">Fullstack engineer</p>
      </div>
      <div className="flex items-start md:items-center gap-3 md:gap-6 flex-col md:flex-row">
        <button
          onClick={onSocialProofClick}
          className="text-sm md:text-base hover:text-blue-500 transition-colors cursor-pointer whitespace-nowrap"
        >
          social proof
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base">jazz</span>
          <button
            onClick={() => setJazzEnabled(!jazzEnabled)}
            className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full transition-colors duration-300 ${
              jazzEnabled ? 'bg-black' : 'bg-grey-border'
            }`}
            aria-label="Toggle jazz effect"
          >
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white transition-transform duration-300 ${
                jazzEnabled ? 'translate-x-5 md:translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
