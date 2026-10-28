import { DOMImplementation, XMLSerializer } from '@xmldom/xmldom';
import type { SvgDocument } from '../model/SvgDocument.js';

export class SvgSerializer {
  serialize(document: SvgDocument): string {
    const xml = new DOMImplementation().createDocument('http://www.w3.org/2000/svg', 'svg', null);
    const root = xml.documentElement!;
    root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    root.setAttribute('width', String(document.width));
    root.setAttribute('height', String(document.height));
    root.setAttribute('viewBox', `0 0 ${document.width} ${document.height}`);
    for (const shape of document.children) root.appendChild(shape.toElement(xml));
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(xml)}`;
  }
}
