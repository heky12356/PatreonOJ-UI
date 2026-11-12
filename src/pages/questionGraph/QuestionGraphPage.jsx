import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GraphCanvas from '../../components/graph/GraphCanvas.jsx';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { getQuestionGraph } from '../../api/learning.js';
import styles from './QuestionGraphPage.module.css';

const EDGE_TYPES = ['PREREQUISITE', 'NEXT_LEVEL', 'SIMILAR'];

const EDGE_TEXT = {
  PREREQUISITE: '前置依赖',
  NEXT_LEVEL: '进阶路径',
  SIMILAR: '同类扩展',
};

const toNodeLabel = (node) =>
  `${node?.question_id || node?.question_pk || '-'} ${node?.title || ''}`.trim();

function TreePanel({ tree, enabledTypes, onSelectNode, selectedId }) {
  const renderTreeNode = (node, level = 0, edgeType = '') => {
    if (!node) return null;
    const selected = String(node.question_id) === String(selectedId);

    return (
      <div key={`${level}-${node.question_id}-${edgeType}`} className={styles.treeBlock}>
        <button
          type="button"
          className={`${styles.treeNodeBtn} ${selected ? styles.treeNodeSelected : ''}`}
          onClick={() => onSelectNode(node.question_id)}
          style={{ marginLeft: `${level * 12}px` }}
          title={toNodeLabel(node)}
        >
          <span className={styles.treeNodeTitle}>{toNodeLabel(node)}</span>
          <span className={styles.treeNodeDiff}>{node.difficulty || '-'}</span>
        </button>

        {(node.children || [])
          .filter((child) => child?.node && enabledTypes.has(child?.edge_type))
          .map((child) => (
            <div key={`${node.question_id}-${child.edge_type}-${child.node?.question_id}`}>
              <div className={styles.treeEdgeHint} style={{ marginLeft: `${(level + 1) * 12}px` }}>
                {EDGE_TEXT[child.edge_type] || child.edge_type}
              </div>
              {renderTreeNode(child.node, level + 1, child.edge_type)}
            </div>
          ))}
      </div>
    );
  };

  if (!tree) {
    return <div className="text-secondary small">暂无树形数据</div>;
  }

  return <div className={styles.treePanel}>{renderTreeNode(tree)}</div>;
}

