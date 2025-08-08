import React, { useEffect, useState, useCallback } from 'react';
import { Card, Select, Button, Spin, message, Input, Tag, Modal } from 'antd';
import { SearchOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ForceDirectedGraph from './grouph';
import { getGraphData, findLearningPath, getRecommendations } from '../api/graph';

const { Option } = Select;

export default function Frame() {
    // 状态管理
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [loading, setLoading] = useState(true);
    const [highlightedNodes, setHighlightedNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [pathStart, setPathStart] = useState(null);
    const [pathEnd, setPathEnd] = useState(null);
    const [learningPath, setLearningPath] = useState([]);
    const [difficultyFilter, setDifficultyFilter] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [showNodeInfo, setShowNodeInfo] = useState(false);

    // 初始化加载图谱数据
    useEffect(() => {
        loadGraphData();
    }, []);

    // 加载图谱数据
    const loadGraphData = useCallback(async () => {
        setLoading(true);
        try {
            // 构建筛选选项
            const filterOptions = {
                difficulties: difficultyFilter.length > 0 ? difficultyFilter : undefined,
                tags: searchKeyword ? [searchKeyword] : undefined,
                questionIds: undefined // 可以根据需要添加特定题目ID筛选
            };
            
            const data = await getGraphData(filterOptions);
            console.log('loadGraphData', data);

            setGraphData(data);
            message.success(`成功加载 ${data.nodes.length} 个题目节点`);
        } catch (error) {
            console.error('加载图谱数据失败:', error);
            message.error('加载图谱数据失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, [difficultyFilter, searchKeyword]);

    // 处理节点点击事件
    const handleNodeClick = useCallback(async (nodeData) => {
        setSelectedNode(nodeData);
        setShowNodeInfo(true);
        console.log('nodeData', nodeData);


        try {
            // 获取推荐题目并高亮显示
            const recommendations = await getRecommendations(nodeData.question_number);
            if (recommendations && recommendations.length > 0) {
                const recommendedIds = recommendations.map(rec => rec.id || `p${rec.question_number}`);
                setHighlightedNodes(prev => [...new Set([...prev, nodeData.id, ...recommendedIds])]);
                message.success(`为题目 ${nodeData.title} 找到 ${recommendations.length} 个推荐题目`);
            } else {
                setHighlightedNodes([nodeData.id]);
                message.info(`题目 ${nodeData.title} 暂无推荐题目`);
            }
        } catch (error) {
            console.error('获取推荐题目失败:', error);
            setHighlightedNodes([nodeData.id]);
            message.warning('获取推荐题目失败，仅高亮当前题目');
        }
    }, []);

    // 查找学习路径
    const handleFindPath = useCallback(async () => {
        if (!pathStart || !pathEnd) {
            message.warning('请选择起始题目和目标题目');
            return;
        }

        try {
            setLoading(true);
            const startNode = graphData.nodes.find(n => n.id === pathStart);
            const endNode = graphData.nodes.find(n => n.id === pathEnd);
            
            if (!startNode || !endNode) {
                message.error('找不到指定的题目节点');
                return;
            }

            const path = await findLearningPath(startNode.question_number, endNode.question_number);
            if (path && path.length > 0) {
                const pathIds = path.map(p => p.id || `p${p.question_number}`);
                setLearningPath(pathIds);
                setHighlightedNodes(pathIds);
                message.success(`找到学习路径，包含 ${path.length} 个题目`);
            } else {
                message.info('未找到学习路径，可能两个题目之间没有直接关联');
                setLearningPath([]);
            }
        } catch (error) {
            console.error('查找学习路径失败:', error);
            message.error('查找学习路径失败，请稍后重试');
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
        let filteredNodes = graphData.nodes;

        // 难度筛选
        if (difficultyFilter !== 'all') {
            filteredNodes = filteredNodes.filter(node => 
                node.difficulty === difficultyFilter
            );
        }

        // 关键词搜索
        if (searchKeyword) {
            filteredNodes = filteredNodes.filter(node => 
                node.title.includes(searchKeyword) || 
                node.tags.includes(searchKeyword)
            );
        }

        // 过滤相关的链接
        const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
        const filteredLinks = graphData.links.filter(link => 
            filteredNodeIds.has(link.source) && filteredNodeIds.has(link.target)
        );

        return { nodes: filteredNodes, links: filteredLinks };
    };

    const filteredData = getFilteredData();

    return (
        <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* 控制面板 */}
            <Card style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* 搜索框 */}
                    <Input
                        placeholder="搜索题目标题或标签"
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ width: 200 }}
                    />

                    {/* 难度筛选 */}
                    <Select
                        value={difficultyFilter}
                        onChange={setDifficultyFilter}
                        style={{ width: 120 }}
                    >
                        <Option value="all">全部难度</Option>
                        <Option value="简单">简单</Option>
                        <Option value="中等">中等</Option>
                        <Option value="困难">困难</Option>
                    </Select>

                    {/* 路径查找 */}
                    <Select
                        placeholder="选择起点"
                        value={pathStart}
                        onChange={setPathStart}
                        style={{ width: 150 }}
                        showSearch
                        optionFilterProp="children"
                    >
                        {graphData.nodes.map(node => (
                            <Option key={node.id} value={node.id}>
                                {node.title} ({node.id})
                            </Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="选择终点"
                        value={pathEnd}
                        onChange={setPathEnd}
                        style={{ width: 150 }}
                        showSearch
                        optionFilterProp="children"
                    >
                        {graphData.nodes.map(node => (
                            <Option key={node.id} value={node.id}>
                                {node.title} ({node.id})
                            </Option>
                        ))}
                    </Select>

                    <Button type="primary" onClick={handleFindPath}>
                        查找路径
                    </Button>

                    <Button onClick={resetHighlight}>
                        重置高亮
                    </Button>

                    <Button icon={<ReloadOutlined />} onClick={loadGraphData} loading={loading}>
                        刷新数据
                    </Button>
                </div>

                {/* 统计信息 */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                    <span>题目总数: {filteredData.nodes.length}</span>
                    <span>关系总数: {filteredData.links.length}</span>
                    {learningPath.length > 0 && (
                        <span>学习路径: {learningPath.length} 个题目</span>
                    )}
                </div>
            </Card>

            {/* 图谱容器 */}
            <Card style={{ flex: 1, position: 'relative' }}>
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '400px' 
                    }}>
                        <Spin size="large" tip="加载图谱数据中..." />
                    </div>
                ) : (
                    <ForceDirectedGraph
                        data={filteredData}
                        highlightedNodes={highlightedNodes}
                        onNodeClick={handleNodeClick}
                    />
                )}

                {/* 图例 */}
                <div style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    right: '16px', 
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid #d9d9d9'
                }}>
                    <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>图例</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div><span style={{ color: '#1890ff' }}>●</span> 简单</div>
                        <div><span style={{ color: '#52c41a' }}>●</span> 中等</div>
                        <div><span style={{ color: '#f5222d' }}>●</span> 困难</div>
                        <div><span style={{ color: '#faad14' }}>●</span> 高亮节点</div>
                    </div>
                </div>
            </Card>

            {/* 节点详情弹窗 */}
            <Modal
                title="题目详情"
                open={showNodeInfo}
                onCancel={() => setShowNodeInfo(false)}
                footer={null}
                width={800}
            >
                {selectedNode && (
                    <div>
                        <h3>{selectedNode.title}</h3>
                        <div style={{ marginBottom: 16 }}>
                            <p><strong>题目编号:</strong> {selectedNode.id}</p>
                            <p><strong>难度:</strong> 
                                <Tag color={
                                    selectedNode.difficulty === '简单' ? 'green' :
                                    selectedNode.difficulty === '中等' ? 'orange' :
                                    selectedNode.difficulty === '困难' ? 'red' : 'blue'
                                }>
                                    {selectedNode.difficulty}
                                </Tag>
                            </p>
                            <p><strong>标签:</strong> 
                                {selectedNode.tags && selectedNode.tags.split(',').map(tag => (
                                    <Tag key={tag.trim()} style={{ margin: '2px' }}>
                                        {tag.trim()}
                                    </Tag>
                                ))}
                            </p>
                            {selectedNode.source && (
                                <p><strong>来源:</strong> {selectedNode.source}</p>
                            )}
                        </div>
                        
                        {selectedNode.description && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>题目描述:</strong>
                                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                    {selectedNode.description}
                                </div>
                            </div>
                        )}

                        {selectedNode.input_format && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>输入格式:</strong>
                                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 4, whiteSpace: 'pre-line' }}>
                                    {selectedNode.input_format}
                                </div>
                            </div>
                        )}

                        {selectedNode.output_format && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>输出格式:</strong>
                                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f0f8ff', borderRadius: 4, whiteSpace: 'pre-line' }}>
                                    {selectedNode.output_format}
                                </div>
                            </div>
                        )}

                        {selectedNode.sample_input && selectedNode.sample_output && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>样例:</strong>
                                <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>输入:</div>
                                        <div style={{ padding: 12, backgroundColor: '#fff7e6', borderRadius: 4, whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                                            {selectedNode.sample_input}
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: 4, fontWeight: 'bold' }}>输出:</div>
                                        <div style={{ padding: 12, backgroundColor: '#f6ffed', borderRadius: 4, whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                                            {selectedNode.sample_output}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedNode.hint && (
                            <div style={{ marginBottom: 16 }}>
                                <strong>提示:</strong>
                                <div style={{ marginTop: 8, padding: 12, backgroundColor: '#fffbe6', borderRadius: 4, border: '1px solid #ffe58f' }}>
                                    {selectedNode.hint}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}