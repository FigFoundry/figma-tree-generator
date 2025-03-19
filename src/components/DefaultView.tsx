import React, { useState, useRef, useEffect } from 'react';
import { UIMessage, PluginMessage } from '../types/messages';
import '../styles/base.scss';

const DefaultView: React.FC = () => {
  const [treeString, setTreeString] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [maxDepth, setMaxDepth] = useState<number>(-1); // -1 means no limit
  const [showTypes, setShowTypes] = useState<boolean>(false); // New state for showing types
  const [showDepthOptions, setShowDepthOptions] = useState<boolean>(false);
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
      showTypes: showTypes // Pass the showTypes state
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

  const handleMaxDepthChange = (value: number) => {
    setMaxDepth(value);
    setShowDepthOptions(false);
  };

  // Get the display text for the current depth setting
  const getDepthDisplayText = () => {
    if (maxDepth === -1) return "All levels";
    if (maxDepth === 0) return "Top level only";
    return `Up to ${maxDepth} ${maxDepth === 1 ? 'level' : 'levels'}`;
  };

  return (
    <div className="default-view">
      <div className="content">        
        <div className="options">
          <div className="depth-selector">
            <label>Nesting depth:</label>
            <div className="dropdown">
              <button 
                className="dropdown-toggle" 
                onClick={() => setShowDepthOptions(!showDepthOptions)}
              >
                {getDepthDisplayText()}
                <span className="arrow-down">▼</span>
              </button>
              
              {showDepthOptions && (
                <div className="dropdown-menu">
                  <button onClick={() => handleMaxDepthChange(-1)}>All levels</button>
                  <button onClick={() => handleMaxDepthChange(0)}>Top level only</button>
                  <button onClick={() => handleMaxDepthChange(1)}>Up to 1 level</button>
                  <button onClick={() => handleMaxDepthChange(2)}>Up to 2 levels</button>
                  <button onClick={() => handleMaxDepthChange(3)}>Up to 3 levels</button>
                  <button onClick={() => handleMaxDepthChange(4)}>Up to 4 levels</button>
                  <button onClick={() => handleMaxDepthChange(5)}>Up to 5 levels</button>
                </div>
              )}
            </div>
          </div>
          
          {/* New checkbox for showing types */}
          <div className="type-selector">
            <label>
              <input 
                type="checkbox" 
                checked={showTypes} 
                onChange={(e) => setShowTypes(e.target.checked)}
              />
              Show layer types
            </label>
          </div>
        </div>
        
        <button 
          className="generate-button"
          onClick={handleGenerateClick}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Tree'}
        </button>
        
        {treeString && (
          <div className="tree-result">
            <div className="tree-header">
              <h3>Tree String</h3>
              <button 
                className="copy-button"
                onClick={handleCopyClick}
                disabled={!treeString}
              >
                {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <div className="tree-content">
              <textarea 
                ref={textareaRef}
                readOnly
                value={treeString}
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultView;