/**
 * 评测结果详情页面
 * 展示提交代码的详细评测结果，包括每个测试用例的执行情况
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    Tag, 
    Button, 
    Spin, 
    Alert, 
    Progress, 
    Descriptions, 
    Table,
    Space,
    Statistic,
    Row,
    Col,
    message
} from 'antd';
import { 
    ArrowLeftOutlined, 
    CheckCircleOutlined, 
    CloseCircleOutlined,
    ClockCircleOutlined,
    DatabaseOutlined,
    CodeOutlined
} from '@ant-design/icons';
import { getSubmissionResult } from '../../api/judge.js';
import styles from './SubmissionDetailPage.module.css';

function SubmissionDetailPage() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submissionData, setSubmissionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 获取评测结果详情
    useEffect(() => {
        const fetchSubmissionDetail = async () => {
            if (!submissionId) {
                setError('提交ID不存在');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const result = await getSubmissionResult(submissionId);
                // console.log('获取评测结果成功:', result);
                setSubmissionData(result);
            } catch (err) {
                console.error('获取评测结果失败:', err);
                setError(err.message || '获取评测结果失败');
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissionDetail();
    }, [submissionId]);

    // 返回上一页
    const handleGoBack = () => {
        navigate(-1);
    };

    // 获取状态对应的颜色和图标
    const getStatusInfo = (status) => {
        const statusMap = {
            completed: { color: 'success', icon: <CheckCircleOutlined />, text: '评测完成' },
            processing: { color: 'processing', icon: <ClockCircleOutlined />, text: '评测中' },
            pending: { color: 'default', icon: <ClockCircleOutlined />, text: '等待评测' },
            error: { color: 'error', icon: <CloseCircleOutlined />, text: '评测失败' }
        };
        return statusMap[status] || { color: 'default', icon: null, text: status };
    };

    // 格式化时间
    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleString('zh-CN');
    };

    // 测试用例表格列定义
    const testCaseColumns = [
        {
            title: '用例编号',
            dataIndex: 'index',
            key: 'index',
            width: 100,
            render: (_, __, index) => `#${index + 1}`
        },
        {
            title: '状态',
            dataIndex: 'is_correct',
            key: 'is_correct',
            width: 100,
            render: (isCorrect) => (
                <Tag 
                    color={isCorrect ? 'success' : 'error'}
                    icon={isCorrect ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                >
                    {isCorrect ? '通过' : '失败'}
                </Tag>
            )
        },
        {
            title: '运行时间',
            dataIndex: 'runtime',
            key: 'runtime',
            width: 120,
            render: (runtime) => (
                <span>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {runtime}ms
                </span>
            )
        },
        {
            title: '内存使用',
            dataIndex: 'memory_usage',
            key: 'memory_usage',
            width: 120,
            render: (memory) => (
                <span>
                    <DatabaseOutlined style={{ marginRight: 4 }} />
                    {memory || 0}KB
                </span>
            )
        }
    ];

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <Spin size="large" />
                    <p>正在加载评测结果...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Alert
                    message="加载失败"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={handleGoBack}>
                            返回
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!submissionData) {
        return (
            <div className={styles.container}>
                <Alert
                    message="未找到评测结果"
                    description="该提交记录不存在或已被删除"
                    type="warning"
                    showIcon
                    action={
                        <Button size="small" onClick={handleGoBack}>
                            返回
                        </Button>
                    }
                />
            </div>
        );
    }

    const statusInfo = getStatusInfo(submissionData.status);
    const passRate = submissionData.pass_rate || 0;

    return (
        <div className={styles.container}>
            {/* 页面头部 */}
            <div className={styles.header}>
                <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleGoBack}
                    className={styles.backButton}
                >
                    返回
                </Button>
                <h1 className={styles.title}>评测结果详情</h1>
            </div>

            {/* 基本信息卡片 */}
            <Card className={styles.infoCard} title="提交信息">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="评测状态"
                            value={statusInfo.text}
                            prefix={statusInfo.icon}
                            valueStyle={{ color: statusInfo.color === 'success' ? '#52c41a' : statusInfo.color === 'error' ? '#ff4d4f' : '#1890ff' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="通过率"
                            value={Math.round(passRate * 100)}
                            suffix="%"
                            valueStyle={{ color: passRate === 1 ? '#52c41a' : passRate > 0.5 ? '#faad14' : '#ff4d4f' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="通过用例"
                            value={`${submissionData.passed_cases || 0}/${submissionData.total_cases || 0}`}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Statistic
                            title="题目编号"
                            value={submissionData.question_number || '-'}
                            prefix={<CodeOutlined />}
                        />
                    </Col>
                </Row>

                <div className={styles.progressSection}>
                    <h4>测试用例通过情况</h4>
                    <Progress
                        percent={Math.round(passRate * 100)}
                        status={passRate === 1 ? 'success' : 'active'}
                        strokeColor={passRate === 1 ? '#52c41a' : passRate > 0.5 ? '#faad14' : '#ff4d4f'}
                    />
                </div>

                <Descriptions column={2} className={styles.descriptions}>
                    <Descriptions.Item label="提交ID">{submissionData.submission_id}</Descriptions.Item>
                    <Descriptions.Item label="用户ID">{submissionData.user_id}</Descriptions.Item>
                    <Descriptions.Item label="提交时间">{formatTime(submissionData.created_at)}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{formatTime(submissionData.updated_at)}</Descriptions.Item>
                </Descriptions>
            </Card>

            {/* 测试用例详情 */}
            <Card 
                className={styles.testCasesCard} 
                title={`测试用例详情 (${submissionData.results?.length || 0} 个用例)`}
            >
                {submissionData.results && submissionData.results.length > 0 ? (
                    <Table
                        columns={testCaseColumns}
                        dataSource={submissionData.results}
                        rowKey={(record, index) => index}
                        pagination={false}
                        scroll={{ x: 1200 }}
                        className={styles.testCaseTable}
                        rowClassName={(record) => record.is_correct ? styles.passedRow : styles.failedRow}
                    />
                ) : (
                    <Alert
                        message="暂无测试用例数据"
                        description="该提交可能还在评测中，或者评测过程中出现了问题"
                        type="info"
                        showIcon
                    />
                )}
            </Card>

            {/* 操作按钮 */}
            <div className={styles.actions}>
                <Space>
                    <Button onClick={handleGoBack}>
                        返回上一页
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={() => navigate(`/questionBank/${submissionData.question_id || submissionData.question_number}`)}
                    >
                        重新提交
                    </Button>
                </Space>
            </div>
        </div>
    );
}

export default SubmissionDetailPage;