import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import WashroomPanel from './components/WashroomPanel';
import ParkingMap from './components/ParkingMap';
import GateBoard from './components/GateBoard';
import AlertFeed from './components/AlertFeed';

const useVenueState = () => {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  const fetchState = async () => {
    try {
      const response = await axios.get('/api/state');
      setState(response.data);
    } catch (err) {
      console.error(err);
      setError(err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 3000);
    return () => clearInterval(interval);
  }, []);

  return { state, error, fetchState };
};

const FanAssistant = ({ state }) => {
  const [chatLog, setChatLog] = useState([
    { role: 'assistant', text: 'Hello! I am your ArenaFlow Fan Assistant powered by Gemini AI. Need help finding facilities or understanding the crowd logic right now?' }
  ]);
  const [inputStr, setInputStr] = useState('');

  const handleChat = async () => {
    if (!inputStr.trim()) return;
    const userMsg = inputStr;
    setInputStr('');
    setChatLog(p => [...p, { role: 'user', text: userMsg }]);

    try {
      const res = await axios.post('/api/chat', { message: userMsg, fan_section: 'General' });
      setChatLog(p => [...p, { role: 'assistant', text: res.data.reply }]);
    } catch (e) {
      setChatLog(p => [...p, { role: 'assistant', text: 'Error connecting to intelligence. Have you configured the GOOGLE_API_KEY inside your .env?' }]);
    }
  };

  return (
    <div className="p-8 h-[900px] flex flex-col bg-slate-50 border border-slate-200 rounded-xl shadow-xl w-full max-w-5xl mx-auto mt-6">
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Arena Assistant Copilot</h2>
          <p className="text-gray-500 font-medium">Ask our advanced AI crowd navigator for live optimized routing!</p>
        </div>
      </div>

      {state && <div className="text-[11px] font-bold text-gray-500 font-mono tracking-widest uppercase mb-4 text-center border bg-white p-2 rounded shadow-sm w-fit mx-auto shadow-sm">Sync Matrix: {state.phase} /// Venue Time: {state.time}</div>}

      <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto space-y-6 mb-4 shadow-inner">
        {chatLog.map((c, i) => (
          <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 max-w-[80%] rounded-2xl text-[15px] leading-relaxed shadow-md ${c.role === 'user' ? 'bg-blue-700 text-white rounded-br-none font-medium' : 'bg-gray-100/80 text-gray-800 border border-gray-200 rounded-bl-none font-sans whitespace-pre-wrap'}`}>
              {c.text}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4">
        <input type="text" value={inputStr} onChange={e => setInputStr(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Where is the emptiest washroom nearest to me right now?" className="flex-1 p-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-700 transition-shadow bg-white shadow-inner font-medium text-gray-800 placeholder-gray-400" />
        <button onClick={handleChat} className="bg-blue-700 hover:bg-blue-800 active:scale-95 transition-all text-white px-8 text-lg font-bold rounded-xl shadow-lg border border-blue-800">Send Compute</button>
      </div>
    </div>
  );
};

const CommandCentre = ({ state, fetchState }) => {
  const advancePhaseAPI = async () => {
    try {
      await axios.post('/api/advance-phase');
      fetchState();
    } catch (e) {
      console.error('Error advancing', e);
    }
  };

  return (
    <div className="p-6 bg-[#0f1115] w-full flex flex-col gap-6 rounded-2xl shadow-2xl">
      {/* Sticky Global Top Header phase control explicit override */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gray-900 rounded-xl border border-gray-700 shadow-xl sticky top-4 z-50">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">Command Control</h1>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3"><span className="relative inline-flex rounded-full h-3 w-3 bg-green-700"></span></span>
            <span className="text-gray-400 text-sm font-mono uppercase tracking-widest font-bold">Simulator Phase: {state?.phase || 'Booting...'}</span>
          </div>
        </div>
        <button onClick={advancePhaseAPI} className="bg-green-700 hover:bg-green-800 text-white text-lg font-black px-8 py-4 rounded-xl shadow-lg border border-green-800 transition-all active:scale-95 flex items-center gap-3 group tracking-wide">
          Advance Phase ▶
        </button>
      </div>

      {/* Unified Dashboard Top Split: Heatmap 60% | Alerts 40% */}
      <div className="flex flex-col xl:flex-row gap-6 h-auto xl:h-[700px]">
        <div className="w-full xl:w-[60%] flex bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg h-[700px] xl:h-full relative p-1">
          <Dashboard venueState={state} onAdvancePhase={advancePhaseAPI} />
        </div>
        <div className="w-full xl:w-[40%] flex shadow-lg h-[700px] xl:h-full relative font-sans">
          <AlertFeed />
        </div>
      </div>

      {/* 3 Column Stacked Action Grid: Washrooms | Parking | Gates */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-auto xl:h-[880px] pb-10">
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 h-[880px] xl:h-full"><WashroomPanel /></div>
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 h-[880px] xl:h-full"><ParkingMap /></div>
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-700 h-[880px] xl:h-full"><GateBoard /></div>
      </div>
    </div>
  );
};

export default function App() {
  const { state, error, fetchState } = useVenueState();
  const [activeTab, setActiveTab] = useState('cmd');
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-[#121212] text-white p-5 shadow-lg flex justify-between items-center px-8 border-b-2 border-gray-700">
        <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span className="text-blue-100">ArenaFlow</span>
          <span className="opacity-40 text-sm font-medium tracking-widest uppercase ml-2 pt-1 hidden md:block border-l pl-3 border-gray-700">Master Operations System</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-xl font-mono font-bold text-gray-300 bg-gray-900 border border-gray-700 px-4 py-1.5 rounded-lg shadow-inner">{time}</div>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8 w-full flex flex-col items-center">
        {error && (
          <div className="bg-red-500 text-white font-bold px-6 py-4 rounded-xl shadow-xl mb-6 w-full max-w-7xl flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              Critical System Failure: Backend API Offline. Run uvicorn main:app.
            </span>
          </div>
        )}

        {/* Global Navigation Console */}
        <div className="w-full max-w-[2000px] mb-6 flex gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-200 transition-all mx-auto">
          <button
            onClick={() => setActiveTab('cmd')}
            className={`flex-1 text-xl font-black py-4 rounded-lg transition-all flex items-center justify-center gap-3 ${activeTab === 'cmd' ? 'bg-[#0f1115] text-blue-100 shadow-md scale-[1.01]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg>
            Venue Command Centre (Master View)
          </button>
          <button
            onClick={() => setActiveTab('fan')}
            className={`flex-1 text-xl font-black py-4 rounded-lg transition-all flex items-center justify-center gap-3 ${activeTab === 'fan' ? 'bg-blue-700 text-white shadow-md scale-[1.01]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            Fan Assistant (AI Copilot)
          </button>
        </div>

        {/* Global Render Outlet */}
        <div className="w-full max-w-[2100px] mx-auto flex-1 flex flex-col h-full rounded-2xl relative">
          {activeTab === 'fan' ? <FanAssistant state={state} /> : <CommandCentre state={state} fetchState={fetchState} />}
        </div>
      </main>
    </div>
  );
}
