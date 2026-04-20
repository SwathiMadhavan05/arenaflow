import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export default function WashroomPanel() {
    const [washrooms, setWashrooms] = useState(null);
    const [dispatched, setDispatched] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/washrooms');
                setWashrooms(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
        const int = setInterval(fetchData, 3000);
        return () => clearInterval(int);
    }, []);

    if (!washrooms) return <div className="p-6 text-gray-500">Loading facilities telemetry...</div>;

    const handleDispatch = (blockName) => {
        setDispatched(prev => ({ ...prev, [blockName]: true }));
        setTimeout(() => {
            setDispatched(prev => ({ ...prev, [blockName]: false }));
        }, 4000);
    };

    return (
        <div className="p-6 bg-gray-900 h-full rounded-b-xl text-white overflow-y-auto">
            <div className="mb-6 flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Active Deployments Dashboard</h2>
                    <p className="text-gray-400 mt-1">Real-time restroom utilization and predictive 15-min trajectory dispatching.</p>
                </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
                {Object.entries(washrooms).map(([blockName, data], idx) => {
                    const totalCapacity = 30; // Max volume for calculation 
                    const currentOccupancy = data.M + data.F + data.Accessible;
                    const percentage = Math.min(100, Math.round((currentOccupancy / totalCapacity) * 100));

                    const isDispatched = dispatched[blockName];

                    // Simulating historical and predictive pipeline trend lines natively
                    const sparkData = [
                        { pv: Math.max(0, percentage - 15) },
                        { pv: Math.max(0, percentage - 5) },
                        { pv: percentage },
                        { pv: percentage > 70 ? Math.min(100, percentage + 20) : percentage + 5 }
                    ];

                    return (
                        <div key={blockName} className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700 flex flex-col group transition-all">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-gray-100 flex items-center gap-3">
                                    {blockName.replace('_', ' ')}
                                    <span className="text-xs bg-gray-700 px-2.5 py-0.5 rounded text-gray-300 font-bold border border-gray-600">
                                        Level {Math.ceil((idx + 1) / 2)}
                                    </span>
                                </h3>
                            </div>

                            <div className="flex items-center justify-between mb-4 bg-[#1a1a1a] p-3 rounded border border-gray-900/50 shadow-inner">
                                <div className="text-sm font-mono text-gray-400 flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Men</span>
                                        <span className="text-lg font-medium text-gray-200">{data.M}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Women</span>
                                        <span className="text-lg font-medium text-gray-200">{data.F}</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs text-blue-300 uppercase tracking-wide">ADA</span>
                                        <span className="text-lg font-medium text-blue-200">{data.Accessible}</span>
                                    </div>
                                </div>

                                {/* Micro chart predicting the next 15 min trajectory */}
                                <div className="w-24 h-10 border-b border-gray-700 opacity-90">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={sparkData}>
                                            <YAxis domain={[0, 100]} hide />
                                            <Line type="monotone" dataKey="pv" stroke={percentage > 80 ? '#b91c1c' : '#1d4ed8'} strokeWidth={3} dot={false} isAnimationActive={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-auto">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1 font-semibold tracking-wide">
                                        <span className="text-gray-400 uppercase">Occupancy</span>
                                        <span className={percentage > 80 ? 'text-red-200' : percentage > 50 ? 'text-amber-200' : 'text-green-200'}>{percentage}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden shadow-inner border border-gray-950">
                                        <div
                                            className={`h-full transition-all duration-1000 ${percentage < 50 ? 'bg-green-700' : percentage <= 80 ? 'bg-amber-600' : 'bg-red-700'}`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="min-w-[140px]">
                                    <button
                                        onClick={() => handleDispatch(blockName)}
                                        disabled={isDispatched}
                                        className={`w-full px-4 py-2 text-sm font-bold rounded-md shadow transition-all ${isDispatched ? 'bg-green-900/40 text-green-100 border border-green-800' : 'bg-blue-700 hover:bg-blue-800 text-white border border-blue-800 hover:scale-105 active:scale-95'}`}
                                    >
                                        {isDispatched ? '✓ Crew Sent' : 'Dispatch Crew'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
