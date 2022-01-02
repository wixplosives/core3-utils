export type MarkedString<NAME extends string> = {
  name: NAME;
  content: Array<string | MarkedString<string>>;
};

type Marker<NAME extends string> = (
  str: TemplateStringsArray,
  ...replacement: Array<string | number | MarkedString<string>>
) => MarkedString<NAME>;
type Markers = { [key in string]: Marker<key> };

type NonPartial<T extends Record<string, unknown>> = {
  [key in keyof T]: NonNullable<T[key]>;
};

const a: NonPartial<Record<string, number>> = {};

const b: number = a['a'];

b.toString();
export interface Pos {
  start: number;
  end: number;
}

const createMarkers = (): Markers => {
  const proxy = new Proxy(
    {},
    {
      get(_t, name) {
        return (content: TemplateStringsArray, ...replacement: Array<string | number | MarkedString<string>>) => {
          return {
            name,
            content: replacement.map((item) => {
              if (typeof item === 'number') {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return content[item]!;
              }
              return item;
            }),
          };
        };
      },
    }
  );
  return proxy as Markers;
};

export type Mark = (
  text: TemplateStringsArray,
  ...replacement: Array<string | number | MarkedString<string>>
) => {
  result: string;
  indexes: Record<string, Pos>;
};
export const mark: Mark = (text, ...replacement) => {
  let result = '';
  const indexes: Record<string, Pos> = {};
  for (const r of replacement) {
    if (typeof r === 'number') {
      result += text[r];
    } else if (typeof r === 'string') {
      result += r;
    } else {
      const childRes = innerMark(r, indexes, result.length);
      indexes[r.name] = {
        start: result.length,
        end: result.length + childRes.result.length,
      };
      for (const [index, value] of Object.entries(childRes.indexes)) {
        indexes[index] = value;
      }
    }
  }
  return { result, indexes };
};

const innerMark = (item: MarkedString<string>, indexes: Record<string, Pos>, curentPos: number) => {
  let result = '';
  for (const r of item.content) {
    if (typeof r === 'string') {
      result += r;
    } else {
      const childRes = innerMark(r, indexes, curentPos + result.length);

      indexes[r.name] = {
        start: result.length + curentPos,
        end: result.length + childRes.result.length + curentPos,
      };
      for (const [index, value] of Object.entries(childRes.indexes)) {
        indexes[index] = value;
      }
    }
  }
  return { result, indexes };
};

export const textAndIndexes = <KEYS extends string>(
  factory: (
    mark: Mark,
    markers: Markers
  ) => {
    result: string;
    indexes: Record<string, Pos>;
  }
) => {
  const res = factory(mark, createMarkers());
  return res as {
    result: string;
    indexes: Record<KEYS, Pos>;
  };
};
