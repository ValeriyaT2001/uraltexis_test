import { MineFactory } from './models/MineFactory';
import { Horizon } from './models/Horizon';

// Тестирование классов
const testModels = () => {
  console.log('Создание тестовых данных...');
  const horizons = MineFactory.createTestData();
  
  console.log(`Создано ${horizons.length} горизонтов`);
  
  // Проверка работы методов
  const firstHorizon = horizons[0];
  console.log(`Первый горизонт: ${firstHorizon.getInfo()}`);
  
  const firstExcavation = firstHorizon.excavations[0];
  console.log(`Первая выработка: ${firstExcavation.getInfo()}`);
  
  // Проверка переключения видимости
  console.log(`Видимость выработки до: ${firstExcavation.visible}`);
  firstExcavation.toggleVisibility();
  console.log(`Видимость выработки после: ${firstExcavation.visible}`);
  
  // Вывод полной статистики
  MineFactory.logStatistics(horizons);
  
  return horizons;
};

export default testModels;