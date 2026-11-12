import { useEffect, useId, useRef } from 'react';
import * as d3 from 'd3';
import './GraphCanvas.css';

const colors = { PREREQUISITE: '#0d6efd', NEXT_LEVEL: '#198754', SIMILAR: '#d97706' };
const shorten = (value, length) => { const chars = Array.from(String(value || '')); return chars.length > length ? chars.slice(0, length - 1).join('') + '…' : chars.join(''); };

export default function GraphCanvas({ nodes, edges, rootId = '', selectedId, onSelect }) {
  const svgRef = useRef(null);
  const actions = useRef({});
  const markerPrefix = useId().replace(/:/g, '');
  useEffect(() => {
    const svg = d3.select(svgRef.current); svg.selectAll('*').remove();
    const width = 980, height = 620;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    if (!nodes.length) return undefined;
    const defs = svg.append('defs');
    Object.entries(colors).forEach(([type, color]) => defs.append('marker').attr('id', `${markerPrefix}-${type}`).attr('viewBox', '0 -5 10 10').attr('refX', 19).attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto').append('path').attr('d', 'M0,-5L10,0L0,5').attr('fill', color));
    const canvas = svg.append('g');
    const zoom = d3.zoom().scaleExtent([0.08, 4]).on('zoom', event => canvas.attr('transform', event.transform));
    svg.call(zoom);
    const data = nodes.map(node => ({ ...node }));
    const links = edges.slice(0, 2000).map(edge => ({ source: String(edge.from_question_id), target: String(edge.to_question_id), type: edge.edge_type }));
    const lines = canvas.append('g').attr('stroke-opacity', 0.7).selectAll('line').data(links).join('line').attr('stroke', d => colors[d.type]).attr('stroke-width', 1.6).attr('stroke-dasharray', d => d.type === 'SIMILAR' ? '5,4' : null).attr('marker-end', d => `url(#${markerPrefix}-${d.type})`);
    const group = canvas.append('g').selectAll('g').data(data).join('g').attr('data-question-id', d => d.question_id).attr('tabindex', 0).attr('role', 'button').attr('aria-label', d => `${d.question_id} ${d.title}`).style('cursor', 'pointer').on('click', (_, d) => onSelect(String(d.question_id))).on('keydown', (event, d) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(String(d.question_id)); } });
    group.append('title').text(d => `${d.question_id}\n${d.title}\n${d.tags || ''}`);
    group.append('circle').attr('r', d => String(d.question_id) === String(rootId) ? 18 : 13).attr('fill', d => ({ 简单: '#d1e7dd', 中等: '#fff3cd', 困难: '#f8d7da' }[d.difficulty] || '#e9ecef')).attr('stroke', '#697787').attr('stroke-width', 1.2);
    group.append('text').attr('text-anchor', 'middle').attr('y', 29).attr('font-size', 10).attr('class', 'graph-node-label').text(d => shorten(d.question_id, 17));
    group.append('text').attr('text-anchor', 'middle').attr('y', 44).attr('font-size', 10).attr('class', 'graph-node-label graph-node-title').text(d => shorten(d.title, 18));
    const draw = () => { lines.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y); group.attr('transform', d => `translate(${d.x},${d.y})`); };
    const simulation = d3.forceSimulation(data).force('link', d3.forceLink(links).id(d => d.question_id).distance(145).strength(0.35)).force('charge', d3.forceManyBody().strength(-450)).force('center', d3.forceCenter(width / 2, height / 2)).force('collision', d3.forceCollide(57)).on('tick', draw).stop();
    simulation.tick(130); draw();
    const fit = () => {
      const xs = d3.extent(data, d => d.x), ys = d3.extent(data, d => d.y);
      const scale = Math.min(1.4, width / (xs[1] - xs[0] + 180), height / (ys[1] - ys[0] + 150));
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - scale * (xs[0] + xs[1]) / 2, height / 2 - scale * (ys[0] + ys[1]) / 2).scale(scale));
    };
    fit();
    group.call(d3.drag().clickDistance(4).on('start', (_event, d) => { d.fx = d.x; d.fy = d.y; }).on('drag', (event, d) => { simulation.alphaTarget(0.2).restart(); d.fx = event.x; d.fy = event.y; }).on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }));
    actions.current = { fit, zoom: factor => svg.call(zoom.scaleBy, factor) };
    return () => { simulation.stop(); actions.current = {}; svg.on('.zoom', null); };
  }, [nodes, edges, rootId, onSelect, markerPrefix]);
  useEffect(() => { d3.select(svgRef.current).selectAll('g[data-question-id] circle').attr('stroke', d => String(d.question_id) === String(selectedId) ? '#263240' : '#697787').attr('stroke-width', d => String(d.question_id) === String(selectedId) ? 3 : 1.2); }, [selectedId, nodes, edges]);
  return <div className="graph-canvas"><div className="graph-canvas-tools"><button type="button" aria-label="放大图谱" onClick={() => actions.current.zoom?.(1.3)}>＋</button><button type="button" aria-label="缩小图谱" onClick={() => actions.current.zoom?.(0.77)}>−</button><button type="button" onClick={() => actions.current.fit?.()}>适应画布</button></div><svg ref={svgRef} aria-label="题目关系图，节点可点击或使用键盘选择" />{edges.length > 2000 && <p className="graph-canvas-notice">关联较多，已简化连线。可筛选关系类型或降低深度查看。</p>}</div>;
}
