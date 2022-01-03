export interface MarkedString {
  name: string;
  content: Array<string | MarkedString>;
  marker: Marker;
}

type Marker = { getPos: () => Pos; pos?: Pos } & ((
  str: TemplateStringsArray,
  ...replacement: Array<string | number | MarkedString>
) => MarkedString);
type Markers<KEYS extends string> = { [key in KEYS]: Marker };

export interface Pos {
  start: number;
  end: number;
}

const mergeTemplateArrs = <T1, T2>(content: readonly T1[], subs: readonly T2[]): Array<T1 | T2> => {
  return content.reduce((acc, contentItem, idx) => {
    acc.push(contentItem);
    const sub = subs[idx];
    if (sub) {
      acc.push(sub);
    }
    return acc;
  }, [] as Array<T1 | T2>);
};

export const createMarkers = <KEYS extends string>(...markKeys: KEYS[]): Markers<KEYS> => {
  return markKeys.reduce((acc, key) => {
    const marker: Marker = (content: TemplateStringsArray, ...replacement: Array<string | number | MarkedString>) => {
      const merged = mergeTemplateArrs(content.raw, replacement);
      return {
        name: key,
        content: merged.map((item) => {
          if (typeof item === 'number') {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return content[item]!;
          }
          return item;
        }),
        marker,
      };
    };
    marker.getPos = function () {
      if (!this.pos) {
        throw new Error('position was not set, use marker inside markText to set it');
      }
      return this.pos;
    };

    acc[key] = marker;

    return acc;
  }, {} as Markers<KEYS>);
};

export type Mark = (text: TemplateStringsArray, ...replacement: Array<string | number | MarkedString>) => string;
export const markText: Mark = (text, ...replacement) => {
  let result = '';
  const merged = mergeTemplateArrs(text.raw, replacement);

  for (const r of merged) {
    if (typeof r === 'number') {
      result += text[r];
    } else if (typeof r === 'string') {
      result += r;
    } else {
      const childRes = innerMark(r, result.length);
      r.marker.pos = {
        start: result.length,
        end: result.length + childRes.length,
      };
      result += childRes;
    }
  }
  return result;
};

const innerMark = (item: MarkedString, curentPos: number) => {
  let result = '';
  for (const r of item.content) {
    if (typeof r === 'string') {
      result += r;
    } else {
      const childRes = innerMark(r, curentPos + result.length);
      r.marker.pos = {
        start: result.length + curentPos,
        end: result.length + childRes.length + curentPos,
      };
      result += childRes;
    }
  }
  return result;
};
