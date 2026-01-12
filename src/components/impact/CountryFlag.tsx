import React from 'react';

interface CountryFlagProps {
  country: string;
  size?: number;
  className?: string;
}

// Simple SVG flags for each country
export function CountryFlag({ country, size = 16, className = '' }: CountryFlagProps) {
  const height = size * 0.7;
  
  const flagConfig = FLAGS[country] || FLAGS['Unknown'];
  
  return (
    <svg 
      width={size} 
      height={height} 
      viewBox="0 0 30 21" 
      className={`rounded-sm shadow-sm ${className}`}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
    >
      {flagConfig}
    </svg>
  );
}

// SVG flag definitions
const FLAGS: Record<string, React.ReactNode> = {
  'Vietnam': (
    <>
      <rect width="30" height="21" fill="#da251d" />
      <polygon 
        points="15,4 17.4,10.5 24,10.5 18.6,14.5 20.8,21 15,17 9.2,21 11.4,14.5 6,10.5 12.6,10.5" 
        fill="#ffcd00" 
      />
    </>
  ),
  
  'USA': (
    <>
      <rect width="30" height="21" fill="#bf0a30" />
      <rect y="1.6" width="30" height="1.6" fill="#fff" />
      <rect y="4.8" width="30" height="1.6" fill="#fff" />
      <rect y="8" width="30" height="1.6" fill="#fff" />
      <rect y="11.2" width="30" height="1.6" fill="#fff" />
      <rect y="14.4" width="30" height="1.6" fill="#fff" />
      <rect y="17.6" width="30" height="1.6" fill="#fff" />
      <rect width="12" height="11.2" fill="#002868" />
      <text x="6" y="7" fontSize="3" fill="#fff" textAnchor="middle">✦</text>
    </>
  ),
  
  'Japan': (
    <>
      <rect width="30" height="21" fill="#fff" />
      <circle cx="15" cy="10.5" r="6" fill="#bc002d" />
    </>
  ),
  
  'France': (
    <>
      <rect width="10" height="21" fill="#002395" />
      <rect x="10" width="10" height="21" fill="#fff" />
      <rect x="20" width="10" height="21" fill="#ed2939" />
    </>
  ),
  
  'UK': (
    <>
      <rect width="30" height="21" fill="#012169" />
      <path d="M0,0 L30,21 M30,0 L0,21" stroke="#fff" strokeWidth="4" />
      <path d="M0,0 L30,21 M30,0 L0,21" stroke="#c8102e" strokeWidth="2" />
      <path d="M15,0 V21 M0,10.5 H30" stroke="#fff" strokeWidth="5" />
      <path d="M15,0 V21 M0,10.5 H30" stroke="#c8102e" strokeWidth="3" />
    </>
  ),
  
  'Spain': (
    <>
      <rect width="30" height="5.25" fill="#aa151b" />
      <rect y="5.25" width="30" height="10.5" fill="#f1bf00" />
      <rect y="15.75" width="30" height="5.25" fill="#aa151b" />
    </>
  ),
  
  'Portugal': (
    <>
      <rect width="12" height="21" fill="#006600" />
      <rect x="12" width="18" height="21" fill="#ff0000" />
      <circle cx="12" cy="10.5" r="4" fill="#ffcc00" />
    </>
  ),
  
  'Italy': (
    <>
      <rect width="10" height="21" fill="#009246" />
      <rect x="10" width="10" height="21" fill="#fff" />
      <rect x="20" width="10" height="21" fill="#ce2b37" />
    </>
  ),
  
  'Greece': (
    <>
      <rect width="30" height="21" fill="#0d5eaf" />
      <rect y="2.33" width="30" height="2.33" fill="#fff" />
      <rect y="7" width="30" height="2.33" fill="#fff" />
      <rect y="11.67" width="30" height="2.33" fill="#fff" />
      <rect y="16.33" width="30" height="2.33" fill="#fff" />
      <rect width="11.67" height="11.67" fill="#0d5eaf" />
      <rect x="5" width="1.67" height="11.67" fill="#fff" />
      <rect y="5" width="11.67" height="1.67" fill="#fff" />
    </>
  ),
  
  'Indonesia': (
    <>
      <rect width="30" height="10.5" fill="#ff0000" />
      <rect y="10.5" width="30" height="10.5" fill="#fff" />
    </>
  ),
  
  'Philippines': (
    <>
      <rect width="30" height="10.5" fill="#0038a8" />
      <rect y="10.5" width="30" height="10.5" fill="#ce1126" />
      <polygon points="0,0 14,10.5 0,21" fill="#fff" />
      <circle cx="5" cy="10.5" r="2" fill="#fcd116" />
    </>
  ),
  
  'Taiwan': (
    <>
      <rect width="30" height="21" fill="#fe0000" />
      <rect width="15" height="10.5" fill="#000095" />
      <circle cx="7.5" cy="5.25" r="3" fill="#fff" />
      <circle cx="7.5" cy="5.25" r="2" fill="#000095" />
    </>
  ),
  
  'South Korea': (
    <>
      <rect width="30" height="21" fill="#fff" />
      <circle cx="15" cy="10.5" r="5" fill="#c60c30" />
      <path d="M15,5.5 Q20,10.5 15,15.5" fill="#003478" />
    </>
  ),
  
  'New Zealand': (
    <>
      <rect width="30" height="21" fill="#00247d" />
      <rect width="15" height="10.5" fill="#00247d" />
      <path d="M0,0 L15,10.5 M15,0 L0,10.5" stroke="#fff" strokeWidth="2" />
      <path d="M0,0 L15,10.5 M15,0 L0,10.5" stroke="#cf142b" strokeWidth="1" />
      <circle cx="22" cy="6" r="1.2" fill="#cf142b" />
      <circle cx="25" cy="9" r="1.2" fill="#cf142b" />
      <circle cx="24" cy="14" r="1.2" fill="#cf142b" />
      <circle cx="20" cy="12" r="1.2" fill="#cf142b" />
    </>
  ),
  
  'Australia': (
    <>
      <rect width="30" height="21" fill="#00008b" />
      <rect width="15" height="10.5" fill="#00008b" />
      <path d="M0,0 L15,10.5 M15,0 L0,10.5" stroke="#fff" strokeWidth="2" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#fff" strokeWidth="3" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#cf142b" strokeWidth="1.5" />
      <polygon points="8,15 9,17 11,17 9.5,18.5 10,21 8,19.5 6,21 6.5,18.5 5,17 7,17" fill="#fff" transform="scale(0.5) translate(28,20)" />
    </>
  ),
  
  'Ecuador': (
    <>
      <rect width="30" height="10.5" fill="#ffe800" />
      <rect y="10.5" width="30" height="5.25" fill="#0072ce" />
      <rect y="15.75" width="30" height="5.25" fill="#e10600" />
    </>
  ),
  
  'Fiji': (
    <>
      <rect width="30" height="21" fill="#68bfe5" />
      <rect width="15" height="10.5" fill="#002868" />
      <path d="M0,0 L15,10.5 M15,0 L0,10.5" stroke="#fff" strokeWidth="2" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#fff" strokeWidth="3" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#cf142b" strokeWidth="1.5" />
    </>
  ),
  
  'Samoa': (
    <>
      <rect width="30" height="21" fill="#ce1126" />
      <rect width="15" height="10.5" fill="#002b7f" />
      <circle cx="7" cy="3" r="0.8" fill="#fff" />
      <circle cx="10" cy="4" r="0.8" fill="#fff" />
      <circle cx="8" cy="7" r="0.8" fill="#fff" />
      <circle cx="5" cy="6" r="0.8" fill="#fff" />
      <circle cx="7.5" cy="5" r="1" fill="#fff" />
    </>
  ),
  
  'Tonga': (
    <>
      <rect width="30" height="21" fill="#c10000" />
      <rect width="12" height="10" fill="#fff" />
      <rect x="4" y="3" width="4" height="4" fill="#c10000" />
      <rect x="5.5" y="2" width="1" height="6" fill="#c10000" />
      <rect x="3" y="4.5" width="6" height="1" fill="#c10000" />
    </>
  ),
  
  'Vanuatu': (
    <>
      <rect width="30" height="21" fill="#009543" />
      <rect y="10.5" width="30" height="10.5" fill="#d21034" />
      <polygon points="0,0 12,10.5 0,21" fill="#000" />
      <polygon points="0,1 10,10.5 0,20" fill="#fdce12" />
    </>
  ),
  
  'Palau': (
    <>
      <rect width="30" height="21" fill="#4aadd6" />
      <circle cx="13" cy="10.5" r="6" fill="#ffde00" />
    </>
  ),
  
  'Maldives': (
    <>
      <rect width="30" height="21" fill="#d21034" />
      <rect x="5" y="4" width="20" height="13" fill="#007e3a" />
      <path d="M18,10.5 A4,4 0 1,1 14,10.5 A3,3 0 1,0 18,10.5" fill="#fff" />
    </>
  ),
  
  'Seychelles': (
    <>
      <polygon points="0,21 0,0 10,21" fill="#003f87" />
      <polygon points="0,0 20,21 10,21" fill="#fcd856" />
      <polygon points="0,0 30,21 20,21" fill="#d62828" />
      <polygon points="0,0 30,0 30,21" fill="#fff" />
      <polygon points="30,0 30,14 15,0" fill="#007a3d" />
    </>
  ),
  
  'Mauritius': (
    <>
      <rect width="30" height="5.25" fill="#ea2839" />
      <rect y="5.25" width="30" height="5.25" fill="#1a206d" />
      <rect y="10.5" width="30" height="5.25" fill="#ffcd00" />
      <rect y="15.75" width="30" height="5.25" fill="#00a551" />
    </>
  ),
  
  'Comoros': (
    <>
      <rect width="30" height="5.25" fill="#ffc61e" />
      <rect y="5.25" width="30" height="5.25" fill="#fff" />
      <rect y="10.5" width="30" height="5.25" fill="#ce1126" />
      <rect y="15.75" width="30" height="5.25" fill="#3a75c4" />
      <polygon points="0,0 12,10.5 0,21" fill="#3a75c4" />
    </>
  ),
  
  'Tanzania': (
    <>
      <polygon points="0,0 30,21 30,0" fill="#1eb53a" />
      <polygon points="0,0 0,21 30,21" fill="#00a3dd" />
      <polygon points="0,5 25,21 30,21 30,16 5,0 0,0" fill="#000" />
      <polygon points="0,3 27,21 30,21 30,18 3,0 0,0" fill="#fcd116" />
    </>
  ),
  
  'Sri Lanka': (
    <>
      <rect width="30" height="21" fill="#8d153a" />
      <rect width="5" height="21" fill="#ff7f00" />
      <rect x="5" width="5" height="21" fill="#00534e" />
      <rect x="12" y="2" width="16" height="17" fill="#8d153a" />
      <rect x="14" y="4" width="12" height="13" fill="#ffb700" />
    </>
  ),
  
  'Chile': (
    <>
      <rect width="30" height="10.5" fill="#fff" />
      <rect y="10.5" width="30" height="10.5" fill="#d52b1e" />
      <rect width="10" height="10.5" fill="#0039a6" />
      <polygon points="5,2 6,5 9,5 6.5,7 7.5,10 5,8 2.5,10 3.5,7 1,5 4,5" fill="#fff" />
    </>
  ),
  
  'Brazil': (
    <>
      <rect width="30" height="21" fill="#009c3b" />
      <polygon points="2,10.5 15,3 28,10.5 15,18" fill="#ffdf00" />
      <circle cx="15" cy="10.5" r="5" fill="#002776" />
    </>
  ),
  
  'Denmark': (
    <>
      <rect width="30" height="21" fill="#c8102e" />
      <rect x="8" width="4" height="21" fill="#fff" />
      <rect y="8.5" width="30" height="4" fill="#fff" />
    </>
  ),
  
  'Norway': (
    <>
      <rect width="30" height="21" fill="#ba0c2f" />
      <rect x="8" width="6" height="21" fill="#fff" />
      <rect y="7.5" width="30" height="6" fill="#fff" />
      <rect x="9.5" width="3" height="21" fill="#00205b" />
      <rect y="9" width="30" height="3" fill="#00205b" />
    </>
  ),
  
  'Russia': (
    <>
      <rect width="30" height="7" fill="#fff" />
      <rect y="7" width="30" height="7" fill="#0039a6" />
      <rect y="14" width="30" height="7" fill="#d52b1e" />
    </>
  ),
  
  'Canada': (
    <>
      <rect width="7.5" height="21" fill="#ff0000" />
      <rect x="7.5" width="15" height="21" fill="#fff" />
      <rect x="22.5" width="7.5" height="21" fill="#ff0000" />
      <path d="M15,4 L16,8 L13,9 L14,11 L12,10 L12,13 L15,12 L15,14 L15,12 L18,13 L18,10 L16,11 L17,9 L14,8 Z" fill="#ff0000" />
    </>
  ),
  
  'Cyprus': (
    <>
      <rect width="30" height="21" fill="#fff" />
      <ellipse cx="15" cy="9" rx="8" ry="5" fill="#d47600" />
      <rect x="10" y="14" width="2" height="4" fill="#4e6932" />
      <rect x="18" y="14" width="2" height="4" fill="#4e6932" />
    </>
  ),
  
  'Marshall Islands': (
    <>
      <rect width="30" height="21" fill="#003893" />
      <polygon points="0,21 30,0 30,6 0,21" fill="#dd7500" />
      <polygon points="0,15 30,0 30,0 0,21" fill="#fff" />
      <polygon points="3,3 5,9 0,5.5 6,5.5 1,9" fill="#fff" />
    </>
  ),
  
  'Micronesia': (
    <>
      <rect width="30" height="21" fill="#75b2dd" />
      <circle cx="15" cy="6" r="1.5" fill="#fff" />
      <circle cx="9" cy="10.5" r="1.5" fill="#fff" />
      <circle cx="21" cy="10.5" r="1.5" fill="#fff" />
      <circle cx="15" cy="15" r="1.5" fill="#fff" />
    </>
  ),
  
  'Kiribati': (
    <>
      <rect width="30" height="10.5" fill="#ce1126" />
      <rect y="10.5" width="30" height="10.5" fill="#003f87" />
      <rect y="10.5" width="30" height="2" fill="#fff" />
      <rect y="13.5" width="30" height="2" fill="#fff" />
      <rect y="16.5" width="30" height="2" fill="#fff" />
      <circle cx="15" cy="5" r="4" fill="#fcd116" />
    </>
  ),
  
  'Tuvalu': (
    <>
      <rect width="30" height="21" fill="#00a1de" />
      <rect width="15" height="10.5" fill="#00247d" />
      <path d="M0,0 L15,10.5 M15,0 L0,10.5" stroke="#fff" strokeWidth="2" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#fff" strokeWidth="3" />
      <path d="M7.5,0 V10.5 M0,5.25 H15" stroke="#cf142b" strokeWidth="1.5" />
      <circle cx="20" cy="5" r="1" fill="#fcd116" />
      <circle cx="25" cy="8" r="1" fill="#fcd116" />
      <circle cx="22" cy="14" r="1" fill="#fcd116" />
      <circle cx="18" cy="16" r="1" fill="#fcd116" />
    </>
  ),
  
  'Unknown': (
    <>
      <rect width="30" height="21" fill="#e5e7eb" />
      <circle cx="15" cy="10.5" r="5" fill="#9ca3af" />
      <text x="15" y="13" fontSize="8" fill="#fff" textAnchor="middle">?</text>
    </>
  ),
};

export default CountryFlag;
