import React from 'react';

const companies = [
  {
    name: 'Walmart',
    url: 'https://www.walmart.com',
    svg: (
      <svg viewBox="0 0 100 24" className="h-6 md:h-7" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.2 18.2l-2.4-1.4-2.4 1.4.5-2.7-2-1.9 2.7-.4 1.2-2.5 1.2 2.5 2.7.4-2 1.9.4 2.7z" fill="#FFC220"/>
        <text x="0" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#0071CE">Walmart</text>
      </svg>
    )
  },

  {
    name: 'Samsung',
    url: 'https://www.samsung.com',
    svg: (
      <svg viewBox="0 0 100 24" className="h-5 md:h-6" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="45" cy="12" rx="45" ry="10" fill="#1428A0"/>
        <text x="12" y="17" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" fill="white">SAMSUNG</text>
      </svg>
    )
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.com',
    svg: (
      <svg viewBox="0 0 100 30" className="h-7 md:h-9" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="18" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="18" fill="black">amazon</text>
        <path d="M12 22c5 3 15 3 25-2" stroke="#FF9900" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M35 18l3 3-4 1" fill="#FF9900"/>
      </svg>
    )
  },
  {
    name: 'Adobe',
    url: 'https://www.adobe.com',
    svg: (
      <svg viewBox="0 0 100 24" className="h-6 md:h-7" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 2h10l-5 14z" fill="#FA0F00"/>
        <text x="20" y="16" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="16" fill="#FA0F00">Adobe</text>
      </svg>
    )
  },
  {
    name: 'Microsoft',
    url: 'https://www.microsoft.com',
    svg: (
      <svg viewBox="0 0 120 24" className="h-6 md:h-7" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="2" width="8" height="8" fill="#F25022"/>
        <rect x="9" y="2" width="8" height="8" fill="#7FBA00"/>
        <rect x="0" y="11" width="8" height="8" fill="#00A4EF"/>
        <rect x="9" y="11" width="8" height="8" fill="#FFB900"/>
        <text x="25" y="16" fontFamily="Segoe UI, Arial" fontWeight="600" fontSize="16" fill="#737373">Microsoft</text>
      </svg>
    )
  }
];

const TrustedBy = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-10">
      {/* Container Box matching JOBlent screenshot */}
      <div className="bg-white border border-gray-100 rounded-xl py-10 px-12 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="min-w-fit">
            <h2 className="text-lg font-bold text-gray-700">
              Trusted by
            </h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 flex-1">
            {companies.map((company) => (
              <a
                key={company.name}
                href={company.url}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105 inline-block"
              >
                {company.svg}
              </a>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TrustedBy;