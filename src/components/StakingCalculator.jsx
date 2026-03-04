// src/components/StakingCalculator.jsx
import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';

const POOLS = [
    { id: 'sol', name: 'Solana (SOL)', apy: 7.2, icon: 'SOL' },
    { id: 'eth', name: 'Ethereum (ETH)', apy: 4.1, icon: 'ETH' },
    { id: 'ton', name: 'TON Network', apy: 12.5, icon: 'TON' }
];

export default function StakingCalculator() {
    const [amount, setAmount] = useState(1000);
    const [selectedPool, setSelectedPool] = useState(POOLS[0]);
    const [days, setDays] = useState(30);

    const profit = (amount * (selectedPool.apy / 100) / 365) * days;
    const total = Number(amount) + profit;

    return (
        <div className="dx-card dx-p-8 border-cyan-500/20 bg-gradient-to-br from-cyan-900/10 via-black to-black backdrop-blur-xl relative overflow-hidden">
            {/* Macroglide Background Glow */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] text-cyan-400">
                    <Calculator size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Staking Calculator</h3>
                    <p className="text-sm text-cyan-400/60 font-medium">Estimate your rewards across pools</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    {/* Amount Input */}
                    <div>
                        <label className="text-xs font-bold text-cyan-400/80 uppercase tracking-widest mb-3 block">Amount to Stake ($)</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-cyan-400 transition-colors" size={20} />
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all"
                                placeholder="1000"
                            />
                        </div>
                    </div>

                    {/* Pool Selection */}
                    <div>
                        <label className="text-xs font-bold text-cyan-400/80 uppercase tracking-widest mb-3 block">Select Pool</label>
                        <div className="grid grid-cols-1 gap-3">
                            {POOLS.map(pool => (
                                <button
                                    key={pool.id}
                                    onClick={() => setSelectedPool(pool)}
                                    className={`relative flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-300 ${selectedPool.id === pool.id
                                        ? 'bg-gradient-to-r from-cyan-900/40 to-blue-900/40 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                                        : 'bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10'}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${selectedPool.id === pool.id ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'bg-white/10 text-white/50'}`}>
                                        {pool.icon}
                                    </div>
                                    <span className={`font-bold ${selectedPool.id === pool.id ? 'text-white' : 'text-white/60'}`}>{pool.name}</span>
                                    <span className={`ml-auto font-mono font-bold ${selectedPool.id === pool.id ? 'text-cyan-400' : 'text-cyan-400/60'}`}>{pool.apy}% APY</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Slider */}
                    <div>
                        <div className="flex justify-between mb-3">
                            <label className="text-xs font-bold text-cyan-400/80 uppercase tracking-widest">Duration</label>
                            <span className="text-sm font-mono font-bold text-white">{days} Days</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="365"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            className="w-full h-2 rounded-full appearance-none bg-white/10 cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-col justify-center">
                    <div className="relative overflow-hidden rounded-2xl bg-black border border-cyan-500/30 p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                        <span className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">Estimated Rewards</span>
                        <div className="text-5xl font-bold my-4 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500 drop-shadow-sm">
                            +${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-white/40 font-mono mb-8">
                            Total value: <span className="text-white">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </div>

                        <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-8">
                            <div>
                                <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Monthly Pay</div>
                                <div className="text-xl font-bold text-green-400 font-mono">
                                    ${((amount * (selectedPool.apy / 100)) / 12).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Yearly Pay</div>
                                <div className="text-xl font-bold text-green-400 font-mono">
                                    ${(amount * (selectedPool.apy / 100)).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="dx-btn w-full mt-8 py-5 text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3 group bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border-none text-white transition-all">
                        Stake Now with Auto-Pilot
                        <TrendingUp size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-widest">
                        Funds secured by Audited Smart Contracts
                    </p>
                </div>
            </div>
        </div>
    );
}
