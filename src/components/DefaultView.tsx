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
      <section className="options-section">
        <div className="form-controls">
          <div className="depth-selector">
            <label htmlFor="depth-select"></label>
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
      
      {treeString && (
        <section className="result-section">
          <div className="tree-result">
            <div className="tree-header">
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
        </section>
      )}
    </div>
  );
};

export default DefaultView;