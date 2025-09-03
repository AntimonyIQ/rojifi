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

        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.value)!])
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

        svg
            .append("g")
            .selectAll("rect")
            .data(data)
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