export default function QuestionGraphPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [depth, setDepth] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [typeEnabled, setTypeEnabled] = useState({
    PREREQUISITE: true,
    NEXT_LEVEL: true,
    SIMILAR: true,
  });
  const [graph, setGraph] = useState({
    root_question_id: '',
    root_question_pk: null,
    nodes: [],
    edges: [],
    tree: null,
  });

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const resp = await getQuestionGraph(id, { depth });
        const data = resp?.data || {};
        const nodes = Array.isArray(data.nodes) ? data.nodes : [];
        const rootId = data.root_question_id || nodes?.[0]?.question_id || '';
        setGraph({
          truncated: Boolean(data.truncated),
          root_question_id: rootId,
          root_question_pk: data.root_question_pk ?? null,
          nodes,
          edges: Array.isArray(data.edges) ? data.edges : [],
          tree: data.tree ?? null,
        });
        setSelectedNodeId(String(rootId || ''));
      } catch (err) {
        setError(String(err?.message || '获取图谱失败'));
        setGraph({
          root_question_id: '',
          root_question_pk: null,
          nodes: [],
          edges: [],
          tree: null,
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, depth, refreshKey]);

  const enabledTypes = useMemo(() => {
    return new Set(
      Object.entries(typeEnabled)
        .filter(([, enabled]) => enabled)
        .map(([type]) => type)
    );
  }, [typeEnabled]);

  const nodeById = useMemo(() => {
    const map = new Map();
    (graph.nodes || []).forEach((node) => {
      map.set(String(node.question_id), node);
    });
    return map;
  }, [graph.nodes]);

  const visibleEdges = useMemo(() => {
    return (graph.edges || []).filter((edge) => {
      if (!enabledTypes.has(edge?.edge_type)) return false;
      const fromOk = nodeById.has(String(edge?.from_question_id));
      const toOk = nodeById.has(String(edge?.to_question_id));
      return fromOk && toOk;
    });
  }, [graph.edges, enabledTypes, nodeById]);

  const visibleNodes = useMemo(() => {
    if ((graph.nodes || []).length === 0) return [];

    const ids = new Set();
    visibleEdges.forEach((edge) => {
      ids.add(String(edge.from_question_id));
      ids.add(String(edge.to_question_id));
    });

    if (ids.size === 0) {
      return graph.nodes;
    }

    const list = [];
    graph.nodes.forEach((node) => {
      if (ids.has(String(node.question_id))) {
        list.push(node);
      }
    });
    return list;
  }, [graph.nodes, visibleEdges]);

  const selectedNode = useMemo(() => {
    return nodeById.get(String(selectedNodeId)) || null;
  }, [nodeById, selectedNodeId]);

  const selectedEdgeStats = useMemo(() => {
    const stats = {
      in: { PREREQUISITE: 0, NEXT_LEVEL: 0, SIMILAR: 0 },
      out: { PREREQUISITE: 0, NEXT_LEVEL: 0, SIMILAR: 0 },
    };
    const sid = String(selectedNodeId);
    if (!sid) return stats;

    (graph.edges || []).forEach((edge) => {
      const t = edge?.edge_type;
      if (!EDGE_TYPES.includes(t)) return;
      if (String(edge.from_question_id) === sid) stats.out[t] += 1;
      if (String(edge.to_question_id) === sid) stats.in[t] += 1;
    });

    return stats;
  }, [graph.edges, selectedNodeId]);


  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>学习图谱</h2>
          <div className={styles.subtitle}>{graph.nodes.find(node => String(node.question_pk) === String(id))?.title || '查看当前题目的关联学习路径'}</div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            返回
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Card className="mb-3">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>图谱深度</Form.Label>
                <Form.Select
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                >
                  <option value={1}>1 层</option>
                  <option value={2}>2 层</option>
                  <option value={3}>3 层</option>
                  <option value={4}>4 层</option>
                  <option value={5}>5 层</option>
                  <option value={6}>6 层</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Label>关系类型筛选</Form.Label>
              <div className={styles.typeFilters}>
                {EDGE_TYPES.map((type) => (
                  <Form.Check
                    key={type}
                    inline
                    type="checkbox"
                    id={`edge-type-${type}`}
                    label={EDGE_TEXT[type]}
                    checked={typeEnabled[type]}
                    onChange={(e) =>
                      setTypeEnabled((prev) => ({
                        ...prev,
                        [type]: e.target.checked,
                      }))
                    }
                  />
                ))}
              </div>
            </Col>

            <Col md={3} className="text-md-end">
              <div className="text-secondary small">
                节点 {visibleNodes.length} / {graph.nodes.length}，边 {visibleEdges.length} /{' '}
                {graph.edges.length}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error ? <Alert variant="danger">{error}</Alert> : null}
      {graph.truncated ? <Alert variant="info">关联题目较多，当前展示部分图谱；可降低深度或选择其他题目继续查看。</Alert> : null}

      <Row className="g-3">
        <Col lg={8}>
          <Card className={styles.graphCard}>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>关系图</span>
              {loading ? <Spinner size="sm" /> : null}
            </Card.Header>
            <Card.Body className={styles.graphBody}>
              {visibleNodes.length === 0 && !loading ? (
                <div className={styles.emptyTip}>暂无图谱数据</div>
              ) : (
                <GraphCanvas nodes={visibleNodes} edges={visibleEdges} rootId={graph.root_question_id} selectedId={selectedNodeId} onSelect={setSelectedNodeId} />
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-3">
            <Card.Header>节点详情</Card.Header>
            <Card.Body>
              {selectedNode ? (
                <>
                  <div className={styles.detailTitle}>{toNodeLabel(selectedNode)}</div>
                  <div className="mb-2">
                    <Badge bg="secondary" className="me-2">
                      {selectedNode.difficulty || '未知难度'}
                    </Badge>
                    {String(selectedNode.question_id) === String(graph.root_question_id) ? (
                      <Badge bg="dark">中心题</Badge>
                    ) : null}
                  </div>
                  <div className="small text-secondary mb-3">{selectedNode.tags || '无标签'}</div>

                  <div className={styles.statGrid}>
                    {EDGE_TYPES.map((type) => (
                      <div key={`in-${type}`} className={styles.statItem}>
                        <div className={styles.statLabel}>入边 {EDGE_TEXT[type]}</div>
                        <div className={styles.statValue}>{selectedEdgeStats.in[type]}</div>
                      </div>
                    ))}
                    {EDGE_TYPES.map((type) => (
                      <div key={`out-${type}`} className={styles.statItem}>
                        <div className={styles.statLabel}>出边 {EDGE_TEXT[type]}</div>
                        <div className={styles.statValue}>{selectedEdgeStats.out[type]}</div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(`/problem/${selectedNode.question_pk}`)}
                    >
                      打开题目
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        navigate(`/problem/${selectedNode.question_pk}/submissions`)
                      }
                    >
                      查看提交
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-secondary small">点击图谱中的节点查看详情</div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>关系树</Card.Header>
            <Card.Body className={styles.treeCardBody}>
              <TreePanel
                tree={graph.tree}
                enabledTypes={enabledTypes}
                onSelectNode={(qid) => setSelectedNodeId(String(qid))}
                selectedId={selectedNodeId}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
