import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Badge, Button, Form, Spinner } from 'react-bootstrap';
import GraphCanvas from '../../components/graph/GraphCanvas.jsx';
import { getGraphTags, getTagGraph } from '../../api/learning.js';
import './KnowledgeGraphPage.css';

const types = { PREREQUISITE: '前置依赖', NEXT_LEVEL: '进阶路径', SIMILAR: '同类扩展' };
const initialTypes = Object.keys(types);

export default function KnowledgeGraphPage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') || '';
  const query = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [tags, setTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [problemSearch, setProblemSearch] = useState(query);
  const [tagError, setTagError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [graph, setGraph] = useState(null);
  const [enabled, setEnabled] = useState(initialTypes);
  const [selectedId, setSelectedId] = useState('');
  const [view, setView] = useState('graph');
  useEffect(() => {
    const abort = new AbortController(); setCatalogLoading(true);
    getGraphTags(abort.signal).then(setTags).catch(e => { if (e.name !== 'AbortError') setTagError(e.message); }).finally(() => { if (!abort.signal.aborted) setCatalogLoading(false); });
    return () => abort.abort();
  }, []);
  useEffect(() => { setProblemSearch(query); }, [query]);
  useEffect(() => {
    const abort = new AbortController(); setGraph(null); setSelectedId(''); setError('');
    if (!tag) { setLoading(false); return () => abort.abort(); }
    setLoading(true);
    getTagGraph({ tag, q: query, page, signal: abort.signal }).then(data => { setGraph(data); setSelectedId(data.nodes?.[0]?.question_id || ''); }).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [tag, query, page, refresh]);
  const filteredTags = useMemo(() => tags.filter(item => item.name.toLowerCase().includes(tagSearch.trim().toLowerCase())), [tags, tagSearch]);
  const nodes = graph?.nodes || [];
  const edges = useMemo(() => (graph?.edges || []).filter(edge => enabled.includes(edge.edge_type)), [graph, enabled]);
  const selected = nodes.find(node => node.question_id === selectedId);
  const updatePage = (nextPage) => setParams({ tag, ...(query ? { q: query } : {}), page: String(nextPage) });
  return <main className="knowledge-page">
    <header className="knowledge-heading"><div><span className="knowledge-kicker">KNOWLEDGE EXPLORER</span><h1>知识图谱</h1><p>从知识点出发，查看题目之间的关联，再沿着单题图谱继续探索。</p></div><Badge bg="light" text="dark">{tags.length} 个知识点</Badge></header>
    {tagError && <Alert variant="danger">{tagError}</Alert>}
    <section className="knowledge-topics" aria-labelledby="knowledge-topics-heading"><div className="knowledge-topic-heading"><h2 id="knowledge-topics-heading">选择知识点</h2><Form.Control aria-label="搜索知识点" placeholder="搜索标签，如前缀和、动态规划…" value={tagSearch} onChange={e => setTagSearch(e.target.value)} /></div>{catalogLoading ? <Spinner size="sm" /> : <div className="knowledge-tag-list">{filteredTags.map(item => <button type="button" key={item.name} title={item.name} aria-pressed={tag === item.name} className={tag === item.name ? 'selected' : ''} onClick={() => setParams({ tag: item.name })}><span>{item.name}</span><small>{item.question_count}</small></button>)}</div>}{!catalogLoading && filteredTags.length === 0 && <p className="knowledge-muted">没有匹配的知识点。</p>}</section>
    {!tag ? <section className="knowledge-welcome"><span className="bi bi-diagram-3" aria-hidden="true" /><h2>选择一个知识点开始探索</h2><p>节点代表题目，连线表示前置依赖、进阶或同类关系。这里只展示当前标签内的题目，单题图谱可以继续查看跨标签关联。</p></section> : <>
      <section className="knowledge-toolbar"><div><h2>{tag}</h2><p>{graph ? `本知识点 ${graph.tag_question_count} 道题，当前显示 ${nodes.length} 个节点` : '正在读取关联题目…'}</p></div><form onSubmit={e => { e.preventDefault(); setParams({ tag, ...(problemSearch.trim() ? { q: problemSearch.trim() } : {}) }); }}><Form.Control aria-label="在子图谱中搜索题目" maxLength={200} value={problemSearch} onChange={e => setProblemSearch(e.target.value)} placeholder="按题号或标题筛选" /><Button type="submit" variant="outline-secondary">筛选</Button></form><Button variant="outline-secondary" onClick={() => setRefresh(value => value + 1)} disabled={loading}>刷新</Button></section>
      {error && <Alert variant="danger">{error}</Alert>}
      {graph?.truncated && <Alert variant="info">当前展示部分题目与关联，可使用题目筛选或翻页查看其他部分。</Alert>}
      <div className="knowledge-controls"><div className="knowledge-type-filters">{Object.entries(types).map(([type, text]) => <Form.Check inline key={type} id={`knowledge-type-${type}`} label={text} checked={enabled.includes(type)} onChange={e => setEnabled(old => e.target.checked ? [...old, type] : old.filter(value => value !== type))} />)}</div><div className="knowledge-view-switch"><Button size="sm" variant={view === 'graph' ? 'primary' : 'outline-secondary'} onClick={() => setView('graph')}>关系图</Button><Button size="sm" variant={view === 'list' ? 'primary' : 'outline-secondary'} onClick={() => setView('list')}>题目列表</Button></div></div>
      {loading ? <div className="knowledge-loading"><Spinner size="sm" /> 正在生成子图谱…</div> : graph && <div className="knowledge-layout"><section className={view === 'graph' ? 'knowledge-board' : 'knowledge-problems'} aria-label={view === 'graph' ? '标签子图谱' : '图谱题目列表'}>{nodes.length === 0 ? <p className="knowledge-empty">该筛选条件下暂无已发布题目。</p> : view === 'graph' ? <GraphCanvas nodes={nodes} edges={edges} selectedId={selectedId} onSelect={setSelectedId} /> : nodes.map(node => <button key={node.question_id} className={selectedId === node.question_id ? 'selected' : ''} onClick={() => setSelectedId(node.question_id)}><small title={node.question_id}>{node.question_id}</small><strong>{node.title}</strong><span>{node.difficulty}</span></button>)}</section><aside className="knowledge-detail"><h3>题目详情</h3>{selected ? <><small className="knowledge-question-id">{selected.question_id}</small><h2>{selected.title}</h2><Badge bg="secondary">{selected.difficulty || '练习'}</Badge><p className="knowledge-node-tags">{selected.tags}</p><div className="knowledge-links"><Link to={`/problem/${selected.question_pk}`}>打开题目 <span aria-hidden="true">↗</span></Link><Link to={`/problem/${selected.question_pk}/graph`}>查看单题图谱 <span aria-hidden="true">↗</span></Link></div><p className="knowledge-muted">单题图谱包含当前标签之外的前置题和进阶题。</p></> : <p className="knowledge-muted">选择节点查看题目。</p>}</aside></div>}
      {graph && graph.total_nodes > graph.page_size && <nav className="knowledge-pagination" aria-label="子图谱分页"><Button variant="outline-secondary" disabled={page <= 1 || loading} onClick={() => updatePage(page - 1)}>上一页</Button><span>第 {page} / {Math.max(1, Math.ceil(graph.total_nodes / graph.page_size))} 页</span><Button variant="outline-secondary" disabled={page * graph.page_size >= graph.total_nodes || loading} onClick={() => updatePage(page + 1)}>下一页</Button></nav>}
    </>}
  </main>;
}
