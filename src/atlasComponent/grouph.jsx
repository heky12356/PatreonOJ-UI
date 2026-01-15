import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ data, highlightedNodes = [], onNodeClick }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [nodesData, setNodesData] = useState([]);
    const [size, setSize] = useState({ width: 1200, height: 600 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateSize = () => {
            const w = Math.max(320, el.clientWidth || 0);
            const h = Math.max(420, el.clientHeight || 0, Math.round(w * 0.6));
            setSize(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
        };

        updateSize();

        if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => updateSize());
            ro.observe(el);
            return () => ro.disconnect();
        }

        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

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

        const width = size.width;
        const height = size.height;

        const getDifficultyColor = (difficulty) => {
            switch (difficulty) {
                case '简单': return '#1890ff';
                case '中等': return '#52c41a';
                case '困难': return '#f5222d';
                default: return '#d9d9d9';
            }
        };

        const getRelationColor = (relationType) => {
            switch (relationType) {
                case 'HAS_SKILL': return '#722ed1';
                case 'SKILL_CO_OCCUR': return '#eb2f96';
                case 'SKILL_SUBSUMES': return '#2f54eb';
                case 'PREREQUISITE': return '#13c2c2';
                case 'NEXT':
                case 'NEXT_LEVEL': return '#52c41a';
                case 'RELATED': return '#fa8c16';
                case 'SIMILAR': return '#8c8c8c';
                default: return '#999';
            }
        };

        const getNodeColor = (d) => {
            if (d.isHighlighted) return '#faad14'; // 高亮节点用金色
            if (d.node_type === 'skill' || String(d.id).startsWith('S:')) return '#722ed1'; // 技能节点紫色
            return getDifficultyColor(d.difficulty);
        };

        // 创建链接副本
        const links = data.links.map(d => ({ ...d }));

        // 创建力导向模拟
        const simulation = d3.forceSimulation(initialNodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(0.3))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40));

        // 创建 SVG 容器
        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: 100%;")
            .call(d3.zoom()
                .scaleExtent([0.1, 4])
                .on("zoom", function(event) {
                    svg.select("g.graph-container").attr("transform", event.transform);
                })
            );

        // 创建图形容器组
        const container = svg.append("g").attr("class", "graph-container");

        // 定义箭头
        const defs = container.append("defs");
        const arrowTypes = ['HAS_SKILL', 'PREREQUISITE', 'NEXT', 'RELATED', 'SIMILAR', 'SKILL_CO_OCCUR', 'SKILL_SUBSUMES', 'default'];
        
        arrowTypes.forEach(type => {
            defs.append("marker")
                .attr("id", `arrowhead-${type}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 25)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", getRelationColor(type === 'default' ? '' : type));
        });

        const link = container.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => getRelationColor(d.relation_type))
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", d => `url(#arrowhead-${d.relation_type || 'default'})`);

        const linkLabels = container.append("g")
            .selectAll("text")
            .data(links)
            .join("text")
            .text(d => d.relation_type || '')
            .attr("font-size", 8)
            .attr("fill", d => getRelationColor(d.relation_type))
            .attr("text-anchor", "middle")
            .attr("dy", -4)
            .style("pointer-events", "none")
            .style("user-select", "none")
            .style("opacity", 0.8);

        // 节点容器
        const nodeGroup = container.append("g")
            .selectAll(".node")
            .data(initialNodes)
            .join("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", function(event, d) {
                if (onNodeClick) {
                    onNodeClick(d);
                }
            });

        // 绘制节点形状：Skills用矩形，Questions用圆形
        nodeGroup.each(function(d) {
            const el = d3.select(this);
            const color = getNodeColor(d);
            const isSkill = d.node_type === 'skill' || String(d.id).startsWith('S:');
            
            if (isSkill) {
                el.append("rect")
                    .attr("width", 40)
                    .attr("height", 40)
                    .attr("x", -20)
                    .attr("y", -20)
                    .attr("rx", 6) // 圆角矩形
                    .attr("ry", 6)
                    .attr("fill", color)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);
            } else {
                el.append("circle")
                    .attr("r", 20)
                    .attr("fill", color)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 2);
            }
        });

        // 添加节点标签
        nodeGroup.append("text")
            .text(d => {
                const isSkill = d.node_type === 'skill' || String(d.id).startsWith('S:');
                if (isSkill) {
                    // 技能显示Title（中文名）
                    return d.title || String(d.id).replace(/^S:/, '');
                }
                // 题目显示题号
                return d.question_number || String(d.id).replace(/^Q:/, '');
            })
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .style("pointer-events", "none");

        // 添加悬停提示 (Title)
        nodeGroup.append("title")
            .text(d => {
                const isSkill = d.node_type === 'skill' || String(d.id).startsWith('S:');
                if (isSkill) {
                     return `技能: ${d.title || d.skill_key}\nID: ${d.id}`;
                }
                return `${d.question_number}: ${d.title}\n难度: ${d.difficulty || '未知'}\n标签: ${d.tags || '无'}`;
            });

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            linkLabels
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2);

            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
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
    }, [data, highlightedNodes, onNodeClick, size.width, size.height]); // 添加onNodeClick到依赖项

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default ForceDirectedGraph;