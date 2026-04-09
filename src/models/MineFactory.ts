import { Horizon } from './Horizon';
import { Excavation } from './Excavation';
import { Section } from './Section';
import { Node } from './Node';

export class MineFactory {
  static createTestData(): Horizon[] {
    const horizons: Horizon[] = [];
    
    const horizon1 = new Horizon('H1', 'guid-h1', 'Горизонт -100м', -100);
    
    const node1 = new Node('N1', 'guid-n1', 0, -100, 0);
    const node2 = new Node('N2', 'guid-n2', 5, -100, 0);
    const node3 = new Node('N3', 'guid-n3', 10, -100, 2);
    const node4 = new Node('N4', 'guid-n4', 10, -102, 2);
    const node5 = new Node('N5', 'guid-n5', 5, -102, 4);
    
    const section1 = new Section('S1', 'guid-s1', node1, node2, 4);
    const section2 = new Section('S2', 'guid-s2', node2, node3, 4);
    const section3 = new Section('S3', 'guid-s3', node3, node4, 4);
    const section4 = new Section('S4', 'guid-s4', node4, node5, 4);
    
    const excavation1 = new Excavation('E1', 'guid-e1', 'Штрек №1', 'obj1', 'Excavation');
    excavation1.addSection(section1);
    excavation1.addSection(section2);
    
    const excavation2 = new Excavation('E2', 'guid-e2', 'Вентиляционный штрек', 'obj2', 'Excavation');
    excavation2.addSection(section3);
    excavation2.addSection(section4);
    
    horizon1.addExcavation(excavation1);
    horizon1.addExcavation(excavation2);
    
    horizons.push(horizon1);
    
    return horizons;
  }
  
  static logStatistics(horizons: Horizon[]): void {
    console.log('=== СТАТИСТИКА ШАХТЫ ===');
    horizons.forEach(horizon => {
      console.log(horizon.getInfo());
      horizon.excavations.forEach(excavation => {
        console.log(`  - ${excavation.getInfo()}`);
      });
    });
    console.log('========================');
  }
}