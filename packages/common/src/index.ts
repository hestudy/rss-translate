import { Edit, Lang, parse } from '@ast-grep/napi';
import { Readability } from '@mozilla/readability';
import { chunk } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { JSDOM } from 'jsdom';
import LanguageDetect from 'languagedetect';
import OpenAI from 'openai';

export const squared = (n: number): number => n * n;

export const beautifyDomByUrl = async (url: string) => {
  const dom = await JSDOM.fromURL(url);
  const reader = new Readability(dom.window.document);
  return reader.parse();
};

export const translateHtml = async (
  html: string,
  openai: OpenAI,
  model = 'gpt-4o-mini',
  targetLang = 'chinese simplified',
  chunkCount = 2,
) => {
  const langDetact = new LanguageDetect();
  const ast = parse(Lang.Html, html);
  const root = ast.root();
  const textNodeList = root.findAll({
    rule: {
      pattern: {
        selector: 'text',
        context: '$TEXT',
      },
    },
  });

  const edits: Edit[] = [];

  const textNodeListChunks = chunk(textNodeList, chunkCount);

  for (let i = 0; i < textNodeListChunks.length; i++) {
    console.log(`Translating ${i + 1} of ${textNodeListChunks.length}...`);

    const textNodeList = textNodeListChunks[i];

    await Promise.all(
      textNodeList.map(async (textNode) => {
        const text = textNode.text();
        const langs = langDetact.detect(text, 1);
        if (!isEmpty(langs)) {
          const translated = await translateText(
            text,
            openai,
            model,
            targetLang,
          );
          if (translated) {
            edits.push(textNode.replace(translated));
          }
        }
      }),
    );
  }

  return root.commitEdits(edits);
};

export const translateText = async (
  text: string,
  openai: OpenAI,
  model = 'gpt-4o-mini',
  targetLang = 'chinese simplified',
) => {
  console.log(`Translating ${text}...`);
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a translator.',
      },
      {
        role: 'user',
        content: `Translate the following text to ${targetLang}: ${text}`,
      },
    ],
  });
  if (completion.choices[0].message.content) {
    console.log(`Translation: ${completion.choices[0].message.content}`);
    return completion.choices[0].message.content;
  }
};
