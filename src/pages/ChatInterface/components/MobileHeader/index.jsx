import React, { useEffect, useRef } from 'react';

import { FaSyncAlt, FaAlignLeft, FaAngleDown } from 'react-icons/fa';

const MobileHeader = ({
  modelName,
  onRefresh,
  modelList,
  selectedModel,
  onSelectModel,
  activeDropdown,
  setActiveDropdown
}) => {
  const dropdownRef = useRef(null);
  const modelToggleRef = useRef(null);
  const menuIconRef = useRef(null);
  const toggleModelDropdown = () => {
    setActiveDropdown(activeDropdown === 'model' ? null : 'model');
  };
  const toggleMenu = () => {
    setActiveDropdown(activeDropdown === 'menu' ? null : 'menu');
  };

  const handleSelect = (model) => {
    onSelectModel(model);
    setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutsideModel = 
        activeDropdown === 'model' && 
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        !modelToggleRef.current.contains(event.target);

      const clickedOutsideMenu = 
        activeDropdown === 'menu' && 
        !menuIconRef.current.contains(event.target);

      if (clickedOutsideModel || clickedOutsideMenu) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  return (
    <div className="chat-mobile-header">
      <FaAlignLeft
        ref={menuIconRef}
        className={`icon-button ${activeDropdown === 'menu' ? 'active' : ''}`}
        onClick={toggleMenu}
      />
      
      <div 
        className={`model-toggle ${activeDropdown === 'model' ? 'active' : ''}`} 
        onClick={toggleModelDropdown} 
        ref={modelToggleRef}
      >
        <span>{modelName}</span>
        <span className="arrow">▾</span>
      </div>
      
      <FaSyncAlt className="icon-button" onClick={onRefresh} />
      
      {activeDropdown === 'model' && (
        <div className="model-dropdown-box" ref={dropdownRef}>
          <div className="model-dropdown-header">Models</div>
          {modelList.map((model) => (
            <div
              key={model.id}
              className={`model-dropdown-item ${
                model.name === selectedModel ? 'selected' : ''
              }`}
              onClick={() => handleSelect(model)}
            >
              <div className="model-description">{model.name}</div>
            </div>
          ))}
          <div className="model-dropdown-footer">Other models &gt;</div>
        </div>
      )}
    </div>
  );
};

export default MobileHeader;