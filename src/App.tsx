import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { MineScene } from './components/canvas/MineScene';
import { Menu } from './components/UI/Menu';
import { MineStore } from './stores/MineStore';
import './App.css';

const store = new MineStore();

const App: React.FC = observer(() => {
  useEffect(() => {
    store.loadMineData();
  }, []);

  return (
    <div className="app">
      <Menu store={store} />
      <MineScene store={store} />
      {!store.loading && !store.error && (
        <div className="info-panel">
          <div className="info-item">
            <span className="info-label">🏔️ Горизонтов:</span>
            <span className="info-value">{store.horizons.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🛤️ Выработок:</span>
            <span className="info-value">{store.getTotalStats().totalExcavations}</span>
          </div>
          <div className="info-item">
            <span className="info-label">🔗 Секций:</span>
            <span className="info-value">{store.getTotalStats().totalSections}</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default App;