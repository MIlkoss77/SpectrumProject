// src/pages/DashboardPage.jsx
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Card, Button } from '../components/ui';

// Импортируем иконки
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
    Plus,
    Minus,
    RefreshCw,
    Wallet
} from 'lucide-react';

// Мок-данные (позже вынесем в `mocks/data.js`)
const TOP_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "XRPUSDT", "BNBUSDT", "ADAUSDT"];
const balance = 25400.50;
const currentPrice = 67380;

const marketData = [
    { time: 1, timeLabel: '1h', close: 67000 },
    { time: 2, timeLabel: '2h', close: 67150 },
    { time: 3, timeLabel: '3h', close: 67080 },
    { time: 4, timeLabel: '4h', close: 67200 },
    { time: 5, timeLabel: '5h', close: 67350 },
    { time: 6, timeLabel: '6h', close: 67180 },
    { time: 7, timeLabel: '7h', close: 67420 },
    { time: 8, timeLabel: '8h', close: 67380 }
];

const arbitrageOpportunities = [
    {
        pair: 'BTCUSDT',
        buyExchange: 'Kraken',
        sellExchange: 'Coinbase Pro',
        buyPrice: 67350,
        sellPrice: 67420,
        profit: 70,
        profitPercent: 0.104,
        fees: 0.76,
        netProfit: 69.24,
        confidence: 'high'
    }
];

const notifications = [
    { id: 1, text: 'BTC broke resistance $67,000', type: 'success', time: '2 min ago' }
];

const tradingSignals = [
    { type: 'buy', reason: 'RSI approaching oversold levels', price: currentPrice, strength: 'medium' }
];

// Компонент графика
const Chart = () => {
    const { theme } = useAppContext();
    return (
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f1f5f9'} />
                    <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip contentStyle={{ background: theme === 'dark' ? '#1f2937' : 'white', border: 'none', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const DashboardPage = () => {
    const { activeTab, theme, language } = useAppContext();
    const [selectedPair, setSelectedPair] = useState('BTCUSDT');

    // Переводы (позже вынесем в `mocks/translations.js`)
    const t = {
        en: {
            overview: 'Overview',
            balance: 'Balance',
            deposit: 'Deposit',
            withdraw: 'Withdraw',
            tradingSignals: 'Trading Signals',
            notifications: 'Notifications',
            update: 'Update',
            today: 'today',
            buy: 'BUY'
        }
    }[language];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Market Selector */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2 flex-wrap">
                            {TOP_PAIRS.map(pair => (
                                <button
                                    key={pair}
                                    onClick={() => setSelectedPair(pair)}
                                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedPair === pair
                                            ? 'bg-blue-100 text-blue-600 font-semibold'
                                            : theme === 'dark'
                                                ? 'text-gray-300 hover:bg-gray-700'
                                                : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {pair}
                                </button>
                            ))}
                        </div>
                        <Button variant="secondary" size="sm">
                            <RefreshCw className="w-4 h-4" />
                            {t.update}
                        </Button>
                    </div>
                </Card>

                {/* Main Chart */}
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                {selectedPair} - ${currentPrice.toLocaleString()}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="text-green-600">Support: $66,800</span>
                                <span className="text-red-600">Resistance: $67,600</span>
                            </div>
                        </div>
                    </div>
                    <Chart />
                </Card>

                {/* Arbitrage Monitor */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            Live Arbitrage Monitor
                        </h4>
                        <Button variant="secondary" size="sm" onClick={() => setActiveTab('arbitrage')}>
                            View All
                        </Button>
                    </div>
                    <div className="grid gap-3">
                        {arbitrageOpportunities.slice(0, 2).map((opp, index) => (
                            <div key={index} className={`flex justify-between items-center p-3 rounded-lg border ${theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
                                }`}>
                                <div className="flex items-center gap-3">
                                    <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                                        {opp.pair}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {opp.buyExchange} → {opp.sellExchange}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-600">
                                        +{opp.profitPercent.toFixed(2)}%
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        ${opp.netProfit.toFixed(2)} profit
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Quick Actions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button variant="success" className="flex-col h-20" onClick={() => setActiveTab('arbitrage')}>
                            <TrendingUp className="w-6 h-6 mb-1" />
                            Find Arbitrage
                        </Button>
                        <Button variant="primary" className="flex-col h-20" onClick={() => setActiveTab('copytrading')}>
                            <BarChart3 className="w-6 h-6 mb-1" />
                            Copy Traders
                        </Button>
                        <Button variant="warning" className="flex-col h-20">
                            <Activity className="w-6 h-6 mb-1" />
                            Set Alert
                        </Button>
                        <Button variant="secondary" className="flex-col h-20">
                            <BarChart3 className="w-6 h-6 mb-1" />
                            Analyze
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Balance */}
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.balance}</h3>
                        <Wallet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="mb-6">
                        <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                            ${balance.toLocaleString()}
                        </div>
                        <div className="text-green-600 text-sm flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            +12.5% {t.today}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="success" className="flex-1">
                            <Plus className="w-4 h-4" />
                            {t.deposit}
                        </Button>
                        <Button variant="secondary" className="flex-1">
                            <Minus className="w-4 h-4" />
                            {t.withdraw}
                        </Button>
                    </div>
                </Card>

                {/* Trading Signals */}
                <Card>
                    <h4 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        🟢 {t.tradingSignals} (1)
                    </h4>
                    <div className="space-y-3">
                        {tradingSignals.map((signal, index) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 bg-green-50 border-green-400 ${theme === 'dark' ? 'bg-green-900/20' : ''}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm text-green-700">
                                        🟢 {t.buy}
                                    </span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                        Medium
                                    </span>
                                </div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{signal.reason}</div>
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>${signal.price.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Notifications */}
                <Card>
                    <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{t.notifications}</h4>
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <div key={notif.id} className={`p-3 rounded-lg border-l-4 ${notif.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-yellow-50 border-yellow-400'
                                } ${theme === 'dark' && notif.type === 'success' ? 'bg-green-900/20' : ''} 
                ${theme === 'dark' && notif.type === 'warning' ? 'bg-yellow-900/20' : ''}`}>
                                <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>{notif.text}</div>
                                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{notif.time}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;