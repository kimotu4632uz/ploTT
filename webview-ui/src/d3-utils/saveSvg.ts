import * as d3 from "d3";

function copyChildren<G extends SVGElement, H extends SVGElement>(
    from: d3.Selection<G, unknown, null, undefined>,
    to: d3.Selection<H, unknown, null, undefined>
) {
    to.html(from.html());
}

export function hstackSvg(svgs: SVGSVGElement[], target: SVGSVGElement, rootId?: string) {
    const svgSelections = svgs.map((svg) => d3.select(svg));
    const targetSelection = d3.select(target);
    targetSelection.selectChildren().remove();

    const areas = svgSelections.map((svg) => ({
        width: parseInt(svg.attr("width")!),
        height: parseInt(svg.attr("height")!),
    }));

    const totalWidth = areas.reduce((acc, area) => acc + area.width, 0);
    const svgPos = areas
        .map((area) => area.width)
        .slice(0, -1)
        .reduce(
            (acc, width) => {
                acc.push(acc[acc.length - 1] + width);
                return acc;
            },
            [0]
        );

    const maxHeight = Math.max(...areas.map((area) => area.height));

    targetSelection.attr("width", totalWidth).attr("height", maxHeight);

    for (let i = 0; i < svgSelections.length; i++) {
        const g = targetSelection.append("g").attr("transform", `translate(${svgPos[i]}, 0)`);

        if (rootId === undefined) {
            copyChildren(svgSelections[i], g);
        } else {
            const body = svgSelections[i].select(`#${rootId}`).node();
            if (body === null || !(body instanceof SVGElement)) {
                return;
            } else {
                copyChildren(d3.select(body), g);
            }
        }
    }
}

export function saveSvg(svg: SVGSVGElement) {
    return new XMLSerializer().serializeToString(svg);
}
