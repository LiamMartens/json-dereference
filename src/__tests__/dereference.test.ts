import { dereference } from '../';

describe('dereference', () => {
  it('should resolve simple references', async () => {
    expect(await dereference({
      value: 500,
      obj: {
        value: {
          $ref: '#/value',
        },
      },
    })).toEqual({
      value: 500,
      obj: { value: 500 }
    });
  });

  it('should resolve deep references', async () => {
    expect(await dereference({
      schema: {
        $type: 'schema',
      },
      value: {
        schema: {
          $ref: '#/schema',
        }
      },
      obj: {
        value: {
          $ref: '#/value',
        },
      },
    })).toEqual({
      schema: {
        $type: 'schema',
      },
      value: {
        schema: {
          $type: 'schema',
        }
      },
      obj: {
        value: {
          schema: {
            $type: 'schema',
          }
        },
      },
    });
  });

  it('should resolve remote references', async () => {
    expect(await dereference({
      obj: {
        value: {
          $ref: 'https://example.com/schema#/value',
        },
      },
    }, {
      loadSchema: async () => ({
        value: 500,
      })
    })).toEqual({
      obj: { value: 500 }
    });
  });
});
