import { useState } from 'react';
import { Layers, FileCode2 } from 'lucide-react';
import VisualDiffTab from './components/visual-diff/VisualDiffTab';
import DomDiffTab from './components/dom-diff/DomDiffTab';

function App() {
  const [activeTab, setActiveTab] = useState<'visual' | 'dom'>('visual');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pb-20 pt-8 sm:px-6">
      <header className="w-full max-w-6xl mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent mb-6">
          DOMDiff
        </h1>

        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'visual'
              ? 'bg-accent text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
          >
            <Layers size={18} />
            Visual Diff
          </button>
          <button
            onClick={() => setActiveTab('dom')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${activeTab === 'dom'
              ? 'bg-accent text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
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
