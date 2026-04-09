import { Horizon } from '../models/Horizon';
import { Excavation } from '../models/Excavation';
import { Section } from '../models/Section';
import { Node } from '../models/Node';

export class XmlParser {
  private static nodesMap = new Map<string, Node>();
  private static sectionsMap = new Map<string, Section>();
  
  static async parseXmlFile(filePath: string): Promise<Horizon[]> {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const decodedText = this.decodeWindows1251(arrayBuffer);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(decodedText, 'text/xml');
    
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Ошибка парсинга XML: ' + parserError.textContent);
    }
    
    this.nodesMap.clear();
    this.sectionsMap.clear();
    
    this.parseNodes(xmlDoc);
    this.parseSections(xmlDoc);
    const excavations = this.parseExcavations(xmlDoc);
    const horizons = this.parseHorizons(xmlDoc, excavations);
    
    console.log(`Загружено: ${this.nodesMap.size} узлов, ${this.sectionsMap.size} секций, ${excavations.size} выработок, ${horizons.length} горизонтов`);
    
    return horizons;
  }
  
  private static decodeWindows1251(arrayBuffer: ArrayBuffer): string {
    const decoder = new TextDecoder('windows-1251');
    return decoder.decode(arrayBuffer);
  }
  
  private static parseNodes(xmlDoc: Document): void {
    const nodesElement = xmlDoc.getElementsByTagName('Nodes')[0];
    if (!nodesElement) return;
    
    const nodeElements = nodesElement.getElementsByTagName('Node');
    
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
      }
    }
  }
  
  private static parseSections(xmlDoc: Document): void {
    const sectionsElement = xmlDoc.getElementsByTagName('Sections')[0];
    if (!sectionsElement) return;
    
    const sectionElements = sectionsElement.getElementsByTagName('Section');
    
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
        }
      }
    }
  }
  
  private static parseExcavations(xmlDoc: Document): Map<string, Excavation> {
    const excavationsMap = new Map<string, Excavation>();
    const excavationsElement = xmlDoc.getElementsByTagName('Excavations')[0];
    if (!excavationsElement) return excavationsMap;
    
    const excavationElements = excavationsElement.getElementsByTagName('Excavation');
    
    for (let i = 0; i < excavationElements.length; i++) {
      const excElem = excavationElements[i];
      const id = this.getTextContent(excElem, 'Id');
      const guid = this.getTextContent(excElem, 'Guid');
      const name = this.getTextContent(excElem, 'Name');
      const objectId = this.getTextContent(excElem, 'ObjectId');
      const excavationType = this.getTextContent(excElem, 'ExcavationType');
      const sectionsStr = this.getTextContent(excElem, 'Sections');
      
      if (id) {
        const excavation = new Excavation(id, guid, name, objectId, excavationType);
        
        if (sectionsStr) {
          const sectionIds = sectionsStr.split(',').map(s => s.trim());
          sectionIds.forEach(sectionId => {
            const section = this.sectionsMap.get(sectionId);
            if (section) {
              excavation.addSection(section);
            }
          });
        }
        
        excavationsMap.set(id, excavation);
      }
    }
    
    return excavationsMap;
  }
  
  private static parseHorizons(xmlDoc: Document, excavationsMap: Map<string, Excavation>): Horizon[] {
    const horizons: Horizon[] = [];
    const horizonsElement = xmlDoc.getElementsByTagName('Horizons')[0];
    if (!horizonsElement) return horizons;
    
    const horizonElements = horizonsElement.getElementsByTagName('Horizon');
    
    for (let i = 0; i < horizonElements.length; i++) {
      const horElem = horizonElements[i];
      const id = this.getTextContent(horElem, 'Id');
      const guid = this.getTextContent(horElem, 'Guid');
      const name = this.getTextContent(horElem, 'Name');
      const altitude = parseFloat(this.getTextContent(horElem, 'Altitude') || '0');
      const isMine = this.getTextContent(horElem, 'IsMine') === 'true';
      const sectionsStr = this.getTextContent(horElem, 'Sections');
      
      if (id) {
        const horizon = new Horizon(id, guid, name, altitude, isMine);
        
        if (sectionsStr) {
          const horizonSectionIds = new Set(sectionsStr.split(',').map(s => s.trim()));
          
          excavationsMap.forEach(excavation => {
            const hasSectionInHorizon = excavation.sections.some(section => 
              horizonSectionIds.has(section.id)
            );
            
            if (hasSectionInHorizon) {
              horizon.addExcavation(excavation);
            }
          });
        }
        
        horizons.push(horizon);
      }
    }
    
    return horizons;
  }
  
  private static getTextContent(parent: Element, tagName: string): string {
    const element = parent.getElementsByTagName(tagName)[0];
    return element ? element.textContent?.trim() || '' : '';
  }
}