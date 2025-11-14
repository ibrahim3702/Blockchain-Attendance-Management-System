import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './HierarchyExplorer.css';

// A recursive component to render each node and its children
const TreeNode = ({ node }) => {
    const [isOpen, setIsOpen] = useState(true); // Default to open

    let icon = '📄'; // Default
    let link = null;

    if (node.type === 'department') {
        icon = '🏢'; // Building
    } else if (node.type === 'class') {
        icon = '🏫'; // School
    } else if (node.type === 'student') {
        icon = '🎓'; // Graduate
        link = `/student-ledger/${node.chainId}`;
    }

    return (
        <li className="tree-node">
            <div className={`tree-node-content ${node.type}`}>
                <span className="node-icon">{icon}</span>
                <div className="node-details">
                    <strong>{node.name}</strong>
                    <span>{node.rollNo ? `Roll: ${node.rollNo}` : `Chain: ${node.chainId.substring(0, 15)}...`}</span>
                </div>
                {/* Add a link for students */}
                {link && (
                    <Link to={link}>
                        <button className="secondary" style={{ padding: '5px 10px' }}>
                            View Ledger
                        </button>
                    </Link>
                )}
                {/* Add toggle button if there are children */}
                {node.children && node.children.length > 0 && (
                    <button onClick={() => setIsOpen(!isOpen)} style={{ padding: '5px 10px' }}>
                        {isOpen ? 'Collapse' : 'Expand'}
                    </button>
                )}
            </div>

            {/* Render children recursively if open and children exist */}
            {isOpen && node.children && node.children.length > 0 && (
                <ul>
                    {node.children.map(childNode => (
                        <TreeNode key={childNode.id} node={childNode} />
                    ))}
                </ul>
            )}
        </li>
    );
};

// The main component to fetch data
const HierarchyExplorer = () => {
    const [treeData, setTreeData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTree = async () => {
            try {
                const res = await api.getHierarchyTree();
                setTreeData(res.data);
            } catch (err) {
                setError('Failed to load blockchain hierarchy');
            }
            setIsLoading(false);
        };
        fetchTree();
    }, []);

    return (
        <div className="hierarchy-explorer">
            <h2>Blockchain Hierarchy Explorer</h2>
            {isLoading && <p>Loading hierarchy...</p>}
            {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}
            {!isLoading && !error && (
                <ul className="hierarchy-tree">
                    {treeData.length > 0 ? (
                        treeData.map(node => (
                            <TreeNode key={node.id} node={node} />
                        ))
                    ) : (
                        <p>No active departments found. Seed the database or add a department.</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default HierarchyExplorer;