import React from 'react';
import './BlockchainExplorer.css';

const getBlockType = (block) => {
    if (block.index === 0) return 'genesis';
    const type = block.transactions[0]?.type || 'unknown';
    if (type.includes('delete')) return 'delete';
    if (type.includes('update')) return 'update';
    if (type.includes('attendance')) return 'attendance';
    return 'data';
};

const BlockchainExplorer = ({ chain }) => {
    if (!chain || chain.length === 0) {
        return (
            <div className="text-gray-400 text-center py-8">
                <div className="animate-pulse">No chain data to display.</div>
            </div>
        );
    }

    const typeColors = {
        genesis: 'from-purple-500/20 to-pink-500/20 border-purple-500/40',
        attendance: 'from-blue-500/20 to-cyan-500/20 border-blue-500/40',
        update: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
        delete: 'from-red-500/20 to-rose-500/20 border-red-500/40',
        data: 'from-green-500/20 to-emerald-500/20 border-green-500/40'
    };

    const typeGlow = {
        genesis: 'shadow-purple-500/50',
        attendance: 'shadow-blue-500/50',
        update: 'shadow-amber-500/50',
        delete: 'shadow-red-500/50',
        data: 'shadow-green-500/50'
    };

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 p-4">
                {chain.map((block, i) => {
                    const blockType = getBlockType(block);
                    return (
                        <div key={block.hash} className="relative">
                            {i > 0 && (
                                <div className="flex items-center justify-center my-2">
                                    <div className="h-8 w-0.5 bg-gradient-to-b from-cyan-500/50 to-blue-500/50 relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500" />
                                    </div>
                                </div>
                            )}
                            <div
                                className={`relative bg-gradient-to-br ${typeColors[blockType]} backdrop-blur-xl border rounded-xl p-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${typeGlow[blockType]} group overflow-hidden`}
                            >
                                {/* Animated background gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Glowing corner accent */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent blur-2xl rounded-full transform translate-x-8 -translate-y-8" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${blockType === 'genesis' ? 'bg-purple-400' : blockType === 'attendance' ? 'bg-blue-400' : blockType === 'update' ? 'bg-amber-400' : blockType === 'delete' ? 'bg-red-400' : 'bg-green-400'} animate-pulse`} />
                                            <span className="text-white font-bold text-lg">Block #{block.index}</span>
                                        </div>
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-cyan-400 border border-cyan-500/30">
                                            {blockType.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                                            <span className="text-gray-400 font-medium">Timestamp</span>
                                            <span className="text-gray-200">{new Date(block.timestamp).toLocaleString()}</span>
                                        </div>

                                        <div className="p-2 bg-black/20 rounded-lg">
                                            <span className="text-gray-400 font-medium block mb-1">Hash</span>
                                            <span className="text-cyan-400 font-mono text-xs break-all">{block.hash}</span>
                                        </div>

                                        <div className="p-2 bg-black/20 rounded-lg">
                                            <span className="text-gray-400 font-medium block mb-1">Previous Hash</span>
                                            <span className="text-blue-400 font-mono text-xs break-all">{block.prev_hash}</span>
                                        </div>

                                        <div className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                                            <span className="text-gray-400 font-medium">Nonce</span>
                                            <span className="text-gray-200 font-mono">{block.nonce}</span>
                                        </div>

                                        <div className="p-2 bg-black/20 rounded-lg">
                                            <span className="text-gray-400 font-medium block mb-2">Transactions</span>
                                            <pre className="text-xs text-gray-300 overflow-x-auto p-2 bg-black/30 rounded border border-white/5">
                                                {JSON.stringify(block.transactions, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default BlockchainExplorer;