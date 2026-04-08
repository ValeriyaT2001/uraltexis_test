import { Horizon } from '../models/Horizon';
import { Excavation } from '../models/Excavation';
import { Section } from '../models/Section';
import { Node } from '../models/Node';

export class XmlParser {
  private static nodesMap: Map<string, Node> = new Map();
  private static sectionsMap: Map<string, Section> = new Map();
  
  static async parseXmlFile(filePath: string): Promise<Horizon[]> {
    try {
      console.log('Начинаем загрузку XML файла...');
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      console.log('Декодируем windows-1251 с помощью TextDecoder...');
      const decodedText = this.decodeWindows1251(arrayBuffer);
      
      console.log('Парсим XML...');
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(decodedText, 'text/xml');
      
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Ошибка парсинга XML: ' + parserError.textContent);
      }
      
      // Очищаем карты перед парсингом
      this.nodesMap.clear();
      this.sectionsMap.clear();
      
      // Парсим все узлы
      console.log('Парсим узлы...');
      this.parseNodes(xmlDoc);
      
      // Парсим все секции
      console.log('Парсим секции...');
      this.parseSections(xmlDoc);
      
      // Парсим все выработки
      console.log('Парсим выработки...');
      const excavations = this.parseExcavations(xmlDoc);
      
      // Парсим горизонты
      console.log('Парсим горизонты...');
      const horizons = this.parseHorizons(xmlDoc, excavations);
      
      console.log(`Парсинг завершен. Загружено: ${this.nodesMap.size} узлов, ${this.sectionsMap.size} секций, ${excavations.size} выработок, ${horizons.length} горизонтов`);
      
      return horizons;
    } catch (error) {
      console.error('Ошибка при парсинге XML:', error);
      throw error;
    }
  }
  
  private static decodeWindows1251(arrayBuffer: ArrayBuffer): string {
    // Используем TextDecoder для декодирования windows-1251
    // TextDecoder поддерживает windows-1251 во всех современных браузерах
    const decoder = new TextDecoder('windows-1251');
    const decoded = decoder.decode(arrayBuffer);
    
    console.log('Декодирование через TextDecoder выполнено успешно');
    
    // Небольшая проверка: если есть символы '�', значит что-то пошло не так
    if (decoded.includes('�')) {
      console.warn('Обнаружены некорректные символы в декодированном тексте');
    }
    
    return decoded;
  }
  
  // Парсинг всех узлов
  private static parseNodes(xmlDoc: Document): void {
    const nodesElement = xmlDoc.getElementsByTagName('Nodes')[0];
    if (!nodesElement) {
      console.warn('Тег Nodes не найден');
      return;
    }
    
    const nodeElements = nodesElement.getElementsByTagName('Node');
    console.log(`Найдено узлов: ${nodeElements.length}`);
    
    for (let i = 0; i < nodeElements.length; i++) {
      const nodeElem = nodeElements[i];
      
      const id = this.getTextContent(nodeElem, 'Id');
      const guid = this.getTextContent(nodeElem, 'Guid');
      const x = parseFloat(this.getTextContent(nodeElem, 'X'));
      const y = parseFloat(this.getTextContent(nodeElem, 'Y'));
      const z = parseFloat(this.getTextContent(nodeElem, 'Z'));
      
      if (id && !isNaN(x) && !isNaN(y) && !isNaN(z)) {
        const node = new Node(id, guid, x, y, z);
        this.nodesMap.set(id, node);
      } else {
        console.warn(`Пропущен узел с id=${id}, координаты: x=${x}, y=${y}, z=${z}`);
      }
    }
    
    console.log(`Загружено узлов: ${this.nodesMap.size}`);
  }
  
  // Парсинг всех секций
  private static parseSections(xmlDoc: Document): void {
    const sectionsElement = xmlDoc.getElementsByTagName('Sections')[0];
    if (!sectionsElement) {
      console.warn('Тег Sections не найден');
      return;
    }
    
    const sectionElements = sectionsElement.getElementsByTagName('Section');
    console.log(`Найдено секций: ${sectionElements.length}`);
    
    for (let i = 0; i < sectionElements.length; i++) {
      const sectionElem = sectionElements[i];
      
      const id = this.getTextContent(sectionElem, 'Id');
      const guid = this.getTextContent(sectionElem, 'Guid');
      const startNodeId = this.getTextContent(sectionElem, 'StartNodeId');
      const endNodeId = this.getTextContent(sectionElem, 'EndNodeId');
      const thickness = parseFloat(this.getTextContent(sectionElem, 'Thickness') || '4');
      
      if (id && startNodeId && endNodeId) {
        const startNode = this.nodesMap.get(startNodeId);
        const endNode = this.nodesMap.get(endNodeId);
        
        if (startNode && endNode) {
          const section = new Section(id, guid, startNode, endNode, thickness);
          this.sectionsMap.set(id, section);
        } else {
          console.warn(`Секция ${id}: не найдены узлы start=${startNodeId}, end=${endNodeId}`);
        }
      }
    }
    
    console.log(`Загружено секций: ${this.sectionsMap.size}`);
  }
  
  // Парсинг всех выработок
  private static parseExcavations(xmlDoc: Document): Map<string, Excavation> {
    const excavationsMap = new Map<string, Excavation>();
    
    const excavationsElement = xmlDoc.getElementsByTagName('Excavations')[0];
    if (!excavationsElement) {
      console.warn('Тег Excavations не найден');
      return excavationsMap;
    }
    
    const excavationElements = excavationsElement.getElementsByTagName('Excavation');
    console.log(`Найдено выработок: ${excavationElements.length}`);
    
    for (let i = 0; i < excavationElements.length; i++) {
      const excElem = excavationElements[i];
      
      const id = this.getTextContent(excElem, 'Id');
      const guid = this.getTextContent(excElem, 'Guid');
      const name = this.getTextContent(excElem, 'Name') || `Выработка ${id}`;
      const objectId = this.getTextContent(excElem, 'ObjectId');
      const excavationType = this.getTextContent(excElem, 'ExcavationType');
      const sectionsStr = this.getTextContent(excElem, 'Sections');
      
      if (id) {
        const excavation = new Excavation(id, guid, name, objectId, excavationType);
        
        if (sectionsStr) {
          excavation.setSectionIds(sectionsStr);
          
          // Добавляем ссылки на секции
          excavation.sectionIds.forEach(sectionId => {
            const section = this.sectionsMap.get(sectionId);
            if (section) {
              excavation.addSection(section);
            }
          });
        }
        
        excavationsMap.set(id, excavation);
        if (excavation.sections.length > 0) {
          console.log(`  Выработка ${id}: ${name} (${excavation.sections.length} секций)`);
        }
      }
    }
    
    return excavationsMap;
  }
  
  // Парсинг горизонтов
  private static parseHorizons(xmlDoc: Document, excavationsMap: Map<string, Excavation>): Horizon[] {
    const horizons: Horizon[] = [];
    
    const horizonsElement = xmlDoc.getElementsByTagName('Horizons')[0];
    if (!horizonsElement) {
      console.warn('Тег Horizons не найден');
      return horizons;
    }
    
    const horizonElements = horizonsElement.getElementsByTagName('Horizon');
    console.log(`Найдено горизонтов: ${horizonElements.length}`);
    
    for (let i = 0; i < horizonElements.length; i++) {
      const horElem = horizonElements[i];
      
      const id = this.getTextContent(horElem, 'Id');
      const guid = this.getTextContent(horElem, 'Guid');
      const name = this.getTextContent(horElem, 'Name') || `Горизонт ${id}`;
      const altitude = parseFloat(this.getTextContent(horElem, 'Altitude') || '0');
      const isMine = this.getTextContent(horElem, 'IsMine') === 'true';
      const active = this.getTextContent(horElem, 'Active') === 'true';
      const visible = this.getTextContent(horElem, 'Visible') !== 'false';
      const sectionsStr = this.getTextContent(horElem, 'Sections');
      
      if (id) {
        const horizon = new Horizon(id, guid, name, altitude, isMine);
        horizon.active = active;
        horizon.visible = visible;
        
        if (sectionsStr) {
          horizon.setSectionIds(sectionsStr);
          
          // Находим выработки, которые содержат секции этого горизонта
          const horizonSectionIds = new Set(horizon.sectionIds);
          const relatedExcavations = new Set<Excavation>();
          
          excavationsMap.forEach(excavation => {
            excavation.sectionIds.forEach(sectionId => {
              if (horizonSectionIds.has(sectionId)) {
                relatedExcavations.add(excavation);
              }
            });
          });
          
          // Добавляем выработки к горизонту
          relatedExcavations.forEach(excavation => {
            horizon.addExcavation(excavation);
          });
        }
        
        horizons.push(horizon);
        console.log(`Горизонт ${id}: ${name} (${horizon.excavations.length} выработок, ${horizon.sectionIds.length} секций)`);
      }
    }
    
    return horizons;
  }
  
  // Вспомогательный метод для получения текстового содержимого дочернего элемента
  private static getTextContent(parent: Element, tagName: string): string {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent?.trim() || '' : '';
  }
  
  // Статистика по загруженным данным
  static logStatistics(horizons: Horizon[]): void {
    console.log('=== СТАТИСТИКА ШАХТЫ ===');
    console.log(`Всего горизонтов: ${horizons.length}`);
    
    let totalExcavations = 0;
    let totalSections = 0;
    
    horizons.forEach(horizon => {
      console.log(`\n${horizon.name} (${horizon.altitude}м):`);
      console.log(`  Выработок: ${horizon.excavations.length}`);
      console.log(`  Секций: ${horizon.sectionIds.length}`);
      
      horizon.excavations.forEach(exc => {
        console.log(`    - ${exc.name}: ${exc.sections.length} секций, длина ${exc.getTotalLength().toFixed(2)}м`);
        totalExcavations++;
        totalSections += exc.sections.length;
      });
    });
    
    console.log(`\nИтого: ${totalExcavations} выработок, ${totalSections} секций`);
    console.log('========================');
  }
}