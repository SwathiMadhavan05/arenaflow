import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AlertFeed() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchTelemetry = async () => {
            try {
                const [wRes, pRes, gRes] = await Promise.all([
                    axios.get('/api/washrooms'),
                    axios.get('/api/parking'),
                    axios.get('/api/gates')
                ]);

                const newAlerts = [];
                const timestamp = new Date().toLocaleTimeString();

                // Evaluate Washrooms Activity
                Object.entries(wRes.data || {}).forEach(([block, pops]) => {
                    const total = Object.values(pops).reduce((a, b) => a + b, 0);
                    if (total > 70) newAlerts.push({ time: timestamp, type: 'CRITICAL', msg: `Washroom ${block} severely congested (${total} occupants)` });
                    else if (total > 50) newAlerts.push({ time: timestamp, type: 'WARNING', msg: `Washroom ${block} traffic elevating (${total} occupants)` });
                });

                // Evaluate Parking Operations
                Object.entries(pRes.data || {}).forEach(([zone, val]) => {
                    if (zone.startsWith('Zone_') && val >= 85) newAlerts.push({ time: timestamp, type: 'CRITICAL', msg: `Parking ${zone.replace('_', ' ')} hitting MAX capacity (${val}%)` });
                    else if (zone.startsWith('Zone_') && val >= 75) newAlerts.push({ time: timestamp, type: 'WARNING', msg: `Parking ${zone.replace('_', ' ')} volume restricted (${val}%)` });
                });

                // Evaluate Gate Headcounts
                Object.entries(gRes.data || {}).forEach(([gate, data]) => {
                    const limit = (data.queue_depth || 0) + (data.biometric_queue_depth || 0);
                    if (limit > 40) newAlerts.push({ time: timestamp, type: 'CRITICAL', msg: `${gate.replace('_', ' ')} queues critical! Exceeding safety threshold (${limit} pax)` });
                    else if (limit > 25) newAlerts.push({ time: timestamp, type: 'WARNING', msg: `${gate.replace('_', ' ')} biometrics overflowing (${limit} pax)` });
                });

                if (newAlerts.length > 0) {
                    setAlerts(prev => {
                        const combined = [...newAlerts, ...prev];
                        const unique = Array.from(new Set(combined.map(a => a.msg)))
                            .map(msg => combined.find(a => a.msg === msg));
                        return unique.slice(0, 18);
                    });
                }
            } catch (err) { }
        };

        fetchTelemetry();
        const int = setInterval(fetchTelemetry, 3000);
        return () => clearInterval(int);
    }, []);

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl flex flex-col h-full overflow-hidden w-full font-sans shadow-lg">
            <div className="bg-gray-800 p-4 border-b border-gray-700 font-bold flex justify-between items-center text-white">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-700"></span>
                    </span>
                    <span className="text-lg tracking-wide">Live Event Telemetry Log</span>
                </div>
                <span className="text-[11px] bg-gray-950 border border-gray-700 px-3 py-1.5 rounded-full text-gray-300 uppercase font-black tracking-widest shadow-inner">{alerts.length} Active System Events</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                        <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-sm font-mono uppercase tracking-widest">No Critical Events Detected</span>
                        <span className="text-xs">Nominal crowd modeling limits executing perfectly.</span>
                    </div>
                ) : (
                    alerts.map((a, i) => (
                        <div key={i} className={`p-4 rounded-lg shadow-sm border-l-[5px] text-sm animate-fade-in ${a.type === 'CRITICAL' ? 'bg-red-500/10 border-red-500 text-red-200 shadow-red-900/10' : 'bg-amber-500/10 border-amber-500 text-amber-200 shadow-amber-900/10'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className={`font-black tracking-wider text-[11px] px-2 py-0.5 rounded shadow-sm ${a.type === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>{a.type} PRIORITY</span>
                                <span className="text-xs opacity-60 font-mono tracking-widest">{a.time}</span>
                            </div>
                            <div className="leading-snug font-medium pt-1 pr-2 text-base">{a.msg}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
