import type { Nullable } from "./types"

type MapValue<T> = T extends Map<infer _, infer V> ? V : never

/**
 * Returns a value by key, throws if the value is missing or the map null
 * @param map 
 * @param key 
 * @param errorMessage 
 * @returns 
 */
export const getValue = <T extends Map<K,V>,K,V>(map:Nullable<T>, key:K, errorMessage?:string):MapValue<T> => {
    if (!map) {
        throw new Error(errorMessage || `Missing map`)
    }
    if (map && map.has(key)) {
        return map.get(key) as MapValue<T>
    } else {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(errorMessage || `Missing key: ${key}`)
    }
}
