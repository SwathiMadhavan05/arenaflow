import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = ({ venueState, onAdvancePhase }) => {
    const [activeLayer, setActiveLayer] = useState('Crowd');
    const [isAdvancing, setIsAdvancing] = useState(false);

    if (!venueState) return <div className="p-4 text-center text-gray-500">Waiting for telemetry...</div>;

    const layers = ['Crowd', 'Washrooms', 'Parking', 'Gates', 'Concessions', 'Alerts'];
    const PHASES = ["Arrival", "Pre-match", "Kickoff", "Halftime", "Second-half", "Final-whistle"];
    const currentPhaseIndex = PHASES.indexOf(venueState.phase);

    const handleAdvance = async () => {
        setIsAdvancing(true);
        try {
            await axios.post('/api/advance-phase');
            if (onAdvancePhase) await onAdvancePhase();
        } catch (e) {
            console.error(e);
        }
        setIsAdvancing(false);
    };

    const getZoneValue = (zoneIndex) => {
        try {
            switch (activeLayer) {
                case 'Crowd':
                    return venueState.crowd_zones[`Zone_${zoneIndex}`] || 0;
                case 'Washrooms':
                    if (zoneIndex <= 8) {
                        const w = venueState.washrooms[`Block_${zoneIndex}`];
                        return w ? (w.M + w.F + w.Accessible) * 2 : 0;
                    }
                    return null;
                case 'Parking': {
                    const pKeys = ["Zone_A", "Zone_B", "Zone_C", "Zone_D", "Zone_E", "EV_bays"];
                    if (zoneIndex <= pKeys.length) {
                        return venueState.parking[pKeys[zoneIndex - 1]] || 0;
                    }
                    return null;
                }
                case 'Gates':
                    if (zoneIndex <= 10) {
                        const g = venueState.entry_gates[`Gate_${zoneIndex}`];
                        return g ? (g.queue_depth + g.biometric_queue_depth) * 4 : 0;
                    }
                    return null;
                case 'Concessions':
                    if ([1, 2, 3].includes(zoneIndex)) {
                        return venueState.crowd_zones[`Zone_${zoneIndex}`] || 0;
                    }
                    return null;
                case 'Alerts':
                    return 0; // Placeholder
                default:
                    return 0;
            }
        } catch (e) {
            return 0;
        }
    };

    const getColor = (val) => {
        if (val === null || val === undefined) return '#374151'; // N/A
        if (val < 60) return '#22c55e'; // Green
        if (val <= 80) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 p-6 rounded-b-xl text-white">
            {/* Phase Stepper Control */}
            <div className="mb-6 flex flex-col md:flex-row items-center justify-between bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
                <div className="flex-1 w-full mb-6 md:mb-0 flex items-center justify-between px-4 relative z-0">
                    <div className="absolute top-3 left-4 right-4 h-1 bg-gray-700 -z-10 translate-y-[-50%] rounded-full"></div>
                    {PHASES.map((phase, idx) => {
                        const isPast = idx < currentPhaseIndex;
                        const isCurrent = idx === currentPhaseIndex;
                        return (
                            <div key={phase} className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs ${isPast ? 'bg-blue-700 border-blue-700 text-white' : isCurrent ? 'bg-gray-900 border-blue-500 text-blue-300' : 'bg-gray-800 border-gray-600 text-gray-500'}`}>
                                    {isPast ? '✓' : idx + 1}
                                </div>
                                <span className={`mt-2 text-xs font-semibold tracking-wide ${isCurrent ? 'text-blue-300' : isPast ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {phase}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <button
                    onClick={handleAdvance}
                    disabled={isAdvancing}
                    className="md:ml-8 whitespace-nowrap bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-blue-800"
                >
                    {isAdvancing ? 'Advancing...' : 'Advance Phase ▶'}
                </button>
            </div>

            {/* Layer Toggles */}
            <div className="flex flex-wrap gap-3 mb-6 border-b border-gray-700 pb-4">
                {layers.map(layer => (
                    <button
                        key={layer}
                        onClick={() => setActiveLayer(layer)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeLayer === layer
                                ? 'bg-blue-700 text-white shadow-md'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        {layer}
                    </button>
                ))}
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <svg viewBox="0 0 810 610" className="w-full max-w-4xl h-full drop-shadow-xl">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const idx = i + 1;
                        const col = i % 4;
                        const row = Math.floor(i / 4);
                        const w = 180;
                        const h = 180;
                        const x = col * 200 + 15;
                        const y = row * 200 + 15;

                        const val = getZoneValue(idx);
                        const color = getColor(val);
                        const displayVal = val === null ? "N/A" : `${Math.min(100, Math.round(val))}%`;

                        return (
                            <g key={idx} className="transition-all duration-500 ease-in-out cursor-pointer hover:opacity-80">
                                <rect x={x} y={y} width={w} height={h} rx="16" fill={color} className="transition-colors duration-500 ease-in-out" />
                                <text x={x + w / 2} y={y + h / 2 - 15} fill="#ffffff" fontSize="28" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                                    Z{idx}
                                </text>
                                <text x={x + w / 2} y={y + h / 2 + 25} fill="#ffffff" fontSize="20" fontWeight="600" textAnchor="middle" dominantBaseline="middle" opacity="0.9">
                                    {displayVal}
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            <div className="mt-4 flex gap-4 text-sm justify-center text-gray-400 font-medium">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div> &lt;60%</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-amber-500"></div> 60-80%</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div> &gt;80%</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-gray-700"></div> N/A</div>
            </div>
        </div>
    );
};

export default Dashboard;
