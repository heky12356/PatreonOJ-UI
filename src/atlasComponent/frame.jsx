import React, { useEffect, useState, useCallback, useMemo } from 'react';
import ForceDirectedGraph from './grouph';
import FrameControlPanel from './FrameControlPanel';
import NodeDetailsModal from './NodeDetailsModal';
import styles from './frame.module.css';
import {
  getGraphNodePage,
  findLearningPath,
  getRecommendations,
} from '../api/graph';

// Simple debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
  const debouncedSearchKeyword = useDebounce(searchKeyword, 300); // 300ms debounce
  
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
        // Skill node logic
        const neighbors = graphData.links
          .filter((l) => l.source === nodeId || l.target === nodeId)
          .flatMap((l) => [l.source, l.target])
          .filter(Boolean);
        const uniq = [...new Set([nodeId, ...neighbors])];
        setHighlightedNodes(uniq);
        return;
      }

      // Question node logic
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
  }, [pathStart, pathEnd, graphData.nodes, showFlash]);

  // 重置高亮
  const handleReset = useCallback(() => {
    setHighlightedNodes([]);
    setSelectedNode(null);
    setLearningPath([]);
    setPathStart(null);
    setPathEnd(null);
    setSearchKeyword('');
  }, []);

  // Filter Logic with Memoization
  const filteredData = useMemo(() => {
    const kw = String(debouncedSearchKeyword || '').trim().toLowerCase();
    
    let filteredNodes = graphData.nodes;

    // 1. Keyword Filter
    if (kw) {
      filteredNodes = filteredNodes.filter((node) => {
        const title = String(node?.title || '').toLowerCase();
        const tags = String(node?.tags || '').toLowerCase();
        const key = String(node?.skill_key || node?.id || '').toLowerCase();
        return title.includes(kw) || tags.includes(kw) || key.includes(kw);
      });
    }

    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // 2. Edge Filter
    const filteredLinks = graphData.links.filter((link) => {
      if (!filteredNodeIds.has(link.source) || !filteredNodeIds.has(link.target)) {
        return false;
      }
      // Normalize type key
      let typeKey = link.relation_type;
      if (typeKey === 'NEXT_LEVEL') typeKey = 'NEXT';
      return edgeFilters[typeKey] !== false;
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, debouncedSearchKeyword, edgeFilters]);

  // Derived Statistics
  const stats = useMemo(() => {
    const questionCount = filteredData.nodes.filter(n => String(n?.id).startsWith('Q:')).length;
    const skillCount = filteredData.nodes.filter(n => String(n?.id).startsWith('S:')).length;
    const edgeCount = filteredData.links.length;
    const pathLength = learningPath.length;
    
    return { questionCount, skillCount, edgeCount, pathLength };
  }, [filteredData, learningPath]);

  // Node Options for Datalist
  const nodeOptions = useMemo(() => {
    return graphData.nodes.filter(
      (n) => n?.node_type === 'question' || String(n?.id || '').startsWith('Q:')
    );
  }, [graphData.nodes]);

  return (
    <div className={styles.container}>
      {flash && (
        <div className={styles.flashContainer}>
          <div className={`${styles.alert} alert-${flash.type}`}>
             {flash.text}
          </div>
        </div>
      )}
      
      {loadError && (
         <div className="alert alert-danger mb-3 mx-4 mt-2">{loadError}</div>
      )}

      <FrameControlPanel 
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        edgeFilters={edgeFilters}
        // Handle single filter change in parent or adapt child
        onFilterChange={(key, checked) => setEdgeFilters(prev => ({...prev, [key]: checked}))}
        pathStart={pathStart}
        pathEnd={pathEnd}
        onPathStartChange={setPathStart}
        onPathEndChange={setPathEnd}
        onFindPath={handleFindPath}
        onReset={handleReset}
        onRefresh={loadGraphData}
        loading={loading}
        stats={stats}
        nodeOptions={nodeOptions}
      />

      <div className={styles.graphContainer}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className="spinner-border text-primary" role="status" />
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
              <div style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>关系类型</div>
              <div className={styles.legendItem}>
                <span style={{ color: '#722ed1' }}>━</span> 包含技能
              </div>
              <div className={styles.legendItem}>
                <span style={{ color: '#13c2c2' }}>━</span> 前置
              </div>
              <div className={styles.legendItem}>
                <span style={{ color: '#52c41a' }}>━</span> 后续
              </div>
            </div>
          </>
        )}
      </div>

      {showNodeInfo && selectedNode && (
        <NodeDetailsModal 
          node={selectedNode}
          onClose={() => setShowNodeInfo(false)}
          graphLinks={graphData.links}
        />
      )}
    </div>
  );
}

