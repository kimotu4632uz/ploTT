import * as d3 from "d3";

import { Area } from "../react-utils/types";
import { TTfig } from "../tensortrain/TT";

export function formatFloat(x: number, precision: number) {
    let prec = x.toPrecision(precision);
    const splited = prec.split(".");
    if (splited.length > 1) {
        prec = splited[0] + "." + splited[1].replace(/0+$/g, "");
    }
    const expo = Number.parseFloat(prec).toExponential();

    if (prec.length >= expo.length) {
        return expo;
    } else {
        return prec;
    }
}

type ScaleBandLike = {
    (i: number): number;
    bandwidth: () => number;
};

export function modifyScaleBand(scale: d3.ScaleBand<number>): d3.ScaleBand<number> | ScaleBandLike {
    const range = scale.range();
    const domain = scale.domain();
    const width = Math.abs(range[1] - range[0]);

    if (domain.length === 1) {
        const dummy: ScaleBandLike = () => {
            return 0;
        };
        dummy.bandwidth = () => width;
        return dummy;
    } else {
        return scale;
    }
}

function drawLabel(
    svg: d3.Selection<SVGGElement, unknown, null, undefined>,
    label: string,
    x: number,
    y: number
) {
    svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .style("fill", "rgba(0, 0, 0, 0.65)")
        .style("font-size", "18px")
        .style("font-family", "sans-serif")
        .attr("text-anchor", "middle")
        .text(label);
}

export function drawCoreLabels(
    fig: TTfig,
    xAxis: d3.Selection<SVGGElement, unknown, null, undefined>,
    yAxis: d3.Selection<SVGGElement, unknown, null, undefined>,
    figArea: Area,
    labelDistance: { x: number; y: number }
) {
    drawLabel(xAxis, fig.xlabel, figArea.width / 2, labelDistance.x);
    if (fig.ylabel.length === 1) {
        drawLabel(yAxis, fig.ylabel[0], labelDistance.y, figArea.height / 2);
    } else if (fig.ylabel.length === 3) {
        drawLabel(yAxis, fig.ylabel[0], labelDistance.y, figArea.height / 2 - 20);
        drawLabel(yAxis, fig.ylabel[1], labelDistance.y, figArea.height / 2);
        drawLabel(yAxis, fig.ylabel[2], labelDistance.y, figArea.height / 2 + 20);
    }
}

export function removeAxisPath(axis: d3.Selection<SVGGElement, unknown, null, undefined>) {
    axis.select(".domain").attr("display", "none");
}

type OuterAxisOptions = {
    tickFormat?: (i: number) => string;
    tickLength?: number;
};

export function outerAxisTop(scaleList: d3.ScaleBand<number>[], options?: OuterAxisOptions) {
    return (selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        drawAxisTop(selection, scaleList, options);
}

function drawAxisTop(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    scaleList: d3.ScaleBand<number>[],
    options?: OuterAxisOptions
) {
    const tickFormat = options?.tickFormat ?? ((i) => i.toString());
    const tickLength = options?.tickLength ?? 6;

    for (let i = 0; i < scaleList.length; i++) {
        const scale = scaleList[i];

        const start = scale(scale.domain()[0])! + scale.bandwidth() / 2;
        const end = scale(scale.domain().slice(-1)[0])! + scale.bandwidth() / 2;

        const modeAxis = d3.path();
        modeAxis.moveTo(start, 0);
        modeAxis.lineTo(end, 0);
        modeAxis.moveTo(start, 0);
        modeAxis.lineTo(start, tickLength);
        modeAxis.moveTo(end, 0);
        modeAxis.lineTo(end, tickLength);
        modeAxis.moveTo((start + end) / 2, 0);
        modeAxis.lineTo((start + end) / 2, -1 * tickLength);

        selection.append("path").attr("d", modeAxis.toString()).attr("stroke", "currentColor");
        selection
            .append("text")
            .attr("x", (start + end) / 2)
            .attr("y", -2 * tickLength - 1)
            .attr("font-size", "14px")
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .text(tickFormat(i));
    }
}

export function outerAxisLeft(scaleList: d3.ScaleBand<number>[], options?: OuterAxisOptions) {
    return (selection: d3.Selection<SVGGElement, unknown, null, undefined>) =>
        drawAxisLeft(selection, scaleList, options);
}

function drawAxisLeft(
    selection: d3.Selection<SVGGElement, unknown, null, undefined>,
    scaleList: d3.ScaleBand<number>[],
    options?: OuterAxisOptions
) {
    const tickFormat = options?.tickFormat ?? ((i) => i.toString());
    const tickLength = options?.tickLength ?? 6;

    for (let i = 0; i < scaleList.length; i++) {
        const scale = scaleList[i];

        const start = scale(scale.domain()[0])! + scale.bandwidth() / 2;
        const end = scale(scale.domain().slice(-1)[0])! + scale.bandwidth() / 2;

        const modeAxis = d3.path();
        modeAxis.moveTo(0, start);
        modeAxis.lineTo(0, end);
        modeAxis.moveTo(0, start);
        modeAxis.lineTo(tickLength, start);
        modeAxis.moveTo(0, end);
        modeAxis.lineTo(0 + tickLength, end);
        modeAxis.moveTo(0, (start + end) / 2);
        modeAxis.lineTo(-1 * tickLength, (start + end) / 2);

        selection.append("path").attr("d", modeAxis.toString()).attr("stroke", "currentColor");
        selection
            .append("text")
            .attr("x", -2 * tickLength - 1)
            .attr("y", (start + end) / 2)
            .attr("font-size", "14px")
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(tickFormat(i));
    }
}
