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

const BlockchainExplorer = ({ chain, validationStatus = {} }) => {
    if (!chain || chain.length === 0) {
        return <p>No chain data to display.</p>;
    }

    return (
        <div className="blockchain-explorer">
            <h3>Blockchain Ledger</h3>
            <div className="chain-container">
                {chain.map((block, i) => {
                    const blockType = getBlockType(block);
                    const blockValidation = validationStatus.blocks ? validationStatus.blocks[i] : { valid: true };

                    return (
                        <React.Fragment key={block.hash}>
                            {i > 0 && <div className="chain-link">➔</div>}
                            <div
                                className={`block-card ${blockType} ${blockValidation.valid ? 'valid' : 'invalid'}`}
                                title={`Block Type: ${blockType}`}
                            >
                                <div className="block-header">
                                    <strong>Block #{block.index}</strong>
                                    <span className={`status ${blockValidation.valid ? 'valid' : 'invalid'}`}>
                                        {blockValidation.valid ? '✔ Valid' : `✖ ${blockValidation.reason || 'Invalid'}`}
                                    </span>
                                </div>
                                <div className="block-body">
                                    <div className="block-field">
                                        <label>Timestamp:</label>
                                        <span>{new Date(block.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="block-field">
                                        <label>Hash:</label>
                                        <span className="hash-text">{block.hash}</span>
                                    </div>
                                    <div className="block-field">
                                        <label>Prev. Hash:</label>
                                        <span className="hash-text">{block.prev_hash}</span>
                                    </div>
                                    <div className="block-field">
                                        <label>Nonce:</label>
                                        <span>{block.nonce}</span>
                                    </div>
                                    <div className="block-field transactions">
                                        <label>Transactions:</label>
                                        <pre>{JSON.stringify(block.transactions, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BlockchainExplorer;