import React, { useState, useRef, useEffect } from 'react';
import { UIMessage, PluginMessage } from '../types/messages';
import '../styles/base.scss';

const DefaultView: React.FC = () => {
  const [treeString, setTreeString] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [maxDepth, setMaxDepth] = useState<number>(-1); // -1 means no limit
  const [showTypes, setShowTypes] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Listen for messages from the plugin
    window.onmessage = (event) => {
      const message = event.data.pluginMessage as PluginMessage;
      
      if (message.type === 'layers-tree-result') {
        setTreeString(message.tree);
        setIsLoading(false);
      }
    };
  }, []);

  const handleGenerateClick = () => {
    setIsLoading(true);
    setTreeString('');
    setCopySuccess(false);
    
    // Send message to the plugin
    const message: UIMessage = {
      type: 'generate-layers-tree',
      maxDepth: maxDepth,
      showTypes: showTypes
    };
    
    parent.postMessage({ pluginMessage: message }, '*');
  };

  const handleCopyClick = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleMaxDepthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMaxDepth(parseInt(e.target.value, 10));
  };

  return (
    <div className="default-view">
      <section className="plugin-header">
        <div className="form-controls">
          <div className="depth-selector">
            <select 
              id="depth-select"
              value={maxDepth}
              onChange={handleMaxDepthChange}
              className="depth-select"
            >
              <option value="-1">All levels</option>
              <option value="1">Up to 1 level</option>
              <option value="2">Up to 2 levels</option>
              <option value="3">Up to 3 levels</option>
              <option value="4">Up to 4 levels</option>
              <option value="5">Up to 5 levels</option>
            </select>
          </div>
          
          <div className="type-selector">
            <label>
              <input 
                type="checkbox" 
                checked={showTypes} 
                onChange={(e) => setShowTypes(e.target.checked)}
                id="show-types"
              />
              Types
            </label>
          </div>
          
          <button 
            className="generate-button"
            onClick={handleGenerateClick}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </section>
      
      <section className="result-section">
        <div className="tree-content">
          {treeString ? (
            <>
              <button 
                className="copy-button"
                onClick={handleCopyClick}
              >
                {copySuccess ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="green" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
              <textarea 
                ref={textareaRef}
                readOnly
                value={treeString}
                spellCheck={false}
              />
            </>
          ) : (
            <div className="empty-state">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="empty-icon"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
              <p className="empty-message">
                Click "Generate" to view the layer tree of your Figma design
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DefaultView;