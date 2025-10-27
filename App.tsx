import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartDataPoint, CalculationResult, Milestone, CalculationParams } from './types';

// --- ICONS ---

const BacteriaIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

// --- HELPER FUNCTIONS ---

function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes.toFixed(0)} min`;
    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(1)} h`;
    const days = hours / 24;
    return `${days.toFixed(1)} vrk`;
}

function calculateGrowth(params: CalculationParams): CalculationResult {
    const { doublingTime } = params;
    const initialCount = 2; // Fixed initial count
    const chartData: ChartDataPoint[] = [];

    const milestones: Milestone[] = [{
        label: "Bakteereita alussa",
        value: initialCount.toLocaleString('fi-FI'),
        icon: <BacteriaIcon className="w-8 h-8 text-cyan-400" />
    }, {
        label: "Kaksinkertaistumisaika",
        value: `${doublingTime} min`,
        icon: <ClockIcon className="w-8 h-8 text-cyan-400" />
    }];

    // Chart data generation for bar chart at discrete points
    const timePoints = [
        { label: '30 min', minutes: 30 },
        { label: '1 tunti', minutes: 60 },
        { label: '3 tuntia', minutes: 180 },
        { label: '6 tuntia', minutes: 360 },
        { label: '12 tuntia', minutes: 720 },
        { label: '1 vrk', minutes: 1440 },
        { label: '1.5 vrk', minutes: 2160 },
        { label: '2 vrk', minutes: 2880 },
    ];

    for (const point of timePoints) {
        const doublings = point.minutes / doublingTime;
        const population = initialCount * Math.pow(2, doublings);
        
        chartData.push({
            time: point.minutes,
            timeLabel: point.label,
            population: population,
        });
    }

    return { chartData, milestones };
}


// --- UI COMPONENTS ---

interface InputFormProps {
  onCalculate: (params: CalculationParams) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onCalculate, isLoading }) => {
    const [doublingTime, setDoublingTime] = useState('20');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const time = parseInt(doublingTime, 10);
        
        if (isNaN(time) || time <= 0) {
            setError('Anna positiivinen luku.');
            return;
        }
        setError('');
        onCalculate({ doublingTime: time });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 className="text-2xl font-bold text-white">Syötä jakaantumisnopeus</h2>
            <div>
                <label htmlFor="doublingTime" className="block text-sm font-medium text-slate-300 mb-2">Jakaantumisnopeus (minuutteina)</label>
                <input
                    type="number"
                    id="doublingTime"
                    value={doublingTime}
                    onChange={(e) => setDoublingTime(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded-md border-slate-600 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="esim. 20"
                />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Lasketaan...
                    </>
                ) : 'Laske kasvu'}
            </button>
        </form>
    );
};

interface ResultsDisplayProps {
  results: CalculationResult;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Virstanpylväät</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.milestones.map((milestone) => (
                        <div key={milestone.label} className="bg-slate-800 p-4 rounded-lg flex items-center space-x-4 shadow-md">
                            {milestone.icon}
                            <div>
                                <p className="text-sm text-slate-400">{milestone.label}</p>
                                <p className="text-xl font-bold text-white">{milestone.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-white mb-4">Kasvupylväät</h2>
                <div className="bg-slate-800 p-4 rounded-lg shadow-md h-96 w-full">
                    <ResponsiveContainer>
                        <BarChart data={results.chartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="timeLabel" stroke="#94a3b8" />
                            <YAxis 
                                stroke="#94a3b8" 
                                scale="log" 
                                domain={['auto', 'dataMax']} 
                                tickFormatter={(tick) => tick.toExponential(0)}
                                allowDataOverflow={true}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                labelStyle={{ color: '#cbd5e1' }}
                                formatter={(value: number) => [`${value.toExponential(2)} kpl`, 'Populaatio']}
                            />
                            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                            <Bar dataKey="population" name="Populaatio" fill="#22d3ee" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [params, setParams] = useState<CalculationParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculationResults = useMemo(() => {
    if (!params) return null;
    return calculateGrowth(params);
  }, [params]);

  const handleCalculate = (calcParams: CalculationParams) => {
    setIsLoading(true);
    setError('');
    setParams(calcParams);
    setTimeout(() => setIsLoading(false), 200); 
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                        Bakteerikasvun Simulaattori
                    </span>
                </h1>
                <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    Visualisoi bakteerien eksponentiaalista kasvua. Syötä jakaantumisnopeus ja katso, kuinka nopeasti populaatio kasvaa kahdesta bakteerista.
                </p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="sticky top-8">
                      <InputForm onCalculate={handleCalculate} isLoading={isLoading} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">{error}</div>}
                    
                    {!calculationResults && !isLoading && (
                         <div className="flex flex-col items-center justify-center h-full bg-slate-800/50 rounded-lg p-8 border-2 border-dashed border-slate-700">
                            <BacteriaIcon className="w-16 h-16 text-slate-600 mb-4" />
                            <h3 className="text-xl font-semibold text-slate-300">Odotetaan laskentaa</h3>
                            <p className="text-slate-500 mt-2 text-center">Syötä jakaantumisnopeus ja paina "Laske kasvu" nähdäksesi tulokset.</p>
                        </div>
                    )}

                    {isLoading && !calculationResults && (
                        <div className="flex items-center justify-center h-full bg-slate-800/50 rounded-lg p-8">
                            <p className="text-xl text-slate-400">Suoritetaan ensimmäistä laskentaa...</p>
                        </div>
                    )}
                    
                    {calculationResults && (
                        <ResultsDisplay 
                            results={calculationResults} 
                        />
                    )}
                </div>
            </main>
             <footer className="text-center mt-12 py-6 border-t border-slate-800">
                <p className="text-sm text-slate-500">Toteutettu React ja Tailwind CSS:lla.</p>
            </footer>
        </div>
    </div>
  );
}
