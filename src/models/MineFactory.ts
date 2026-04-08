import { Horizon } from './Horizon';
import { Excavation } from './Excavation';
import { Section } from './Section';
import { Node } from './Node';

export class MineFactory {
  // Создание тестовых данных для демонстрации
  static createTestData(): Horizon[] {
    const horizons: Horizon[] = [];
    
    // Создаем горизонт -100м
    const horizon1 = new Horizon('H1', 'Горизонт 1м', 1);
    
    // Создаем узлы для первого горизонта
    const node1 = new Node('N1', 0, 1, 0);
    const node2 = new Node('N2', 5, 1, 0);
    const node3 = new Node('N3', 10, 1, 2);
    const node4 = new Node('N4', 10, -1, 2);
    const node5 = new Node('N5', 5, -1, 4);
    
    // Создаем секции
    const section1 = new Section('S1', node1, node2);
    const section2 = new Section('S2', node2, node3);
    const section3 = new Section('S3', node3, node4);
    const section4 = new Section('S4', node4, node5);
    
    // Создаем выработку 1
    const excavation1 = new Excavation('E1', 'Штрек №1');
    excavation1.addSection(section1);
    excavation1.addSection(section2);
    
    // Создаем выработку 2
    const excavation2 = new Excavation('E2', 'Вентиляционный штрек');
    excavation2.addSection(section3);
    excavation2.addSection(section4);
    
    // Добавляем выработки на горизонт
    horizon1.addExcavation(excavation1);
    horizon1.addExcavation(excavation2);
    
    // Создаем горизонт -200м
    const horizon2 = new Horizon('H2', 'Горизонт -10м', -10);
    
    const node6 = new Node('N6', 0, -10, 0);
    const node7 = new Node('N7', 8, -10, 0);
    const node8 = new Node('N8', 8, -10, 6);
    const node9 = new Node('N9', 3, -10, 6);
    
    const section5 = new Section('S5', node6, node7);
    const section6 = new Section('S6', node7, node8);
    const section7 = new Section('S7', node8, node9);
    
    const excavation3 = new Excavation('E3', 'Главный штрек');
    excavation3.addSection(section5);
    excavation3.addSection(section6);
    excavation3.addSection(section7);
    
    horizon2.addExcavation(excavation3);
    
    horizons.push(horizon1, horizon2);
    
    return horizons;
  }
  
  // Метод для вывода статистики в консоль
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