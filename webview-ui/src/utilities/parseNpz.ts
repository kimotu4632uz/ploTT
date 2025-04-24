import { array } from "@stdlib/ndarray";
import JSZip from "jszip";
import npyjs from "npyjs";

import { NdArray } from "../tensortrain/types";

export type NpzEntry = {
    key: string;
    data: NdArray;
};

export async function parseNpz(data: ArrayBuffer): Promise<NpzEntry[]> {
    const zipFile = await JSZip.loadAsync(data);

    const keys: string[] = [];
    zipFile.forEach((relativePath, file) => {
        if (file.dir || !relativePath.endsWith(".npy") || relativePath.includes("/")) {
            throw new Error("Invalid entry found: " + relativePath);
        }

        const key = relativePath.split(".")[0]!;
        keys.push(key);
    });

    const result: NpzEntry[] = [];
    const n = new npyjs();
    for (const key of keys) {
        const npy = await zipFile.file(key + ".npy")!.async("arraybuffer");
        const { data, shape, dtype, fortranOrder } = n.parse(npy);
        if (dtype === "int64" || dtype === "uint64") {
            throw new Error("int64 and uint64 are not supported");
        }
        const mat = array(data, {
            shape,
            dtype,
            order: fortranOrder ? "column-major" : "row-major",
        }) as NdArray;

        result.push({
            key,
            data: mat,
        });
    }

    return result;
}
