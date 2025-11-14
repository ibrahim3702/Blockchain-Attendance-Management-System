import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import api from '../services/api';
import BlockchainExplorer from './BlockchainExplorer'; // Reuse your existing explorer
import './Blockchain3D.css';

const Blockchain3D = () => {
    const fgRef = useRef();
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedChainData, setSelectedChainData] = useState(null);
    const [isLoadingChain, setIsLoadingChain] = useState(false);

    // 1. Fetch and Flatten Data
    useEffect(() => {
        api.getHierarchyTree().then((res) => {
            const tree = res.data;
            const nodes = [];
            const links = [];

            // Recursive function to flatten the tree
            const processNode = (item, parentId, level) => {
                // Add Node
                nodes.push({
                    id: item.id,
                    name: item.name,
                    type: item.type,
                    chainId: item.chainId,
                    level: level,
                    val: level === 1 ? 20 : level === 2 ? 10 : 5 // Size weight
                });

                // Add Link to Parent
                if (parentId) {
                    links.push({
                        source: parentId,
                        target: item.id
                    });
                }

                // Process Children
                if (item.children) {
                    item.children.forEach(child => processNode(child, item.id, level + 1));
                }
            };

            tree.forEach(dept => processNode(dept, null, 1));
            setGraphData({ nodes, links });
        });
    }, []);

    // 2. Handle Node Click (Fetch specific chain)
    const handleNodeClick = useCallback(async (node) => {
        setSelectedNode(node);
        setSelectedChainData(null);
        setIsLoadingChain(true);

        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        fgRef.current?.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node,
            3000
        );

        try {
            let res;
            if (node.type === 'department') res = await mockApi.getDeptChain(node.chainId);
            else if (node.type === 'class') res = await mockApi.getClassChain(node.chainId);
            else if (node.type === 'student') res = await mockApi.getStudentChain(node.chainId);

            setSelectedChainData(res.data);
        } catch (err) {
            console.error(err);
        }
        setIsLoadingChain(false);
    }, []);

    const nodeThreeObject = useCallback((node) => {
        const colorMap = {
            department: '#dc3545',
            class: '#ffc107',
            student: '#28a745'
        };

        const sizeMap = {
            department: 10,
            class: 6,
            student: 3
        };

        const color = colorMap[node.type];
        const size = sizeMap[node.type];

        // Create glowing cube with edges
        const group = new THREE.Group();

        // Main cube with glow
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color,
            transparent: true,
            opacity: 0.85,
            emissive: color,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);

        // Wireframe overlay
        const wireframe = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
        const wireframeMesh = new THREE.LineSegments(wireframe, lineMaterial);
        group.add(wireframeMesh);

        // Pulsing glow sphere
        const glowGeometry = new THREE.SphereGeometry(size * 0.7, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);

        return group;
    }, []);

    const nodeLabel = useCallback((node) => {
        const typeEmoji = {
            department: '🏛️',
            class: '📚',
            student: '👤'
        };
        return `${typeEmoji[node.type]} ${node.name}`;
    }, []);

    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
            {/* Animated background stars */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            opacity: Math.random() * 0.5 + 0.3
                        }}
                    />
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm border-b border-white/10">
                <div className="p-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Blockchain Network Visualization
                    </h1>
                    <p className="text-gray-400 mt-2">Interactive 3D hierarchy explorer</p>
                </div>
            </div>

            {/* 3D Graph */}
            <div className="w-full h-full">
                <ForceGraph3D
                    ref={fgRef}
                    graphData={graphData}
                    nodeLabel={nodeLabel}
                    nodeThreeObject={nodeThreeObject}
                    onNodeClick={handleNodeClick}
                    linkDirectionalArrowLength={3.5}
                    linkDirectionalArrowRelPos={1}
                    linkColor={() => 'rgba(100, 200, 255, 0.4)'}
                    linkWidth={1.5}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={0.005}
                    linkDirectionalParticleWidth={2}
                    linkDirectionalParticleColor={() => '#60a5fa'}
                    backgroundColor="rgba(0,0,0,0)"
                    showNavInfo={false}
                />
            </div>

            {/* Sidebar */}
            {selectedNode && (
                <div className="absolute top-0 right-0 w-[450px] h-full bg-gradient-to-l from-black/95 via-gray-900/95 to-transparent backdrop-blur-xl border-l border-white/10 z-30 animate-in slide-in-from-right duration-300">
                    {/* Sidebar Header */}
                    <div className="relative border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10" />
                        <div className="relative p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wider">
                                        {selectedNode.type}
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {selectedNode.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-400">Chain ID:</span>
                                        <span className="text-cyan-400 font-mono">{selectedNode.chainId}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedNode(null)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                                >
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="h-[calc(100%-140px)] overflow-y-auto">
                        {isLoadingChain && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-400">Loading blockchain data...</p>
                                </div>
                            </div>
                        )}

                        {!isLoadingChain && selectedChainData && (
                            <div className="p-4">
                                <div className="mb-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/20">
                                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="font-semibold">Blockchain Ledger</span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {selectedChainData.length} blocks in chain
                                    </p>
                                </div>
                                <BlockchainExplorer chain={selectedChainData} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Instructions overlay */}
            {!selectedNode && (
                <div className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 max-w-sm z-20">
                    <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        How to Explore
                    </h4>
                    <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-cyan-400 mt-0.5">🏛️</span>
                            <span><strong className="text-white">Red cubes:</strong> Departments</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">📚</span>
                            <span><strong className="text-white">Yellow cubes:</strong> Classes</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">👤</span>
                            <span><strong className="text-white">Green cubes:</strong> Students</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">→</span>
                            <span>Click any node to view its blockchain</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Blockchain3D;