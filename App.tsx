import React from 'react';
import ProfessionalDitaEditor from './dita-architect';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-dita-500/30 selection:text-dita-100">
      <ProfessionalDitaEditor />
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}