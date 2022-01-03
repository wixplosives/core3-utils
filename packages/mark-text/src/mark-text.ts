export interface MarkedString {
  name: string;
  content: Array<string | MarkedString>;
}

type Marker = (str: TemplateStringsArray, ...replacement: Array<string | number | MarkedString>) => MarkedString;
type Markers<KEYS extends string> = { [key in KEYS]: Marker };

export interface Pos {
  start: number;
  end: number;
}

const createMarkers = <KEYS extends string>(markKeys: KEYS[]): Markers<KEYS> => {
  return markKeys.reduce((acc, key) => {
    acc[key] = (content: TemplateStringsArray, ...replacement: Array<string | number | MarkedString>) => {
      return {
        name: key,
        content: replacement.map((item) => {
          if (typeof item === 'number') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return content[item]!;
          }
          return item;
        }),
      };
    };

    return acc;
  }, {} as Markers<KEYS>);
};

export type Mark = (
  text: TemplateStringsArray,
  ...replacement: Array<string | number | MarkedString>
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

const innerMark = (item: MarkedString, indexes: Record<string, Pos>, curentPos: number) => {
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
    markers: Markers<KEYS>
  ) => {
    result: string;
    indexes: Record<string, Pos>;
  },
  markKeys: KEYS[]
) => {
  const res = factory(mark, createMarkers(markKeys));
  return res as {
    result: string;
    indexes: Record<KEYS, Pos>;
  };
};
