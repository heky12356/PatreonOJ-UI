import React, { useEffect, useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import ForceDirectedGraph from './grouph';
import {
  getGraphNodePage,
  findLearningPath,
  getRecommendations,
} from '../api/graph';

export default function Frame() {
  // 状态管理
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: [],
    count: 0,
    skill_count: 0,
    edge_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [pathStart, setPathStart] = useState(null);
  const [pathEnd, setPathEnd] = useState(null);
  const [learningPath, setLearningPath] = useState([]);
  const [edgeFilters, setEdgeFilters] = useState({
    HAS_SKILL: true,
    PREREQUISITE: true,
    NEXT: true,
    RELATED: true,
    SIMILAR: true,
    SKILL_CO_OCCUR: false,
    SKILL_SUBSUMES: false,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showNodeInfo, setShowNodeInfo] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [flash, setFlash] = useState(null);

  const showFlash = useCallback((type, text) => {
    setFlash({ type, text });
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 2500);
    return () => clearTimeout(t);
  }, [flash]);

  // 初始化加载图谱数据
  useEffect(() => {
    loadGraphData();
  }, []);

  // 加载图谱数据
  const loadGraphData = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const resp = await getGraphNodePage({ page: 1, pageSize: 2000 });

      const questions = Array.isArray(resp?.questions) ? resp.questions : [];
      const skillsRaw = Array.isArray(resp?.skills) ? resp.skills : [];
      const edgesRaw = Array.isArray(resp?.edges) ? resp.edges : [];

      const questionNodes = questions.map((q) => ({
        id: `Q:${q.question_number}`,
        node_type: 'question',
        question_number: q.question_number,
        title: q.title,
        difficulty: q.difficulty,
        tags: q.tags || '',
        status: q.status,
        created_at: q.created_at,
        updated_at: q.updated_at,
        description: q.content || q.description,
        input_format: q.input_format,
        output_format: q.output_format,
        sample_input: q.sample_input,
        sample_output: q.sample_output,
        hint: q.hint,
        source: q.source,
      }));

      const skillNodes = skillsRaw
        .map((s) => {
          const key = s.Key ?? s.key ?? s.skill_key ?? s.name ?? s.Name;
          const name = s.Name ?? s.name ?? key;
          if (!key) return null;
          return {
            id: `S:${key}`,
            node_type: 'skill',
            skill_key: key,
            title: name,
            created_at: s.CreatedAt ?? s.created_at,
            updated_at: s.UpdatedAt ?? s.updated_at,
          };
        })
        .filter(Boolean);

      const links = edgesRaw
        .map((e) => ({
          source: String(e?.from ?? e?.source ?? ''),
          target: String(e?.to ?? e?.target ?? ''),
          relation_type: e?.type ?? e?.relation_type ?? 'RELATED',
          value:
            typeof e?.weight === 'number'
              ? e.weight
              : typeof e?.value === 'number'
              ? e.value
              : 1,
        }))
        .filter((l) => l.source && l.target);

      const count =
        typeof resp?.count === 'number' ? resp.count : questionNodes.length;
      const skill_count =
        typeof resp?.skill_count === 'number'
          ? resp.skill_count
          : skillNodes.length;
      const edge_count =
        typeof resp?.edge_count === 'number' ? resp.edge_count : links.length;

      setGraphData({
        nodes: [...questionNodes, ...skillNodes],
        links,
        count,
        skill_count,
        edge_count,
      });
      showFlash(
        'success',
        `成功加载 ${count} 个题目、${skill_count} 个技能、${edge_count} 条边`
      );
    } catch (error) {
      console.error('加载图谱数据失败:', error);
      setLoadError('加载图谱数据失败，请稍后重试');
      showFlash('danger', '加载图谱数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [showFlash]);

  useEffect(() => {
    // 这是一个副作用，用于触发 filteredData 重新计算
    // 实际上 filteredData 是在渲染期间计算的，只要 state 变化就会更新
    // 但如果有些副作用需要依赖 filteredData，可以在这里处理
  }, [edgeFilters]);

  // 处理节点点击事件
  const handleNodeClick = useCallback(
    async (nodeData) => {
      setSelectedNode(nodeData);
      setShowNodeInfo(true);

      const nodeId = String(nodeData?.id || '');
      const isQuestion =
        nodeData?.node_type === 'question' ||
        nodeId.startsWith('Q:') ||
        typeof nodeData?.question_number === 'number';

      if (!isQuestion) {
        const neighbors = graphData.links
          .filter((l) => l.source === nodeId || l.target === nodeId)
          .flatMap((l) => [l.source, l.target])
          .filter(Boolean);
        const uniq = [...new Set([nodeId, ...neighbors])];
        setHighlightedNodes(uniq);
        showFlash(
          'info',
          `已高亮与技能「${nodeData.title || nodeId}」相关的 ${Math.max(
            0,
            uniq.length - 1
          )} 个节点`
        );
        return;
      }

      try {
        const recResp = await getRecommendations(nodeData.question_number);
        const recommendations = Array.isArray(recResp?.recommendations)
          ? recResp.recommendations
          : Array.isArray(recResp)
          ? recResp
          : [];

        if (recommendations.length > 0) {
          const recommendedIds = recommendations.map(
            (rec) => `Q:${rec.question_number}`
          );
          setHighlightedNodes((prev) => [
            ...new Set([...prev, nodeId, ...recommendedIds]),
          ]);
          showFlash(
            'success',
            `为题目 ${nodeData.title} 找到 ${recommendations.length} 个推荐题目`
          );
        } else {
          setHighlightedNodes([nodeId]);
          showFlash('info', `题目 ${nodeData.title} 暂无推荐题目`);
        }
      } catch (error) {
        console.error('获取推荐题目失败:', error);
        setHighlightedNodes([nodeId]);
        showFlash('warning', '获取推荐题目失败，仅高亮当前题目');
      }
    },
    [graphData.links, showFlash]
  );

  // 查找学习路径
  const handleFindPath = useCallback(async () => {
    if (!pathStart || !pathEnd) {
      showFlash('warning', '请选择起始题目和目标题目');
      return;
    }

    try {
      setLoading(true);
      const startNode = graphData.nodes.find((n) => n.id === pathStart);
      const endNode = graphData.nodes.find((n) => n.id === pathEnd);

      if (!startNode || !endNode) {
        showFlash('danger', '找不到指定的题目节点');
        return;
      }

      const pathResp = await findLearningPath(
        startNode.question_number,
        endNode.question_number
      );
      const pathNumbers = Array.isArray(pathResp?.path)
        ? pathResp.path
        : Array.isArray(pathResp)
        ? pathResp
        : [];

      if (pathNumbers.length > 0) {
        const pathIds = pathNumbers.map((n) => `Q:${n}`);
        setLearningPath(pathIds);
        setHighlightedNodes(pathIds);
        showFlash('success', `找到学习路径，包含 ${pathNumbers.length} 个题目`);
      } else {
        showFlash('info', '未找到学习路径，可能两个题目之间没有直接关联');
        setLearningPath([]);
      }
    } catch (error) {
      console.error('查找学习路径失败:', error);
      showFlash('danger', '查找学习路径失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [pathStart, pathEnd, graphData.nodes]);

  // 重置高亮
  const resetHighlight = () => {
    setHighlightedNodes([]);
    setSelectedNode(null);
    setLearningPath([]);
    setPathStart(null);
    setPathEnd(null);
  };

  // 根据筛选条件过滤节点
  const getFilteredData = () => {
    const kw = String(searchKeyword || '').trim();

    let filteredNodes = graphData.nodes;

    // 1. 关键词搜索过滤节点
    if (kw) {
      filteredNodes = filteredNodes.filter((node) => {
        const title = String(node?.title || '');
        const tags = String(node?.tags || '');
        const key = String(node?.skill_key || node?.id || '');
        return title.includes(kw) || tags.includes(kw) || key.includes(kw);
      });
    }

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // 2. 边过滤：只保留起止点都在 filteredNodes 中，且类型符合 edgeFilters 的边
    const filteredLinks = graphData.links.filter((link) => {
      if (
        !filteredNodeIds.has(link.source) ||
        !filteredNodeIds.has(link.target)
      )
        return false;

      // 归一化关系类型 key
      let typeKey = link.relation_type;
      if (typeKey === 'NEXT_LEVEL') typeKey = 'NEXT';

      // 如果 edgeFilters 中有定义该类型，则遵循开关；未定义默认显示
      return edgeFilters[typeKey] !== false;
    });

    return { nodes: filteredNodes, links: filteredLinks };
  };

  const filteredData = getFilteredData();

  return (
    <Container>
      {/* 控制面板 */}
      <div className="card mb-3">
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 600 }}>知识图谱</span>
              <i className="bi bi-info-circle text-secondary" />
            </div>
          </div>

          {flash ? (
            <div
              className={`alert alert-${flash.type} alert-dismissible fade show mb-3`}
              role="alert"
            >
              {flash.text}
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setFlash(null)}
              />
            </div>
          ) : null}

          {loadError ? (
            <div className="alert alert-danger mb-3" role="alert">
              {loadError}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div className="input-group" style={{ width: 260 }}>
              <span className="input-group-text">
                <i className="bi bi-search" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="搜索题目标题或标签"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>

            {/* 边类型过滤器 */}
            <div
              className="d-flex align-items-center gap-3 border-start ps-3"
              style={{ height: 38 }}
            >
              <span className="text-secondary small">显示关系:</span>
              {[
                { key: 'HAS_SKILL', label: '包含技能' },
                { key: 'PREREQUISITE', label: '前置' },
                { key: 'SKILL_CO_OCCUR', label: '技能共现' },
              ].map(({ key, label }) => (
                <div className="form-check form-check-inline mb-0" key={key}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`filter-${key}`}
                    checked={!!edgeFilters[key]}
                    onChange={(e) =>
                      setEdgeFilters((prev) => ({
                        ...prev,
                        [key]: e.target.checked,
                      }))
                    }
                  />
                  <label
                    className="form-check-label small"
                    htmlFor={`filter-${key}`}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>

            {/* 路径查找 */}
            <div style={{ width: 220 }}>
              <input
                className="form-control"
                list="graph-path-start"
                placeholder="选择起点"
                value={pathStart || ''}
                onChange={(e) => setPathStart(e.target.value || null)}
              />
              <datalist id="graph-path-start">
                {graphData.nodes
                  .filter(
                    (n) =>
                      n?.node_type === 'question' ||
                      String(n?.id || '').startsWith('Q:')
                  )
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.title} ({String(node.id).replace(/^Q:/, '')})
                    </option>
                  ))}
              </datalist>
            </div>

            <div style={{ width: 220 }}>
              <input
                className="form-control"
                list="graph-path-end"
                placeholder="选择终点"
                value={pathEnd || ''}
                onChange={(e) => setPathEnd(e.target.value || null)}
              />
              <datalist id="graph-path-end">
                {graphData.nodes
                  .filter(
                    (n) =>
                      n?.node_type === 'question' ||
                      String(n?.id || '').startsWith('Q:')
                  )
                  .map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.title} ({String(node.id).replace(/^Q:/, '')})
                    </option>
                  ))}
              </datalist>
            </div>

            <button
              type="button"
              className="btn text-white"
              style={{ backgroundColor: '#4d5d4b', borderColor: '#4d5d4b' }}
              onClick={handleFindPath}
              disabled={loading}
            >
              查找路径
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={resetHighlight}
              disabled={loading}
            >
              重置高亮
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={loadGraphData}
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              刷新数据
            </button>
          </div>

          {/* 统计信息 */}
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span>
              题目节点:{' '}
              {
                filteredData.nodes.filter((n) =>
                  String(n?.id || '').startsWith('Q:')
                ).length
              }
            </span>
            <span>
              技能节点:{' '}
              {
                filteredData.nodes.filter((n) =>
                  String(n?.id || '').startsWith('S:')
                ).length
              }
            </span>
            <span>边数量: {filteredData.links.length}</span>
            {learningPath.length > 0 ? (
              <span>学习路径: {learningPath.length} 个题目</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* 图谱容器 */}
      <div className="card flex-fill position-relative">
        <div className="card-body p-0 h-100">
          {loading ? (
            <div
              className="d-flex flex-column justify-content-center align-items-center"
              style={{ height: '400px' }}
            >
              <div className="spinner-border text-secondary" role="status" />
              <div className="mt-2 text-secondary">加载图谱数据中...</div>
            </div>
          ) : (
            <ForceDirectedGraph
              data={filteredData}
              highlightedNodes={highlightedNodes}
              onNodeClick={handleNodeClick}
            />
          )}

          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
            }}
          >
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>图例</div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div>
                <span style={{ color: '#1890ff' }}>●</span> 简单
              </div>
              <div>
                <span style={{ color: '#52c41a' }}>●</span> 中等
              </div>
              <div>
                <span style={{ color: '#f5222d' }}>●</span> 困难
              </div>
              <div>
                <span style={{ color: '#faad14' }}>●</span> 高亮节点
              </div>
              <div style={{ marginTop: 8, fontWeight: 'bold' }}>关系</div>
              <div>
                <span style={{ color: '#722ed1' }}>━</span> PREREQUISITE
              </div>
              <div>
                <span style={{ color: '#13c2c2' }}>━</span> NEXT
              </div>
              <div>
                <span style={{ color: '#fa8c16' }}>━</span> RELATED
              </div>
              <div>
                <span style={{ color: '#8c8c8c' }}>━</span> SIMILAR
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 节点详情弹窗 */}
      {showNodeInfo ? (
        <>
          <div
            className="modal show"
            style={{ display: 'block' }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="modal-dialog modal-lg modal-dialog-scrollable"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {String(selectedNode?.id || '').startsWith('S:')
                      ? '技能详情'
                      : '题目详情'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowNodeInfo(false)}
                  />
                </div>
                <div className="modal-body">
                  {selectedNode ? (
                    String(selectedNode.id || '').startsWith('S:') ||
                    selectedNode.node_type === 'skill' ? (
                      <div>
                        <h3>{selectedNode.title}</h3>
                        <div style={{ marginBottom: 16 }}>
                          <p>
                            <strong>技能 Key:</strong>{' '}
                            {selectedNode.skill_key ||
                              String(selectedNode.id).replace(/^S:/, '')}
                          </p>
                          {selectedNode.updated_at ? (
                            <p className="text-secondary">
                              <strong>更新时间:</strong>{' '}
                              {String(selectedNode.updated_at)}
                            </p>
                          ) : null}
                        </div>

                        <div style={{ marginBottom: 16 }}>
                          <strong>相关题目:</strong>
                          <div className="mt-2 d-flex flex-wrap gap-2">
                            {[
                              ...new Set(
                                graphData.links
                                  .filter((l) => {
                                    const sid = String(selectedNode.id);
                                    const s = String(l.source);
                                    const t = String(l.target);
                                    return (
                                      (s === sid && t.startsWith('Q:')) ||
                                      (t === sid && s.startsWith('Q:'))
                                    );
                                  })
                                  .map((l) => {
                                    const sid = String(selectedNode.id);
                                    const s = String(l.source);
                                    const t = String(l.target);
                                    return s === sid ? t : s;
                                  })
                              ),
                            ]
                              .slice(0, 50)
                              .map((qid) => (
                                <a
                                  key={qid}
                                  className="btn btn-sm btn-outline-secondary"
                                  href={`/problem/${String(qid).replace(
                                    /^Q:/,
                                    ''
                                  )}`}
                                >
                                  {String(qid).replace(/^Q:/, '')}
                                </a>
                              ))}
                          </div>
                          <div className="text-secondary small mt-2">
                            最多展示 50 个
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3>{selectedNode.title}</h3>
                        <div style={{ marginBottom: 16 }}>
                          <p>
                            <strong>题目编号:</strong>{' '}
                            {String(selectedNode.id).replace(/^Q:/, '')}
                          </p>
                          <p>
                            <strong>难度:</strong>{' '}
                            <span
                              className={`badge ${
                                selectedNode.difficulty === '简单'
                                  ? 'bg-success'
                                  : selectedNode.difficulty === '中等'
                                  ? 'bg-warning text-dark'
                                  : selectedNode.difficulty === '困难'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                              }`}
                            >
                              {selectedNode.difficulty}
                            </span>
                          </p>
                          <p>
                            <strong>标签:</strong>{' '}
                            {selectedNode.tags
                              ? selectedNode.tags.split(',').map((tag) => {
                                  const t = tag.trim();
                                  if (!t) return null;
                                  return (
                                    <span
                                      key={t}
                                      className="badge bg-secondary me-1 mb-1"
                                    >
                                      {t}
                                    </span>
                                  );
                                })
                              : null}
                          </p>
                          {selectedNode.source ? (
                            <p>
                              <strong>来源:</strong> {selectedNode.source}
                            </p>
                          ) : null}
                          <div className="mt-2">
                            <a
                              className="btn btn-sm btn-outline-secondary"
                              href={`/problem/${String(selectedNode.id).replace(
                                /^Q:/,
                                ''
                              )}`}
                            >
                              打开题目
                            </a>
                          </div>
                        </div>

                        {selectedNode.description ? (
                          <div style={{ marginBottom: 16 }}>
                            <strong>题目描述:</strong>
                            <div
                              style={{
                                marginTop: 8,
                                padding: 12,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 4,
                              }}
                            >
                              {selectedNode.description}
                            </div>
                          </div>
                        ) : null}

                        {selectedNode.input_format ? (
                          <div style={{ marginBottom: 16 }}>
                            <strong>输入格式:</strong>
                            <div
                              style={{
                                marginTop: 8,
                                padding: 12,
                                backgroundColor: '#f0f8ff',
                                borderRadius: 4,
                                whiteSpace: 'pre-line',
                              }}
                            >
                              {selectedNode.input_format}
                            </div>
                          </div>
                        ) : null}

                        {selectedNode.output_format ? (
                          <div style={{ marginBottom: 16 }}>
                            <strong>输出格式:</strong>
                            <div
                              style={{
                                marginTop: 8,
                                padding: 12,
                                backgroundColor: '#f0f8ff',
                                borderRadius: 4,
                                whiteSpace: 'pre-line',
                              }}
                            >
                              {selectedNode.output_format}
                            </div>
                          </div>
                        ) : null}

                        {selectedNode.sample_input &&
                        selectedNode.sample_output ? (
                          <div style={{ marginBottom: 16 }}>
                            <strong>样例:</strong>
                            <div
                              style={{ display: 'flex', gap: 16, marginTop: 8 }}
                            >
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    marginBottom: 4,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  输入:
                                </div>
                                <div
                                  style={{
                                    padding: 12,
                                    backgroundColor: '#fff7e6',
                                    borderRadius: 4,
                                    whiteSpace: 'pre-line',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {selectedNode.sample_input}
                                </div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    marginBottom: 4,
                                    fontWeight: 'bold',
                                  }}
                                >
                                  输出:
                                </div>
                                <div
                                  style={{
                                    padding: 12,
                                    backgroundColor: '#f6ffed',
                                    borderRadius: 4,
                                    whiteSpace: 'pre-line',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {selectedNode.sample_output}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {selectedNode.hint ? (
                          <div style={{ marginBottom: 16 }}>
                            <strong>提示:</strong>
                            <div
                              style={{
                                marginTop: 8,
                                padding: 12,
                                backgroundColor: '#fffbe6',
                                borderRadius: 4,
                                border: '1px solid #ffe58f',
                              }}
                            >
                              {selectedNode.hint}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowNodeInfo(false)}
          />
        </>
      ) : null}
    </Container>
  );
}
