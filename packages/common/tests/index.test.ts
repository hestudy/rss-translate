import OpenAI from 'openai';
import { expect, test } from 'vitest';
import { beautifyDomByUrl, squared, translate } from '../src/index';

test('squared', () => {
  expect(squared(2)).toBe(4);
  expect(squared(12)).toBe(144);
});

test('beautifyDomByUrl', async () => {
  const result = await beautifyDomByUrl(
    'https://thisweekinreact.com/newsletter/244',
  );
  expect(result).toBeTruthy();
});

test('translate', async () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL,
  });

  const result = await beautifyDomByUrl(
    'https://thisweekinreact.com/newsletter/244',
  );

  const translated = await translate(
    result?.content ?? '',
    openai,
    process.env.OPENAI_API_MODEL,
  );
  console.log(translated);
  expect(translated).toBeTruthy();
});
