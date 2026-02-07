
import React from 'react';

interface GroundingSourcesProps {
  sources: any[];
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Verified Sources</p>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => {
          const web = source.web;
          if (!web) return null;
          return (
            <a 
              key={idx}
              href={web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-1 bg-gray-50 hover:bg-burnt-orange/10 border border-gray-200 rounded text-[10px] text-gray-600 hover:text-burnt-orange transition-colors truncate max-w-[200px]"
              title={web.title}
            >
              <i className="fas fa-link mr-1 opacity-50"></i>
              {web.title || 'View Source'}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default GroundingSources;
