import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ForceDirectedGraph = ({ data, highlightedNodes = [], onNodeClick }) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: null });
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

        // 初始化节点数据
        const initialNodes = data.nodes.map(node => ({
            ...node,
            isHighlighted: highlightedNodes.includes(node.id)
        }));

        // 清理之前的图表
        const svgElement = svgRef.current;
        while (svgElement.firstChild) {
            svgElement.removeChild(svgElement.firstChild);
        }

        const width = size.width;
        const height = size.height;

        // Colors (Original Scheme)
        const getDifficultyColor = (difficulty) => {
            switch (difficulty) {
                case '简单': return '#1890ff'; // Blue
                case '中等': return '#52c41a'; // Green
                case '困难': return '#f5222d'; // Red
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
            if (d.isHighlighted) return '#faad14'; // Gold
            if (d.node_type === 'skill' || String(d.id).startsWith('S:')) return '#722ed1'; // Purple
            return getDifficultyColor(d.difficulty);
        };

        // Create links copy
        const links = data.links.map(d => ({ ...d }));

        // Force Simulation
        const simulation = d3.forceSimulation(initialNodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(100).strength(0.3))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40));

        // SVG Setup
        const svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: 100%;");

        // Defs for shadows and arrows
        const defs = svg.append("defs");
        
        // 柔和的阴影滤镜
        const filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");
        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 2) // 减小模糊，更精致
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 1) // 减小偏移
            .attr("dy", 1)
            .attr("result", "offsetBlur");
        filter.append("feComponentTransfer")
            .append("feFuncA")
            .attr("type", "linear")
            .attr("slope", 0.15); // 降低不透明度，使阴影更浅
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "offsetBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        // Arrow Markers
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

        // Zoom Behavior
        const g = svg.append("g").attr("class", "graph-container");
        svg.call(d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => g.attr("transform", event.transform))
        );

        // Links
        const link = g.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", d => getRelationColor(d.relation_type))
            .attr("stroke-width", d => Math.sqrt(d.value))
            .attr("marker-end", d => `url(#arrowhead-${d.relation_type || 'default'})`);

        // Link Labels
        const linkLabels = g.append("g")
            .selectAll("text")
            .data(links)
            .join("text")
            .text(d => d.relation_type || '')
            .attr("font-size", 8)
            .attr("fill", d => getRelationColor(d.relation_type))
            .attr("text-anchor", "middle")
            .attr("dy", -4)
            .style("pointer-events", "none")
            .style("opacity", 0.8);

        // Nodes
        const nodeGroup = g.append("g")
            .selectAll(".node")
            .data(initialNodes)
            .join("g")
            .attr("class", "node")
            .style("cursor", "pointer")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))
            .on("click", (event, d) => onNodeClick && onNodeClick(d))
            .on("mouseenter", (event, d) => {
                // Determine content based on node type
                const isSkill = d.node_type === 'skill' || String(d.id).startsWith('S:');
                let content;
                if (isSkill) {
                    content = (
                        <div>
                            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{d.title || d.skill_key}</div>
                            <div style={{fontSize: '0.8rem', color: '#ccc'}}>ID: {String(d.id).replace(/^S:/, '')}</div>
                            <div style={{marginTop: '4px', fontSize: '0.75rem', color: '#a0d911'}}>Type: 技能点</div>
                        </div>
                    );
                } else {
                    const diffColor = getDifficultyColor(d.difficulty);
                    content = (
                        <div>
                            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>{d.question_number}: {d.title}</div>
                            <div style={{display:'flex', alignItems:'center', gap:'6px', marginBottom: '4px'}}>
                                <span style={{
                                    display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', 
                                    backgroundColor: diffColor
                                }}></span>
                                <span style={{fontSize: '0.85rem'}}>{d.difficulty}</span>
                            </div>
                            {d.tags && (
                                <div style={{fontSize: '0.75rem', color: '#eee', maxWidth:'200px'}}>
                                    Tags: {d.tags}
                                </div>
                            )}
                        </div>
                    );
                }

                // Show SVG decoration (stroke width increase)
                d3.select(event.currentTarget).selectAll("circle, rect")
                  .transition().duration(200)
                  .attr("stroke", "#fff")
                  .attr("stroke-width", 4);

                setTooltip({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    content
                });
            })
            .on("mousemove", (event) => {
                 setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
            })
            .on("mouseleave", (event) => {
                 d3.select(event.currentTarget).selectAll("circle, rect")
                  .transition().duration(200)
                  .attr("stroke", "#fff")
                  .attr("stroke-width", 2);
                  
                 setTooltip(prev => ({ ...prev, visible: false }));
            });

        // Draw shapes without Drop Shadow
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
                    .attr("rx", 6)
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

        // Node Labels
        nodeGroup.append("text")
            .text(d => {
                const isSkill = d.node_type === 'skill' || String(d.id).startsWith('S:');
                if (isSkill) return d.title || String(d.id).replace(/^S:/, '');
                return d.question_number || String(d.id).replace(/^Q:/, '');
            })
            .attr("font-size", "11px")
            .attr("font-weight", "600")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .style("pointer-events", "none")
            .style("text-shadow", "0 1px 2px rgba(0,0,0,0.5)"); // Better text readability

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

        return () => simulation.stop();
    }, [data, highlightedNodes, onNodeClick, size]);

    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg ref={svgRef} />
            
            {/* Custom Tooltip */}
            {tooltip.visible && (
                <div style={{
                    position: 'fixed',
                    top: tooltip.y - 10,
                    left: tooltip.x + 15,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)', // Darker background
                    color: 'white',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    maxWidth: '320px',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)' // Subtle border for contrast
                }}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
};

export default ForceDirectedGraph;