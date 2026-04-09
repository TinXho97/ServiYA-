import { Hammer } from 'lucide-react';

export const BrandLogo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <div className="bg-indigo-600 p-2 rounded-lg">
      <Hammer className="h-6 w-6 text-white" />
    </div>
    <div className="flex items-center">
      <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
        ServiYA
      </span>
      <div className="relative ml-1">
        <svg 
          viewBox="0 0 24 24" 
          className="h-8 w-8 text-indigo-600"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Head */}
          <circle cx="14" cy="7" r="2" />
          {/* Body sitting like an ampersand */}
          <path d="M14 9c-2 0-4 1-4 4s2 4 4 4 4-1 4-4-2-4-4-4c-2 0-4 1-4 4 0 3 2 4 4 4h4" />
          {/* Phone */}
          <rect x="16" y="10" width="1.5" height="3" rx="0.2" fill="currentColor" />
          {/* Phone light glow */}
          <circle cx="16.75" cy="11.5" r="1.5" className="animate-pulse text-indigo-400" fill="currentColor" fillOpacity="0.3" stroke="none" />
        </svg>
      </div>
    </div>
  </div>
);
