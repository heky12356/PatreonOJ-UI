import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ data, highlightedNodes = [], onNodeClick }) => {
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
        const width = 1200;
        const height = 600;

        // 指定颜色比例尺 - 根据难度设置颜色
        const getDifficultyColor = (difficulty) => {
            switch (difficulty) {
                case '简单': return '#1890ff';
                case '中等': return '#52c41a';
                case '困难': return '#f5222d';
                default: return '#d9d9d9';
            }
        };

        // 创建链接副本
        const links = data.links.map(d => ({ ...d }));

        // 创建力导向模拟
        const simulation = d3.forceSimulation(initialNodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(80).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(30));

        // 创建 SVG 容器
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;")
            .call(d3.zoom()
                .scaleExtent([0.1, 4])
                .on("zoom", function(event) {
                    svg.select("g.graph-container").attr("transform", event.transform);
                })
            );

        // 创建图形容器组
        const container = svg.append("g").attr("class", "graph-container");

        // 添加链接线
        const link = container.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", "url(#arrowhead)"); // 添加箭头

        // 添加箭头标记
        container.append("defs").append("marker")
            .attr("id", "arrowhead")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#999");

        // 添加节点圆 - 修改颜色逻辑
        const node = container.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .selectAll("circle")
            .data(initialNodes)
            .join("circle")
            .attr("r", 20)
            .attr("fill", d => {
                if (d.isHighlighted) {
                    return '#faad14'; // 高亮节点用金色
                }
                return getDifficultyColor(d.difficulty);
            })
            .style("cursor", "pointer");

        // 添加节点标签
        const labels = container.append("g")
            .selectAll("text")
            .data(initialNodes)
            .join("text")
            .text(d => d.question_number || d.id)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        // 添加节点标题（悬停提示）
        node.append("title")
            .text(d => `${d.question_number || d.id}: ${d.title || d.id}\n难度: ${d.difficulty || '未知'}\n标签: ${d.tags || '无'}`);

        // 添加点击事件
        node.on("click", function(event, d) {
            if (onNodeClick) {
                onNodeClick(d); // 传递完整的节点对象
            }
        });

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

            labels
                .attr("x", d => d.x)
                .attr("y", d => d.y);
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
    }, [data, highlightedNodes, onNodeClick]); // 添加onNodeClick到依赖项

    return <svg ref={svgRef} />;
};

export default ForceDirectedGraph;