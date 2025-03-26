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
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M39.219 9.015C40.919 7.182 43.384 6 46.084 6c.704 0 1.408.118 2.054.235.293.06.47.296.47.591v1.42c0 1.36-1.116 2.481-2.583 2.481-2.228 0-4.108 1.595-4.576 3.723-.119.591-.587 1.005-1.173 1.005h-2.23c-.587 0-1.057-.414-1.174-1.005-.41-2.128-2.348-3.723-4.578-3.723-1.35 0-2.464-1.122-2.464-2.481v-1.42c0-.295.234-.53.47-.59.644-.118 1.348-.236 2.054-.236 2.698 0 5.162 1.182 6.865 3.015Zm-18.955 6.44c-2.7 0-5.165 1.181-6.866 3.014-1.703-1.833-4.167-3.015-6.865-3.015-.706 0-1.41.118-2.054.236-.236.06-.47.295-.47.59v1.42c0 1.36 1.114 2.482 2.464 2.482 2.23 0 4.168 1.595 4.578 3.723.117.59.587 1.004 1.174 1.004h2.23c.587 0 1.054-.413 1.174-1.004.467-2.129 2.347-3.724 4.575-3.724 1.35 0 2.466-1.121 2.466-2.48v-1.42c0-.296-.176-.531-.47-.591a9.199 9.199 0 0 0-1.936-.236ZM32.06 29.635c-14.73 0-26.76 11.345-28.051 25.883A2.273 2.273 0 0 0 6.297 58h.06c1.23 0 2.17-.946 2.287-2.128C9.7 43.818 19.794 34.364 32 34.364c12.207 0 22.3 9.454 23.356 21.508C55.473 57.054 56.47 58 57.644 58h.06c1.35 0 2.404-1.182 2.287-2.481C58.877 40.98 46.788 29.636 32.06 29.636Zm0 9.454c-9.449 0-17.312 7.091-18.604 16.25-.174 1.418.88 2.66 2.29 2.66h.057c1.116 0 2.113-.827 2.29-1.95.938-6.914 6.806-12.232 13.967-12.232 7.159 0 13.027 5.318 13.965 12.231.176 1.124 1.173 1.95 2.29 1.95h.057c1.41 0 2.466-1.241 2.29-2.659-1.29-9.159-9.096-16.25-18.602-16.25Zm-8.922 16.015c1.233-3.84 4.754-6.56 8.922-6.56 4.165 0 7.745 2.719 8.918 6.56.47 1.417-.586 2.895-2.113 2.895h-.294c-.997 0-1.76-.651-2.11-1.596-.647-1.832-2.408-3.132-4.402-3.132-1.996 0-3.757 1.3-4.401 3.133-.353.944-1.116 1.594-2.113 1.594h-.294c-1.527 0-2.58-1.477-2.113-2.894Z" clip-rule="evenodd"/></svg>
              <p className="empty-message">
              Click 'Generate' to generate a tree structure from the selected page, component, frame, or group.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DefaultView;