const { expect } = require('chai');
const removeFields = require('../../lib/removeFields');

describe('The removeFields function', () => {
  const data = { foo: 'foo', bar: 'bar', baz: 'baz' };

  it('removes a single field', () =>
    expect(removeFields(data, ['foo'])).to.deep.equal({ bar: 'bar', baz: 'baz' }));

  it('removes multiple fields', () =>
    expect(removeFields(data, ['foo', 'baz'])).to.deep.equal({ bar: 'bar' }));

  it('removes fields from all items in an array', () =>
    expect(removeFields([data, data], ['foo', 'bar'])).to.deep.equal([
      { baz: 'baz' },
      { baz: 'baz' },
    ]));

  it('handles objects with a toJSON() method', async () => {
    const dataWithToJSON = { toJSON: () => data };
    expect(removeFields(dataWithToJSON, ['bar'])).to.deep.equal({ foo: 'foo', baz: 'baz' });
  });
});
