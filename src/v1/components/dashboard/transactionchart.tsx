import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface ChartData {
    day: string;
    value: number;
    amount: string;
}

interface TransactionChartProps {
    data: ChartData[];
    height?: number;
}

export default function TransactionChart({ data, height = 200 }: TransactionChartProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear before re-render

        const width = svgRef.current.clientWidth;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const x = d3
            .scaleBand()
            .domain(data.map(d => d.day))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        // Ensure the y-domain has a non-zero max so the 0 line doesn't collapse to the middle
        const rawMax = d3.max(data, d => d.value) ?? 0;
        const maxY = Math.max(1, rawMax);

        const y = d3
            .scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const tooltip = d3
            .select("body")
            .append("div")
            .style("position", "absolute")
            .style("background", "white")
            .style("padding", "6px 10px")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("opacity", 0);

        // Gridlines (draw before bars so they sit behind)
        // Horizontal grid lines for y-axis
        const hGrid = svg
            .append("g")
            .attr("class", "grid horizontal")
            .attr("transform", `translate(${margin.left},0)`)
            .call(
                d3
                    .axisLeft(y)
                    .tickSize(-(width - margin.left - margin.right))
                    .tickFormat(() => "")
            )
            .call(g => g.select(".domain").remove()); // remove domain so no left/right extra border

        // style horizontal lines, hide the topmost so there's no top border
        hGrid
            .selectAll("line")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.06)
            .attr("shape-rendering", "crispEdges")
            .filter((_, i) => i === 0)
            .attr("stroke-opacity", 0);

        // Vertical grid lines for x-axis (subtle)
        const vGrid = svg
            .append("g")
            .attr("class", "grid vertical")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(
                d3
                    .axisBottom(x)
                    .tickSize(-(height - margin.top - margin.bottom))
                    .tickFormat(() => "")
            )
            .call(g => g.select(".domain").remove());

        // style vertical lines, hide the rightmost so there's no right border
        const vLines = vGrid.selectAll("line");
        const vCount = vLines.size();
        vLines
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.02)
            .attr("shape-rendering", "crispEdges");
        vLines.filter((_, i) => i === vCount - 1).attr("stroke-opacity", 0);

        svg
            .append("g")
            .selectAll("rect")
            // Only create bars for values > 0 to avoid tiny artifacts when value is zero
            .data(data.filter(d => d.value > 0))
            .enter()
            .append("path")
            .attr("d", d => {
                const barWidth = x.bandwidth();
                const barHeight = y(0) - y(d.value);
                const cornerRadius = 12;
                const xPos = x(d.day)!;
                const yPos = y(d.value);

                return `
                    M${xPos},${yPos + cornerRadius}
                    Q${xPos},${yPos} ${xPos + cornerRadius},${yPos}
                    H${xPos + barWidth - cornerRadius}
                    Q${xPos + barWidth},${yPos} ${xPos + barWidth},${yPos + cornerRadius}
                    V${yPos + barHeight}
                    H${xPos}
                    Z
                `;
            })
            .attr("fill", "#0C4592")
            .on("mouseover", function (_event, d) {
                d3.select(this).attr("fill", "#0C4592");
                tooltip
                    .style("opacity", 1)
                    .html(`<strong>${d.day}</strong><br/>${d.amount} traded`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 20 + "px");
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "#0C4592");
                tooltip.style("opacity", 0);
            });

        // X axis
        svg
            .append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        // Y axis
        svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));

        return () => {
            tooltip.remove(); // Remove tooltip on cleanup
        };
    }, [data, height]);

    return (
        <svg ref={svgRef} width="100%" height={height} />
    );
}
