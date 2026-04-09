import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { MineStore } from '../../stores/MineStore';
import { Horizon } from '../../models/Horizon';
import './Menu.css';

interface MenuProps {
  store: MineStore;
}

export const Menu: React.FC<MenuProps> = observer(({ store }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedHorizons, setExpandedHorizons] = useState<Set<string>>(new Set());
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const toggleHorizon = (horizonId: string) => {
    const newExpanded = new Set(expandedHorizons);
    if (newExpanded.has(horizonId)) {
      newExpanded.delete(horizonId);
    } else {
      newExpanded.add(horizonId);
    }
    setExpandedHorizons(newExpanded);
  };
  
  const stats = store.getTotalStats();
  
  return (
    <>
      <button className={`menu-toggle ${isOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div className={`menu-overlay ${isOpen ? 'visible' : ''}`} onClick={toggleMenu} />
      
      <div className={`menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>⛏️ Шахта</h2>
          <div className="menu-stats">
            <span>📊 {store.horizons.length} горизонтов</span>
            <span>🛤️ {stats.totalExcavations} выработок</span>
          </div>
        </div>
        
        <div className="menu-content">
          {store.horizons.map((horizon: Horizon) => (
            <div key={horizon.id} className="horizon-group">
              <div 
                className="horizon-header"
                onClick={() => toggleHorizon(horizon.id)}
              >
                <span className="expand-icon">
                  {expandedHorizons.has(horizon.id) ? '▼' : '▶'}
                </span>
                <span className="horizon-name">
                  {horizon.name}
                </span>
                <span className="horizon-altitude">
                  {horizon.altitude}м
                </span>
                <label className="horizon-visibility" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={horizon.visible}
                    onChange={() => store.toggleHorizonVisibility(horizon)}
                    className="horizon-checkbox"
                  />
                  <span className="horizon-visibility-label">
                    {horizon.visible ? '👁️' : '👁️‍🗨️'}
                  </span>
                </label>
              </div>
              
              {expandedHorizons.has(horizon.id) && (
                <div className="excavations-list">
                  {horizon.excavations.map((excavation) => (
                    <div key={excavation.id} className="excavation-item">
                      <label className="excavation-label">
                        <input
                          type="checkbox"
                          checked={excavation.visible}
                          onChange={() => store.toggleExcavation(excavation)}
                          className="excavation-checkbox"
                          disabled={!horizon.visible}
                        />
                        <span className="excavation-name">
                          {excavation.name || `Выработка ${excavation.id}`}
                        </span>
                        <span className="excavation-length">
                          {excavation.getTotalLength().toFixed(0)}м
                        </span>
                      </label>
                    </div>
                  ))}
                  {horizon.excavations.length === 0 && (
                    <div className="no-excavations">Нет выработок</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="menu-footer">
          <div className="legend">
            <div className="legend-item">
              <span className="legend-color tunnel"></span>
              <span>Туннель</span>
            </div>
            <div className="legend-item">
              <span className="legend-color node"></span>
              <span>Узел</span>
            </div>
          </div>
          <div className="total-info">
            Всего секций: {stats.totalSections}
          </div>
        </div>
      </div>
    </>
  );
});