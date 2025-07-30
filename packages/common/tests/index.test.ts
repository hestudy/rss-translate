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

test('translate', async () => {});
