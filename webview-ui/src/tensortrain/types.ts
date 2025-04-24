import { TypedArray } from "@stdlib/types/array";
import { realndarray } from "@stdlib/types/ndarray";

export type NdArray = realndarray;
export type NdArrayData = TypedArray;

export const TT_UNFOLD = ["IJ_K", "JI_K", "I_JK", "I_KJ"] as const;
export type TTUnfoldDir = (typeof TT_UNFOLD)[number];
export const TENSOR_UNFOLD_DIRS = TT_UNFOLD.map((x) => x as TTUnfoldDir);

export const TT_OP_UNFOLD = ["IJ_KL"] as const;
export type TTopUnfoldDir = (typeof TT_OP_UNFOLD)[number];
export const TENSOR_OP_UNFOLD_DIRS = TT_OP_UNFOLD.map((x) => x as TTopUnfoldDir);

export type UnfoldDir = TTUnfoldDir | TTopUnfoldDir;

export type XYData<T> = {
    x: T;
    y: T;
};

export type UnfoldDescription = {
    [key in UnfoldDir]: string;
};

export type ModeMapping = {
    inner: XYData<number>;
    outer: XYData<number | null>;
};

export type ModeMappingList = {
    [key in UnfoldDir]: ModeMapping;
};

export type ModeMappingOverride = {
    [key in UnfoldDir]: {
        coreIndex: number;
        subs: ModeMapping;
    }[];
};
