import { Paper, Slider, Stack, Switch, Typography } from "@mui/material";
import * as d3 from "d3";
import React, { createRef, RefObject, useEffect, useRef, useState } from "react";

import {
    drawCoreLabels,
    formatFloat,
    outerAxisLeft,
    outerAxisTop,
    removeAxisPath,
} from "./d3-utils/common";
import { hstackSvg, saveSvg } from "./d3-utils/saveSvg";
import { useContextMenu } from "./react-utils/contextMenu";
import { ColorBarInfo } from "./react-utils/types";
import { TTcore, TTfig, TTmat } from "./tensortrain/TT";
import { tryRefs } from "./utilities/functional";
import { vscode } from "./utilities/vscode";

function renderCore(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    body: d3.Selection<SVGGElement, unknown, null, undefined>,
    tooltip: d3.Selection<HTMLDivElement, unknown, null, undefined>,
    core: TTcore,
    fig: TTfig,
    color: ColorBarInfo
) {
    // SVG領域を設定
    const width = 70 * core.matShape.x,
        height = 70 * core.matShape.y;

    const outerTickDistance = {
        x: -30,
        y: core.innerShape.y >= 10 ? -60 : -50,
    };

    const labelDistance = {
        x: fig.outerTicksExist.x ? -80 : -40,
        y: fig.outerTicksExist.y ? -115 : -40,
    };

    const margin = {
        top: 100,
        right: 50,
        bottom: 50,
        left: fig.outerTicksExist.y ? 130 : 80,
    };

    svg.attr("width", width + margin.left + margin.right);
    svg.attr("height", height + margin.top + margin.bottom);

    // x軸、y軸のスケールを作成
    const xScaleList: d3.ScaleBand<number>[] = [];
    const yScaleList: d3.ScaleBand<number>[] = [];

    const blockWidth = width / core.outerShape.x,
        blockHeight = height / core.outerShape.y,
        blockPadding = 0.5;

    for (let i = 0; i < core.outerShape.x; i++) {
        const scale = d3
            .scaleBand<number>()
            .range([i * blockWidth + blockPadding, (i + 1) * blockWidth - blockPadding])
            .domain(d3.range(core.innerShape.x))
            .padding(0.1);

        xScaleList.push(scale);
    }

    for (let i = 0; i < core.outerShape.y; i++) {
        const scale = d3
            .scaleBand<number>()
            .range([i * blockHeight + blockPadding, (i + 1) * blockHeight - blockPadding])
            .domain(d3.range(core.innerShape.y))
            .padding(0.1);

        yScaleList.push(scale);
    }

    // 軸目盛を描画
    for (let i = 0; i < xScaleList.length; i++) {
        const xAxis = body
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.axisTop(xScaleList[i]).tickFormat((i) => fig.innerTicks(i).x));

        removeAxisPath(xAxis);
        xAxis.selectAll(".tick text").attr("font-size", "14");
    }

    for (let i = 0; i < yScaleList.length; i++) {
        const yAxis = body
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.axisLeft(yScaleList[i]).tickFormat((i) => fig.innerTicks(i).y));

        yAxis.selectAll(".tick text").attr("font-size", "14");
        removeAxisPath(yAxis);
    }

    // ブロックの軸を描画
    if (fig.outerTicksExist.x) {
        body.append("g")
            .attr("class", "label")
            .attr(
                "transform",
                "translate(" + margin.left + "," + (margin.top + outerTickDistance.x) + ")"
            )
            .call(outerAxisTop(xScaleList, { tickFormat: (i) => fig.outerTicks(i).x! }));
    }

    if (fig.outerTicksExist.y) {
        body.append("g")
            .attr("class", "label")
            .attr(
                "transform",
                "translate(" + (margin.left + outerTickDistance.y) + "," + margin.top + ")"
            )
            .call(outerAxisLeft(yScaleList, { tickFormat: (i) => fig.outerTicks(i).y! }));
    }

    // 軸ラベルを描画
    const xLabelAxis = body
        .append("g")
        .attr("class", "label")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const yLabelAxis = body
        .append("g")
        .attr("class", "label")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    drawCoreLabels(fig, xLabelAxis, yLabelAxis, { width, height }, labelDistance);

    const heatmap = body
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const indexStore = d3.local();

    const cell = heatmap
        .selectAll()
        .data(core.vec)
        .enter()
        .append("g")
        .attr("transform", (d, i) => {
            const x = xScaleList[core.idx2outerSub(i).x](core.idx2innerSub(i).x)!;
            const y = yScaleList[core.idx2outerSub(i).y](core.idx2innerSub(i).y)!;
            return `translate(${x}, ${y})`;
        });

    cell.append("rect")
        .attr("class", "cell")
        .attr("id", (d, i) => "cell-" + i)
        .attr("width", (d, i) => xScaleList[core.idx2outerSub(i).x].bandwidth())
        .attr("height", (d, i) => yScaleList[core.idx2outerSub(i).y].bandwidth())
        .attr("opacity", 0.5)
        .attr("fill", (d) => color.color(d));

    cell.append("text")
        .attr("class", (d) => (-1e-3 < d && d < 1e-3 ? "sparse" : ""))
        .attr("id", (d, i) => "annot-" + i)
        .attr("dx", (d, i) => xScaleList[core.idx2outerSub(i).x].bandwidth() / 2)
        .attr("dy", (d, i) => yScaleList[core.idx2outerSub(i).y].bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text((d) => formatFloat(d, 3));

    cell.each(function (d, i) {
        indexStore.set(this, i);
    })
        .on("mouseover", function () {
            const sub = core.idx2origSub(indexStore.get(this) as number);
            const html = fig.formatTip(sub);
            tooltip.style("visibility", "visible").html(html);
        })
        .on("mousemove", (event) => {
            tooltip.style("top", `${event.pageY - 10}px`).style("left", `${event.pageX + 20}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
}

type CoreDetailProps = {
    tt: TTmat;
    index: number | null;
    colorInfo: ColorBarInfo;
};

const CoreDetail: React.FC<CoreDetailProps> = ({ tt, index, colorInfo }) => {
    const [zoom, setZoom] = useState<number>(100);
    const [sparse, setSparse] = useState(false);

    const refs = useRef<RefObject<SVGSVGElement>[]>([]);
    const tipRef = useRef<HTMLDivElement>(null);

    tt.cores.forEach((_, index) => {
        refs.current[index] = createRef<SVGSVGElement>();
    });

    useEffect(() => {
        const svgs = tryRefs(refs.current);
        if (svgs === null) {
            return;
        }

        if (tipRef.current === null) {
            return;
        }
        const tip = d3.select(tipRef.current);

        setZoom(100);

        for (let i = 0; i < tt.cores.length; i++) {
            const [core, fig] = tt.cores[i];

            const svg = d3.select(svgs[i]);
            svg.selectChildren().remove();

            const zoomLayer = svg.append("g").attr("id", "zoom-layer");
            const body = zoomLayer.append("g").attr("id", "svg-body");
            renderCore(svg, body, tip, core, fig, colorInfo);
        }
    }, [tt]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSparse(event.target.checked);
    };

    useEffect(() => {
        const svgs = tryRefs(refs.current);
        if (svgs === null) {
            return;
        }

        for (const svg of svgs) {
            if (sparse) {
                d3.select(svg).selectAll(".sparse").attr("display", "none");
            } else {
                d3.select(svg).selectAll(".sparse").attr("display", "inline");
            }
        }
    }, [sparse]);

    const handleZoom = (event: Event, newValue: number | number[]) => {
        setZoom(newValue as number);
    };

    useEffect(() => {
        const svgs = tryRefs(refs.current);
        if (svgs === null) {
            return;
        }

        for (const ref of svgs) {
            const svg = d3.select(ref).select("#zoom-layer");
            const width = Number(svg.attr("width"));
            const height = Number(svg.attr("height"));
            const dx = width / 2;
            const dy = height / 2;
            const zoomRate = zoom / 100;

            svg.attr(
                "transform",
                `translate(${-1 * dx},${-1 * dy}) scale(${zoomRate}) translate(${dx},${dy})`
            );
        }
    }, [zoom]);

    const [ContextMenu, onRightClick] = useContextMenu();

    const handleContextMenu = async (event: React.MouseEvent<HTMLElement>) => {
        const result = await onRightClick(event);
        if (result === null) return;

        if (result === "Save SVG") {
            if (index === null) return;

            const svgs = tryRefs(refs.current);
            if (svgs === null) {
                return;
            }

            const dummy = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            hstackSvg([svgs[index]], dummy, "svg-body");
            const svgData = saveSvg(dummy);
            vscode.postMessage({ type: "saveSvg", body: svgData });
            dummy.remove();
        }
    };

    return (
        <div style={{ display: index === null ? "none" : "inline" }}>
            <Typography variant="h4">Core{index !== null ? index + 1 : ""} Detail</Typography>
            <Stack direction="row" spacing={5}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">Sparse mode</Typography>
                    <Switch checked={sparse} onChange={handleChange} />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body1">Zoom</Typography>
                    <Slider value={zoom} onChange={handleZoom} style={{ width: 100 }} />
                </Stack>
            </Stack>
            <div onContextMenu={handleContextMenu}>
                {tt.cores.map((_, i) => (
                    <svg
                        ref={refs.current[i]}
                        key={i}
                        style={{ display: index === i ? "inline" : "none" }}
                    />
                ))}
            </div>
            <ContextMenu values={["Save SVG"]} />
            <Paper
                id="tooltip"
                ref={tipRef}
                elevation={4}
                style={{
                    position: "absolute",
                    paddingTop: 5,
                    paddingBottom: 5,
                    paddingLeft: 5,
                    paddingRight: 5,
                }}
            />
        </div>
    );
};

export default CoreDetail;
