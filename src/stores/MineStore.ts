import { makeAutoObservable } from 'mobx';
import { Horizon } from '../models/Horizon';
import { Excavation } from '../models/Excavation';
import { XmlParser } from '../services/XmlParser';

export class MineStore {
  horizons: Horizon[] = [];
  loading: boolean = false;
  error: string | null = null;
  
  constructor() {
    makeAutoObservable(this);
  }
  
  async loadMineData() {
    this.loading = true;
    this.error = null;
    
    try {
      const data = await XmlParser.parseXmlFile('/MIM_Scheme.xml');
      this.horizons = data;
      console.log('Данные загружены:', this.horizons.length, 'горизонтов');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Ошибка загрузки';
      console.error(this.error);
    } finally {
      this.loading = false;
    }
  }
  
  toggleExcavation(excavation: Excavation) {
    excavation.toggleVisibility();
  }
  
  toggleHorizonVisibility(horizon: Horizon) {
    horizon.toggleVisibility();
  }
  
  get allExcavations(): Excavation[] {
    return this.horizons.flatMap(h => h.excavations);
  }
  
  getTotalStats() {
    const totalExcavations = this.allExcavations.length;
    const totalSections = this.allExcavations.reduce((sum, e) => sum + e.sections.length, 0);
    const totalLength = this.allExcavations.reduce((sum, e) => sum + e.getTotalLength(), 0);
    return { totalExcavations, totalSections, totalLength };
  }
}