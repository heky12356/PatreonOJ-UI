import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ data, highlightedNodes = [] }) => {
    const svgRef = useRef();
    const [nodesData, setNodesData] = useState([]);

    useEffect(() => {
        if (!data) return;

        // 初始化节点数据，添加一个isHighlighted属性
        const initialNodes = data.nodes.map(node => ({
            ...node,
            isHighlighted: highlightedNodes.includes(node.id)
        }));
        setNodesData(initialNodes);

        // 清理之前的图表
        while (svgRef.current.firstChild) {
            svgRef.current.removeChild(svgRef.current.firstChild);
        }

        // 指定图表的尺寸
        const width = 928;
        const height = 500;

        // 指定颜色比例尺
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // 创建链接副本
        const links = data.links.map(d => ({ ...d }));

        // 创建力导向模拟
        const simulation = d3.forceSimulation(initialNodes)
            .force("link", d3.forceLink(links).id(d => d.id))
            .force("charge", d3.forceManyBody().strength(-600))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // 创建 SVG 容器
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // 添加链接线
        const link = svg.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value));

        // 添加节点圆 - 修改颜色逻辑
        const node = svg.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(initialNodes)
            .join("circle")
            .attr("r", 20)
            .attr("fill", d => d.isHighlighted ? color(d.group) : "#ccc"); // 高亮节点用原色，否则灰色

        // 添加节点标题
        node.append("title")
            .text(d => d.id);

        // 添加拖拽行为
        node.call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

        // 每次模拟 tick 时更新位置
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // 拖拽函数
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        // 组件卸载时停止模拟
        return () => {
            simulation.stop();
        };
    }, [data, highlightedNodes]); // 添加highlightedNodes到依赖项

    return <svg ref={svgRef} />;
};

export default ForceDirectedGraph;