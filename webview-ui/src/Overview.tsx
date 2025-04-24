import { Stack } from "@mui/material";
import * as d3 from "d3";
import React, { createRef, RefObject, useEffect, useRef } from "react";

import { drawCoreLabels, modifyScaleBand, removeAxisPath } from "./d3-utils/common";
import { hstackSvg, saveSvg } from "./d3-utils/saveSvg";
import { useContextMenu } from "./react-utils/contextMenu";
import { Area, ColorBarInfo } from "./react-utils/types";
import { TTcore, TTfig, TTmat } from "./tensortrain/TT";
import { tryRefs } from "./utilities/functional";
import { vscode } from "./utilities/vscode";

function renderCore(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    core: TTcore,
    fig: TTfig,
    area: Area,
    color: ColorBarInfo
) {
    const margin = { top: 50, right: 30, bottom: 60, left: 50 };
    const figArea: Area = {
        width: area.width - margin.left - margin.right,
        height: area.height - margin.top - margin.bottom,
    };

    const originalXScale = d3
        .scaleBand<number>()
        .range([0, figArea.width])
        .domain(d3.range(core.matShape.x))
        .paddingInner(0.1)
        .paddingOuter(0);
    const xScale = modifyScaleBand(originalXScale);

    const originalYScale = d3
        .scaleBand<number>()
        .range([0, figArea.height])
        .domain(d3.range(core.matShape.y))
        .paddingInner(0.1)
        .paddingOuter(0);
    const yScale = modifyScaleBand(originalYScale);

    const xAxis = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const yAxis = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const labelDistance = { x: -20, y: -30 };

    drawCoreLabels(fig, xAxis, yAxis, figArea, labelDistance);

    const g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll()
        .data(core.vec)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(core.idx2sub(i).x)!)
        .attr("y", (d, i) => yScale(core.idx2sub(i).y)!)
        .attr("class", "cell")
        .attr("id", (d, i) => "cell-" + i)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("opacity", 0.5)
        .attr("fill", (d) => color.color(d));

    svg.append("g")
        .attr("transform", `translate(${margin.left + figArea.width / 2},${area.height - 5})`)
        .append("text")
        .attr("font-size", "24px")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "end")
        .text(`Core ${core.index + 1}`);
}

function makeColorbar(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    area: Area,
    info: ColorBarInfo
) {
    const barWidth = 30;
    const margin = { top: 50, right: 0, bottom: 60, left: 0 };
    const figArea: Area = {
        width: area.width - margin.left - margin.right,
        height: area.height - margin.top - margin.bottom,
    };

    const yScale = d3
        .scaleBand<number>()
        .range([figArea.height, 0])
        .domain(d3.range(figArea.height));

    const axisScale = d3.scaleLinear().range([0, figArea.height]).domain([info.max, info.min]);

    const barAxis = svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + (margin.left + barWidth) + "," + margin.top + ")")
        .call(d3.axisRight(axisScale));

    removeAxisPath(barAxis);

    barAxis.selectAll(".tick text").attr("font-size", "14");

    const g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const data = d3.range(info.min, info.max, (info.max - info.min) / figArea.height);
    g.selectAll()
        .data(data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", (d, i) => yScale(i)!)
        .attr("class", "cell")
        .attr("id", (d, i) => "cell-" + i)
        .attr("width", barWidth)
        .attr("height", yScale.bandwidth())
        .attr("opacity", 0.5)
        .attr("fill", (d) => info.color(d));
}

type OverviewProps = {
    tt: TTmat;
    onClick: (i: number) => void;
    colorInfo: ColorBarInfo;
};

const Overview: React.FC<OverviewProps> = ({ tt, onClick, colorInfo }) => {
    const area: Area = { width: 400, height: 430 };
    const barWidth = 90;

    const refs = useRef<RefObject<SVGSVGElement>[]>([]);

    tt.cores.forEach((_, index) => {
        refs.current[index] = createRef<SVGSVGElement>();
    });
    refs.current[tt.cores.length] = createRef<SVGSVGElement>();

    useEffect(() => {
        const svgs = tryRefs(refs.current);
        if (svgs === null) {
            return;
        }

        for (let i = 0; i < tt.cores.length; i++) {
            const [core, fig] = tt.cores[i];

            const svg = d3.select(svgs[i]);
            svg.selectChildren().remove();
            renderCore(svg, core, fig, area, colorInfo);
        }

        const barRef = svgs[tt.cores.length];

        const svg = d3.select(barRef);
        svg.selectChildren().remove();
        makeColorbar(svg, { width: barWidth, height: area.height }, colorInfo);
    }, [tt]);

    const [ContextMenu, onRightClick] = useContextMenu();

    const handleContextMenu = async (event: React.MouseEvent<HTMLElement>) => {
        const result = await onRightClick(event);
        if (result === null) return;

        if (result === "Save SVG") {
            const svgs = tryRefs(refs.current);
            if (svgs === null) {
                return;
            }

            const dummy = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            hstackSvg(svgs, dummy);
            const svgData = saveSvg(dummy);
            vscode.postMessage({ type: "saveSvg", body: svgData });
            dummy.remove();
        }
    };

    return (
        <div>
            <Stack
                direction="row"
                spacing={2}
                justifyContent="space-around"
                onContextMenu={handleContextMenu}>
                <Stack
                    overflow="auto"
                    direction="row"
                    spacing={2}
                    paddingBottom={3}
                    justifyContent="start">
                    {tt.cores.map((_, i) => (
                        <svg
                            key={i}
                            ref={refs.current[i]}
                            width={area.width}
                            height={area.height}
                            style={{
                                minWidth: area.width,
                            }}
                            onClick={() => onClick(i)}
                        />
                    ))}
                </Stack>
                <svg
                    ref={refs.current[tt.cores.length]}
                    width={barWidth}
                    height={area.height}
                    style={{ minWidth: barWidth }}
                />
            </Stack>
            <ContextMenu values={["Save SVG"]} />
        </div>
    );
};

export default Overview;
