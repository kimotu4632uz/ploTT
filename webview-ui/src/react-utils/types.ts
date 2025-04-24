import { ScaleSequential } from "d3";

export type Area = {
    width: number;
    height: number;
};

export type ColorBarInfo = {
    min: number;
    max: number;
    color: ScaleSequential<string, never>;
};
