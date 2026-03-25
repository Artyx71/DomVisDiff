import { useState } from 'react';
import { Layers, FileCode2 } from 'lucide-react';
import VisualDiffTab from './components/visual-diff/VisualDiffTab';
import DomDiffTab from './components/dom-diff/DomDiffTab';

function App() {
  const [activeTab, setActiveTab] = useState<'visual' | 'dom'>('visual');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-20 pt-8 sm:px-6">
      <header className="w-full max-w-6xl mb-8 flex flex-col items-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-accent via-blue-400 to-indigo-400 bg-clip-text text-transparent mb-8 tracking-tight drop-shadow-sm">
          DOMDiff
        </h1>

        <div className="flex glass-dark p-1.5 shadow-2xl rounded-2xl border border-white/5 accent-glow">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl transition-all duration-300 ${activeTab === 'visual'
              ? 'bg-accent text-white shadow-[0_0_15px_rgba(108,108,255,0.4)]'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            <Layers size={18} />
            Visual Diff
          </button>
          <button
            onClick={() => setActiveTab('dom')}
            className={`flex items-center gap-2 px-8 py-2.5 rounded-xl transition-all duration-300 ${activeTab === 'dom'
              ? 'bg-accent text-white shadow-[0_0_15px_rgba(108,108,255,0.4)]'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
              }`}
          >
            <FileCode2 size={18} />
            DOM Diff
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl flex-grow flex flex-col">
        {activeTab === 'visual' ? <VisualDiffTab /> : <DomDiffTab />}
      </main>
    </div>
  );
}

export default App;
