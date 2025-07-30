import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const squared = (n: number): number => n * n;

export const beautifyDomByUrl = async (url: string) => {
  const dom = await JSDOM.fromURL(url);
  const reader = new Readability(dom.window.document);
  return reader.parse();
};
