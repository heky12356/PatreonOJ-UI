import React, { useEffect, useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import ForceDirectedGraph from './grouph';
import styles from './frame.module.css';
import {
  getGraphNodePage,
  findLearningPath,
  getRecommendations,
} from '../api/graph';
import {
  FaSearch,
  FaInfoCircle,
  FaSync,
  FaTimes,
  FaLink,
} from 'react-icons/fa';

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
        id: `Q:${q.question_id}`,
        node_type: 'question',
        question_number: q.question_number,
        question_id: q.question_id,
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
    <div className={styles.container}>
      <Container>
        {/* 控制面板 */}
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.header}>
              <div className={styles.title}>
                <FaInfoCircle size={20} color="#51624f" />
                <span>知识图谱探索</span>
              </div>
              <div className={styles.controls}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={resetHighlight}
                  disabled={loading}
                >
                  <FaTimes /> 重置高亮
                </button>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={loadGraphData}
                  disabled={loading}
                >
                  <FaSync className={loading ? 'fa-spin' : ''} /> 刷新数据
                </button>
              </div>
            </div>

            {flash && (
              <div
                className={`alert alert-${flash.type} alert-dismissible fade show mb-3`}
              >
                {flash.text}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setFlash(null)}
                />
              </div>
            )}

            {loadError && (
              <div className="alert alert-danger mb-3">{loadError}</div>
            )}

            <div className={styles.controls} style={{ marginBottom: '1rem' }}>
              {/* 搜索 */}
              <div className={styles.inputGroup}>
                <FaSearch className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.formControl}
                  placeholder="搜索题目标题或标签..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>

              {/* 边类型过滤器 */}
              <div className={styles.filterSection}>
                <span style={{ fontSize: '0.9rem', color: '#999' }}>
                  显示关系:
                </span>
                {[
                  { key: 'HAS_SKILL', label: '包含技能' },
                  { key: 'PREREQUISITE', label: '前置' },
                  { key: 'SKILL_CO_OCCUR', label: '技能共现' },
                ].map(({ key, label }) => (
                  <label key={key} className={styles.checkboxLabel}>
                    <input
                      className={styles.checkboxInput}
                      type="checkbox"
                      checked={!!edgeFilters[key]}
                      onChange={(e) =>
                        setEdgeFilters((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* 路径查找 */}
            <div
              className={styles.controls}
              style={{
                backgroundColor: '#f9f9f9',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                路径探索:
              </span>
              <div style={{ width: 200 }}>
                <input
                  className={styles.formControl}
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

              <div style={{ width: 200 }}>
                <input
                  className={styles.formControl}
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
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleFindPath}
                disabled={loading}
              >
                <FaLink /> 查找路径
              </button>
            </div>

            {/* 统计信息 */}
            <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span>题目节点:</span>
                <span className={styles.statValue}>
                  {
                    filteredData.nodes.filter((n) =>
                      String(n?.id || '').startsWith('Q:')
                    ).length
                  }
                </span>
              </div>
              <div className={styles.statItem}>
                <span>技能节点:</span>
                <span className={styles.statValue}>
                  {
                    filteredData.nodes.filter((n) =>
                      String(n?.id || '').startsWith('S:')
                    ).length
                  }
                </span>
              </div>
              <div className={styles.statItem}>
                <span>边数量:</span>
                <span className={styles.statValue}>
                  {filteredData.links.length}
                </span>
              </div>
              {learningPath.length > 0 && (
                <div className={styles.statItem}>
                  <span>学习路径:</span>
                  <span className={styles.statValue}>
                    {learningPath.length} 个题目
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 图谱容器 */}
        <div className={`${styles.card} ${styles.graphContainer}`}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className="spinner-border text-secondary" role="status" />
              <div className="mt-3">加载图谱数据中...</div>
            </div>
          ) : (
            <>
              <ForceDirectedGraph
                data={filteredData}
                highlightedNodes={highlightedNodes}
                onNodeClick={handleNodeClick}
              />

              <div className={styles.legend}>
                <div className={styles.legendTitle}>图例说明</div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#1890ff' }}>●</span> 简单
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#52c41a' }}>●</span> 中等
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#f5222d' }}>●</span> 困难
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#faad14' }}>●</span> 高亮节点
                </div>
                <div
                  className={styles.legendTitle}
                  style={{ marginTop: '12px' }}
                >
                  关系类型
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#722ed1' }}>━</span> PREREQUISITE
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#13c2c2' }}>━</span> NEXT
                </div>
                <div className={styles.legendItem}>
                  <span style={{ color: '#fa8c16' }}>━</span> RELATED
                </div>
              </div>
            </>
          )}
        </div>

        {/* 节点详情弹窗 */}
        {showNodeInfo && selectedNode && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowNodeInfo(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h5 className={styles.modalTitle}>
                  {String(selectedNode?.id || '').startsWith('S:')
                    ? '技能详情'
                    : '题目详情'}
                </h5>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowNodeInfo(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className={styles.modalBody}>
                {String(selectedNode.id || '').startsWith('S:') ||
                selectedNode.node_type === 'skill' ? (
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                      {selectedNode.title}
                    </h3>
                    <div className={styles.infoSection}>
                      <p>
                        <span className={styles.infoLabel}>技能 Key:</span>{' '}
                        {selectedNode.skill_key ||
                          String(selectedNode.id).replace(/^S:/, '')}
                      </p>
                      {selectedNode.updated_at && (
                        <p>
                          <span className={styles.infoLabel}>更新时间:</span>{' '}
                          {String(selectedNode.updated_at)}
                        </p>
                      )}
                    </div>
                    <div className={styles.infoSection}>
                      <span className={styles.infoLabel}>相关题目:</span>
                      <div className="mt-2">
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
                                return String(l.source) === sid
                                  ? String(l.target)
                                  : String(l.source);
                              })
                          ),
                        ]
                          .slice(0, 50)
                          .map((qid) => (
                            <a
                              key={qid}
                              className={styles.relatedLink}
                              href={`/problem/${String(qid).replace(/^Q:/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {String(qid).replace(/^Q:/, '')}
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                        {selectedNode.title}
                      </h3>
                      <a
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        href={`/problem/${String(selectedNode.id).replace(/^Q:/, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}
                      >
                        去做题
                      </a>
                    </div>

                    <div className={styles.infoSection}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '2rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <span className={styles.infoLabel}>题目编号</span>
                          {String(selectedNode.id).replace(/^Q:/, '')}
                        </div>
                        <div>
                          <span className={styles.infoLabel}>难度</span>
                          <span
                            className={`${styles.badge} ${
                              selectedNode.difficulty === '简单'
                                ? styles.badgeEasy
                                : selectedNode.difficulty === '中等'
                                  ? styles.badgeMedium
                                  : selectedNode.difficulty === '困难'
                                    ? styles.badgeHard
                                    : styles.badgeDefault
                            }`}
                          >
                            {selectedNode.difficulty}
                          </span>
                        </div>
                      </div>

                      {selectedNode.tags && (
                        <div style={{ marginBottom: '1rem' }}>
                          <span className={styles.infoLabel}>标签</span>
                          {selectedNode.tags.split(',').map(
                            (tag) =>
                              tag.trim() && (
                                <span
                                  key={tag}
                                  className={`${styles.badge} ${styles.badgeDefault}`}
                                  style={{ marginRight: '6px' }}
                                >
                                  {tag.trim()}
                                </span>
                              )
                          )}
                        </div>
                      )}
                    </div>

                    {selectedNode.description && (
                      <div className={styles.infoSection}>
                        <span className={styles.infoLabel}>题目描述</span>
                        <div
                          style={{
                            backgroundColor: '#f9f9f9',
                            padding: '1rem',
                            borderRadius: '8px',
                            lineHeight: '1.6',
                          }}
                        >
                          {selectedNode.description}
                        </div>
                      </div>
                    )}

                    {selectedNode.sample_input &&
                      selectedNode.sample_output && (
                        <div className={styles.infoSection}>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <span className={styles.infoLabel}>样例输入</span>
                              <div className={styles.codeBlock}>
                                {selectedNode.sample_input}
                              </div>
                            </div>
                            <div style={{ flex: 1 }}>
                              <span className={styles.infoLabel}>样例输出</span>
                              <div className={styles.codeBlock}>
                                {selectedNode.sample_output}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
