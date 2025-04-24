import { RefObject } from "react";

export function tryGet<T, K extends keyof T>(collection: T, key: K | null): T[K] | null {
    if (key === null) {
        return null;
    } else {
        return collection[key];
    }
}

export function getOrDefault<T, K extends keyof T>(
    collection: T,
    key: K | null,
    defaultValue: T[K]
): T[K] {
    return tryGet(collection, key) ?? defaultValue;
}

export function modMinusIndex(index: number, length: number): number {
    return index < 0 ? index + length : index;
}

export function tryRefs<T>(refs: RefObject<T>[]): T[] | null {
    for (const ref of refs) {
        if (ref.current === null) {
            return null;
        }
    }

    return refs.map((ref) => ref.current!);
}
