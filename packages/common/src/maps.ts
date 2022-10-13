import type { Nullable } from "./types"

export const getValue = <K,V,T extends Map<K,V>>(map:Nullable<T>, key:K, errorMessage?:string):V => {
    if (!map) {
        throw new Error(errorMessage || `Missing map`)
    }
    if (map && map.has(key)) {
        return map.get(key)!
    } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(errorMessage || `Missing key: ${key}`)
    }
}
