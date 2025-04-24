import { ind2sub } from "@stdlib/ndarray";

import { getOrDefault, modMinusIndex, tryGet } from "../utilities/functional";
import { MODE_MAPPING_LIST, MODE_MAPPING_OVERRIDE } from "./constants";
import {
    ModeMapping,
    NdArray,
    NdArrayData,
    TENSOR_OP_UNFOLD_DIRS,
    TENSOR_UNFOLD_DIRS,
    TTopUnfoldDir,
    TTUnfoldDir,
    UnfoldDir,
    XYData,
} from "./types";

export type TensorTrain = TTvec | TTop;

export function createTT(cores: NdArray[]): TensorTrain {
    if (cores.length === 0) {
        throw new Error("Empty data provided");
    } else if (cores.map((core) => core.shape.length).some((len) => len !== 4)) {
        throw new Error("Invalid shape of the data");
    }

    const isOp = cores.map((core) => core.shape[2]).some((len) => len !== 1);
    if (isOp) {
        return new TTop(cores);
    } else {
        return new TTvec(cores);
    }
}

export type GenericTensorTrain<T extends UnfoldDir> = {
    cores: NdArray[];
    readonly availUnfold: T[];
    readonly defaultUnfold: T;

    matricize(unfold: T, strict: boolean): TTmat;
};

export class TTvec implements GenericTensorTrain<TTUnfoldDir> {
    cores: NdArray[];
    availUnfold: TTUnfoldDir[] = TENSOR_UNFOLD_DIRS;
    defaultUnfold: TTUnfoldDir = "I_JK";

    constructor(cores: NdArray[]) {
        this.cores = cores;
    }

    matricize(unfold: TTUnfoldDir, strict: boolean): TTmat {
        return new TTmat(this.cores, unfold, strict);
    }
}

export class TTop implements GenericTensorTrain<TTopUnfoldDir> {
    cores: NdArray[];
    availUnfold: TTopUnfoldDir[] = TENSOR_OP_UNFOLD_DIRS;
    defaultUnfold: TTopUnfoldDir = "IJ_KL";

    constructor(cores: NdArray[]) {
        this.cores = cores;
    }

    matricize(unfold: TTopUnfoldDir, strict: boolean): TTmat {
        return new TTmat(this.cores, unfold, strict);
    }
}

export class TTmat {
    cores: [TTcore, TTfig][];

    constructor(cores: NdArray[], unfold: UnfoldDir, strict: boolean) {
        const coreLength = cores.length;

        this.cores = cores.map((core, i) => {
            let modeMap = MODE_MAPPING_LIST[unfold];

            if (!strict) {
                for (const entry of MODE_MAPPING_OVERRIDE[unfold]) {
                    if (modMinusIndex(entry.coreIndex, coreLength) === i) {
                        modeMap = entry.subs;
                        break;
                    }
                }
            }

            return [new TTcore(core, i, modeMap), new TTfig(i, modeMap)];
        });
    }
}

export class TTcore {
    private core: NdArray;
    private modeMap: ModeMapping;

    index: number;
    vec: NdArrayData;

    matShape: XYData<number>;
    innerShape: XYData<number>;
    outerShape: XYData<number>;

    constructor(core: NdArray, index: number, map: ModeMapping) {
        this.core = core;
        this.modeMap = map;

        this.index = index;
        this.vec = core.data;

        const shape = core.shape;

        this.matShape = {
            x: shape[this.modeMap.inner.x] * getOrDefault(shape, this.modeMap.outer.x, 1),
            y: shape[this.modeMap.inner.y] * getOrDefault(shape, this.modeMap.outer.y, 1),
        };

        this.innerShape = {
            x: shape[this.modeMap.inner.x],
            y: shape[this.modeMap.inner.y],
        };

        this.outerShape = {
            x: getOrDefault(shape, this.modeMap.outer.x, 1),
            y: getOrDefault(shape, this.modeMap.outer.y, 1),
        };
    }

    idx2origSub(idx: number): number[] {
        return ind2sub(this.core.shape, idx, { order: this.core.order });
    }

    idx2innerSub(idx: number): XYData<number> {
        const sub = ind2sub(this.core.shape, idx, { order: this.core.order });

        return {
            x: sub[this.modeMap.inner.x],
            y: sub[this.modeMap.inner.y],
        };
    }

    idx2outerSub(idx: number): XYData<number> {
        const sub = ind2sub(this.core.shape, idx, { order: this.core.order });

        return {
            x: getOrDefault(sub, this.modeMap.outer.x, 0),
            y: getOrDefault(sub, this.modeMap.outer.y, 0),
        };
    }

    idx2sub(idx: number): XYData<number> {
        const inner = this.idx2innerSub(idx);
        const outer = this.idx2outerSub(idx);

        return {
            x: inner.x + outer.x * this.innerShape.x,
            y: inner.y + outer.y * this.innerShape.y,
        };
    }
}

// arg: 0-base core index
function formatLabel(i: number): string[] {
    return [`r${i}`, `n${i + 1}`, `m${i + 1}`, `r${i + 1}`];
}

function formatTick(i: number): string[] {
    return [`r=${i}`, `n=${i}`, `m=${i}`, `r=${i}`];
}

export class TTfig {
    private index: number;
    private modeMap: ModeMapping;

    constructor(index: number, map: ModeMapping) {
        this.index = index;
        this.modeMap = map;
    }

    get outerTicksExist(): XYData<boolean> {
        return {
            x: this.modeMap.outer.x !== null,
            y: this.modeMap.outer.y !== null,
        };
    }

    get xlabel(): string {
        const labelParts = formatLabel(this.index);

        let xlabel = labelParts[this.modeMap.inner.x];
        if (this.outerTicksExist.x) {
            xlabel += " × ";
            xlabel += labelParts[this.modeMap.outer.x!];
        }

        return xlabel;
    }

    get ylabel(): string[] {
        const labelParts = formatLabel(this.index);

        const ylabel = [];
        if (this.outerTicksExist.y) {
            ylabel.push(labelParts[this.modeMap.outer.y!]);
            ylabel.push("×");
        }
        ylabel.push(labelParts[this.modeMap.inner.y]);

        return ylabel;
    }

    innerTicks(i: number): XYData<string> {
        const ticks = formatTick(i);
        const outerTicks = this.outerTicksExist;

        return {
            x: outerTicks.x ? ticks[this.modeMap.inner.x] : String(i),
            y: outerTicks.y ? ticks[this.modeMap.inner.y] : String(i),
        };
    }

    outerTicks(i: number): XYData<string | null> {
        const ticks = formatTick(i);

        return {
            x: tryGet(ticks, this.modeMap.outer.x),
            y: tryGet(ticks, this.modeMap.outer.y),
        };
    }

    formatTip(subs: number[]): string {
        const labelParts = formatLabel(this.index);
        const subParts = [
            this.modeMap.inner.x,
            this.modeMap.inner.y,
            this.modeMap.outer.x,
            this.modeMap.outer.y,
        ]
            .filter((item) => item !== null)
            .sort();

        const tip = subParts.map((i) => labelParts[i] + "=" + subs[i]);

        return tip.join("<br/>");
    }
}
