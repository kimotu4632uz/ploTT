import { ModeMappingList, ModeMappingOverride, UnfoldDescription } from "./types";

export const UNFOLD_DESC: UnfoldDescription = {
    IJ_K: "IJ x K (natural and reshape-like left-unfolding)",
    JI_K: "JI x K",
    I_JK: "I x JK (natural right-unfolding)",
    I_KJ: "I x KJ (reshape-like right-unfolding)",
    IJ_KL: "IJ x KL (natural matiricalization)",
} as const;

export const MODE_MAPPING_LIST: ModeMappingList = {
    IJ_K: {
        inner: { y: 1, x: 3 },
        outer: { y: 0, x: null },
    },
    JI_K: {
        inner: { y: 0, x: 3 },
        outer: { y: 1, x: null },
    },
    I_JK: {
        inner: { y: 0, x: 1 },
        outer: { y: null, x: 3 },
    },
    I_KJ: {
        inner: { y: 0, x: 3 },
        outer: { y: null, x: 1 },
    },
    IJ_KL: {
        inner: { y: 1, x: 2 },
        outer: { y: 0, x: 3 },
    },
} as const;

export const MODE_MAPPING_OVERRIDE: ModeMappingOverride = {
    IJ_K: [
        {
            coreIndex: 0,
            subs: {
                inner: { y: 1, x: 3 },
                outer: { y: null, x: null },
            },
        },
        {
            coreIndex: -1,
            subs: {
                inner: { y: 0, x: 1 },
                outer: { y: null, x: null },
            },
        },
    ],
    JI_K: [
        {
            coreIndex: 0,
            subs: {
                inner: { y: 1, x: 3 },
                outer: { y: null, x: null },
            },
        },
        {
            coreIndex: -1,
            subs: {
                inner: { y: 0, x: 1 },
                outer: { y: null, x: null },
            },
        },
    ],
    I_JK: [
        {
            coreIndex: 0,
            subs: {
                inner: { y: 1, x: 3 },
                outer: { y: null, x: null },
            },
        },
        {
            coreIndex: -1,
            subs: {
                inner: { y: 0, x: 1 },
                outer: { y: null, x: null },
            },
        },
    ],
    I_KJ: [
        {
            coreIndex: 0,
            subs: {
                inner: { y: 1, x: 3 },
                outer: { y: null, x: null },
            },
        },
        {
            coreIndex: -1,
            subs: {
                inner: { y: 0, x: 1 },
                outer: { y: null, x: null },
            },
        },
    ],
    IJ_KL: [],
};
