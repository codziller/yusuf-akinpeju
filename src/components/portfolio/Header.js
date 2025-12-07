import Link from "next/link";
import React from "react";

const Header = ({ onSocialProofClick }) => {
  return (
    <header className="w-full border-b border-grey-border py-4 px-6 md:px-8 flex justify-between items-start bg-white fixed top-0 left-0 right-0 z-40">
      <Link href="/">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Yusuf Akinpeju
        </h1>
        <p className="text-grey-text mt-0.5 text-sm md:text-base">
          Fullstack engineer
        </p>
      </Link>
      <div className="flex items-center">
        <button
          onClick={onSocialProofClick}
          className="px-4 py-2 bg-white border border-grey-border rounded-full text-sm md:text-base hover:border-grey-text transition-all duration-300 cursor-pointer whitespace-nowrap"
        >
          social proof
        </button>
      </div>
    </header>
  );
};

export default Header;
