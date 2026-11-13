import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import GraphCanvas from '../../components/graph/GraphCanvas.jsx';
import { getGraphTags, getTagGraph } from '../../api/learning.js';
import './KnowledgeGraphPage.css';

const types = { PREREQUISITE: '前置依赖', NEXT_LEVEL: '进阶路径', SIMILAR: '同类扩展' };
const initialTypes = Object.keys(types);

export default function KnowledgeGraphPage() {
  const [params, setParams] = useSearchParams();
  const tag = params.get('tag') || '';
  const query = params.get('q') || '';
  const page = Math.max(1, parseInt(params.get('page'), 10) || 1);
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
    const abort = new AbortController();
    getGraphTags(abort.signal).then(setTags).catch(e => { if (e.name !== 'AbortError') setTagError(e.message); }).finally(() => { if (!abort.signal.aborted) setCatalogLoading(false); });
    return () => abort.abort();
  }, []);
  useEffect(() => { if (!tag && tags.length) setParams({ tag: tags[0].name }, { replace: true }); }, [tag, tags, setParams]);
  useEffect(() => { setProblemSearch(query); }, [query]);
  useEffect(() => {
    const abort = new AbortController();
    setGraph(null); setSelectedId(''); setError('');
    if (!tag) { setLoading(false); return () => abort.abort(); }
    setLoading(true);
    getTagGraph({ tag, q: query, page, signal: abort.signal })
      .then(data => { setGraph(data); setSelectedId(data.nodes?.[0]?.question_id || ''); })
      .catch(e => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [tag, query, page, refresh]);

  const filteredTags = useMemo(() => tags.filter(item => item.name.toLowerCase().includes(tagSearch.trim().toLowerCase())), [tags, tagSearch]);
  const nodes = graph?.nodes || [];
  const edges = useMemo(() => (graph?.edges || []).filter(edge => enabled.includes(edge.edge_type)), [graph, enabled]);
  const selected = nodes.find(node => node.question_id === selectedId);
  const updatePage = nextPage => setParams({ tag, ...(query ? { q: query } : {}), page: String(nextPage) });

  return <main className="knowledge-page">
    <header className="knowledge-heading"><h1>知识图谱</h1><span>按知识点查看题目关联</span></header>
    <div className="knowledge-workspace">
      <aside className="knowledge-topics" aria-labelledby="knowledge-topics-heading">
        <div className="knowledge-topic-heading"><h2 id="knowledge-topics-heading">知识点</h2><span>{tags.length}</span></div>
        <div className="knowledge-topic-search"><Form.Control aria-label="搜索知识点" placeholder="搜索知识点" value={tagSearch} onChange={e => setTagSearch(e.target.value)} /></div>
        {tagError && <Alert variant="danger">{tagError}</Alert>}
        {catalogLoading ? <div className="knowledge-topic-loading"><Spinner size="sm" /> 读取中…</div> : <nav className="knowledge-tag-list" aria-label="选择知识点">{filteredTags.map(item => <button type="button" key={item.name} title={item.name} aria-pressed={tag === item.name} className={tag === item.name ? 'selected' : ''} onClick={() => setParams({ tag: item.name })}><span>{item.name}</span><small>{item.question_count}</small></button>)}</nav>}
        {!catalogLoading && filteredTags.length === 0 && <p className="knowledge-no-topics">没有匹配的知识点。</p>}
      </aside>

      <section className="knowledge-content" aria-label="知识点题目关系">
        <div className="knowledge-toolbar">
          <div><h2>{tag || '题目关系'}</h2><p>{graph ? `${graph.tag_question_count} 道题 · 当前 ${nodes.length} 个节点，${edges.length} 条关系` : '正在读取题目…'}</p></div>
          <form onSubmit={e => { e.preventDefault(); setParams({ tag, ...(problemSearch.trim() ? { q: problemSearch.trim() } : {}) }); }}>
            <Form.Control aria-label="在子图谱中搜索题目" maxLength={200} value={problemSearch} onChange={e => setProblemSearch(e.target.value)} placeholder="题号或标题" /><Button type="submit" variant="outline-secondary">筛选</Button>
          </form>
          <Button variant="outline-secondary" onClick={() => setRefresh(value => value + 1)} disabled={loading}>刷新</Button>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {graph?.truncated && <Alert variant="info">当前为部分题目与关系，可筛选或翻页查看。</Alert>}
        <div className="knowledge-controls">
          <div className="knowledge-type-filters">{Object.entries(types).map(([type, text]) => <Form.Check inline key={type} id={`knowledge-type-${type}`} label={text} checked={enabled.includes(type)} onChange={e => setEnabled(old => e.target.checked ? [...old, type] : old.filter(value => value !== type))} />)}</div>
          <div className="knowledge-view-switch"><button type="button" aria-pressed={view === 'graph'} onClick={() => setView('graph')}>关系图</button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>题目列表</button></div>
        </div>
        {loading ? <div className="knowledge-loading"><Spinner size="sm" /> 正在读取图谱…</div> : graph && <div className="knowledge-layout">
          <section className={view === 'graph' ? 'knowledge-board' : 'knowledge-problems'} aria-label={view === 'graph' ? '标签子图谱' : '图谱题目列表'}>
            {nodes.length === 0 ? <p className="knowledge-empty">没有匹配的已发布题目。</p> : view === 'graph' ? <GraphCanvas nodes={nodes} edges={edges} selectedId={selectedId} onSelect={setSelectedId} /> : nodes.map(node => <button key={node.question_id} className={selectedId === node.question_id ? 'selected' : ''} onClick={() => setSelectedId(node.question_id)}><small title={node.question_id}>{node.question_id}</small><strong title={node.title}>{node.title}</strong><span>{node.difficulty}</span></button>)}
          </section>
          <aside className="knowledge-detail">
            <h3>题目信息</h3>
            {selected ? <><small className="knowledge-question-id">{selected.question_id}</small><h2>{selected.title}</h2><dl><div><dt>难度</dt><dd>{selected.difficulty || '—'}</dd></div><div><dt>标签</dt><dd>{selected.tags}</dd></div></dl><div className="knowledge-links"><Link to={`/problem/${selected.question_pk}`}>打开题目</Link><Link to={`/problem/${selected.question_pk}/graph`}>查看单题图谱</Link></div></> : <p className="knowledge-muted">选择节点查看题目。</p>}
          </aside>
        </div>}
        {graph && graph.total_nodes > graph.page_size && <nav className="knowledge-pagination" aria-label="子图谱分页"><Button variant="outline-secondary" disabled={page <= 1 || loading} onClick={() => updatePage(page - 1)}>上一页</Button><span>第 {page} / {Math.max(1, Math.ceil(graph.total_nodes / graph.page_size))} 页</span><Button variant="outline-secondary" disabled={page * graph.page_size >= graph.total_nodes || loading} onClick={() => updatePage(page + 1)}>下一页</Button></nav>}
      </section>
    </div>
  </main>;
}
