import get from 'just-safe-get';

type AnyObject = Record<string, any>
type Options = {
  rootObject?: AnyObject;
  throwOnUnresolved?: boolean;
  loadSchema?: (url: string) => Promise<AnyObject>;
}


export async function dereference<V extends AnyObject>(obj: AnyObject, options: Options = {}): Promise<V> {
  if (obj.hasOwnProperty('$ref') && typeof obj.$ref === 'string') {
    const [url, ...path] = obj.$ref.split('#');

    if (url && !options.loadSchema) {
      throw new Error('No schema loader provided');
    }

    const rootObject = url && options.loadSchema
      ? await options.loadSchema(url)
      : options.rootObject ?? obj;

    const value = get(rootObject, path.join('#').replace(/^\//, '').replace(/\//g, '.'), null);
    const dereferencedValue = typeof value === 'object' && value !== null
      ? await dereference(value, {
        rootObject: options.rootObject ?? obj,
        loadSchema: options.loadSchema,
      })
      : value;
    return dereferencedValue;
  } else {
    const entries = Object.entries(obj);
    return Object.fromEntries(
      await Promise.all(entries.map<Promise<[string, any]>>(async ([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return [key, await dereference<V>(value, {
            rootObject: options.rootObject ?? obj,
            loadSchema: options.loadSchema,
          })];
        }
        return [key, value];
      }))
    ) as V;
  }
}