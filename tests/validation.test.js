process.env.DATABASE_URL ||= 'postgresql://localhost/harborline_test';
const test = require('node:test');
const assert = require('node:assert/strict');
const { amountSchema } = require('../src/server');

test('amount validation accepts positive amounts with cents', () => {
  assert.equal(amountSchema.parse('12.34'), 12.34);
  assert.equal(amountSchema.parse(1), 1);
});
test('amount validation rejects zero, negative, excessive precision and non-finite values', () => {
  for (const amount of [0, -1, '1.234', 'NaN', Infinity, 1000001]) assert.equal(amountSchema.safeParse(amount).success, false);
});
