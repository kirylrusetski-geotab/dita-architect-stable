import React from 'react';

export const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  return (
    <div className="group/tooltip relative flex items-center justify-center">
      {children}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-slate-200 text-[10px] font-medium rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-slate-700">
        {content}
      </div>
    </div>
  );
};
