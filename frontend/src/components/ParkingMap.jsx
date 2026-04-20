import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ParkingMap() {
    const [parkingData, setParkingData] = useState(null);
    const [plate, setPlate] = useState('');
    const [highlightZone, setHighlightZone] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/parking');
                setParkingData(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchData();
        const int = setInterval(fetchData, 3000);
        return () => clearInterval(int);
    }, []);

    if (!parkingData) return <div className="p-6 text-gray-500">Loading parking telemetry...</div>;

    const handleSearch = (e) => {
        e.preventDefault();
        if (!plate.trim()) {
            setHighlightZone(null);
            return;
        }
        // simple hash to consistently map plate to a zone (A-E)
        // Ensures a specific plate always predictably yields the same zone
        const hash = plate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const zones = ['A', 'B', 'C', 'D', 'E'];
        setHighlightZone(zones[hash % 5]);
    };

    const zones = [
        { id: 'A', x: 50, y: 50, w: 200, h: 120 },
        { id: 'B', x: 50, y: 200, w: 200, h: 120 },
        { id: 'C', x: 350, y: 50, w: 200, h: 120 },
        { id: 'D', x: 350, y: 200, w: 200, h: 120 },
        { id: 'E', x: 200, y: 350, w: 200, h: 100 },
    ];

    const getColor = (val) => {
        if (val < 60) return '#15803d'; // green
        if (val <= 80) return '#b45309'; // amber
        return '#b91c1c'; // red
    };

    const evTaken = parkingData.EV_bays || 0;
    const evTotal = 20;

    // Exit sequencing static layout representing post-match flows 
    const exitSequence = ['E', 'D', 'C', 'B', 'A'];

    return (
        <div className="p-6 bg-gray-900 h-full rounded-b-xl text-white overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">Parking Operations Map</h2>
            <p className="text-gray-400 mb-6 border-b border-gray-700 pb-4">Live lot occupancy, EV bay status, and clearance sequences.</p>

            <div className="flex flex-col gap-8">

                {/* SVG Top-down Map Section */}
                <div className="flex-1 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-inner flex flex-col items-center">
                    <svg viewBox="0 0 600 520" className="w-full max-w-xl h-auto drop-shadow-md">
                        {/* Central Lane */}
                        <rect x="270" y="30" width="60" height="300" fill="#374151" rx="5" />
                        <text x="300" y="180" fill="#9ca3af" fontSize="16" textAnchor="middle" transform="rotate(-90 300 180)" fontWeight="bold">DRIVING LANE</text>

                        {/* Parking Zones Nodes */}
                        {zones.map(z => {
                            const val = parkingData[`Zone_${z.id}`] || 0;
                            const fill = getColor(val);
                            const isHighlighted = highlightZone === z.id;

                            return (
                                <g key={z.id} className="transition-all duration-300">
                                    <rect
                                        x={z.x} y={z.y} width={z.w} height={z.h}
                                        fill={fill}
                                        rx="8"
                                        className={`transition-colors duration-1000 ${isHighlighted ? 'stroke-blue-200 stroke-[6px]' : 'stroke-gray-900 stroke-[3px]'}`}
                                    />
                                    <text x={z.x + z.w / 2} y={z.y + z.h / 2 - 10} fill="#fff" fontSize="28" fontWeight="bold" textAnchor="middle">
                                        Zone {z.id}
                                    </text>
                                    <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 25} fill="#fff" fontSize="20" fontWeight="500" textAnchor="middle" opacity="0.9">
                                        {Math.min(100, val)}% Full
                                    </text>
                                </g>
                            )
                        })}

                        {/* Bottom Row - EV Bays Indicators */}
                        <g transform="translate(50, 480)">
                            <text x="0" y="-12" fill="#e5e7eb" fontSize="15" fontWeight="bold">EV Charging Bays ({Math.max(0, evTotal - evTaken)} Available)</text>
                            {Array.from({ length: evTotal }).map((_, i) => (
                                <rect
                                    key={i}
                                    x={i * 25.5}
                                    y="0"
                                    width="18"
                                    height="24"
                                    rx="4"
                                    fill={i < evTaken ? "#4b5563" : "#15803d"}
                                    className="stroke-gray-900 stroke-1"
                                />
                            ))}
                        </g>
                    </svg>
                </div>

                {/* Modular Side Panel */}
                <div className="w-full flex flex-col gap-6">

                    {/* Consumer Features: Find My Car */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 tracking-wide">
                            🔍 Find My Car
                        </h3>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={plate}
                                onChange={e => setPlate(e.target.value.toUpperCase())}
                                placeholder="Enter Plate Number"
                                className="p-3 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/40 font-mono tracking-wider font-semibold"
                            />
                            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded transition-colors active:scale-95 shadow border border-blue-800">
                                Locate Vehicle
                            </button>
                            {highlightZone && (
                                <div className="mt-2 text-sm text-green-100 bg-green-900/40 p-3 rounded border border-green-800 text-center">
                                    Assigned to: <span className="font-bold text-lg">Zone {highlightZone}</span>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Exit Sequencing Simulation Panel */}
                    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-md flex-1">
                        <h3 className="text-lg font-bold text-white mb-5 tracking-wide">Post-Match Clearance Sequence</h3>
                        <div className="relative">
                            <div className="absolute top-2 bottom-2 left-4 w-1 bg-gray-700/50 rounded-full"></div>
                            <ul className="flex flex-col gap-4">
                                {exitSequence.map((zone, idx) => (
                                    <li key={zone} className="flex items-center gap-5 relative z-10">
                                        <span className={`w-9 h-9 rounded-full ${idx === 0 ? 'bg-green-700 border-green-800' : 'bg-blue-700 border-blue-800'} border-2 flex items-center justify-center font-bold text-white shadow-lg`}>
                                            {idx + 1}
                                        </span>
                                        <div className="bg-gray-900 px-4 py-3 rounded shadow-inner flex-1 border border-gray-700 flex justify-between items-center group hover:border-gray-500 transition-colors">
                                            <span className="font-bold text-gray-200">Zone {zone}</span>
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                                Vol: {parkingData[`Zone_${zone}`] || 0}%
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
