import { useEffect, useState } from 'react';
import { Alert, Button, Card, Input, Select, Space, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import { getProblemSubmissions, getUserSubmissions } from '../../api/judge.js';
import useCurrentUserUuid from '../../hooks/useCurrentUserUuid.js';
import SubmissionTable from '../../components/submissions/SubmissionTable.jsx';
import { VERDICTS } from '../../utils/submission.js';
import styles from '../../components/submissions/Record.module.css';

export default function SubmissionsPage({ own = false }) {
  const { id } = useParams();
  const uuid = useCurrentUserUuid();
  const [filters, setFilters] = useState({ page: 1, size: 20, status: '', language: '', problem_id: '' });
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const change = (patch) => setFilters((previous) => ({ ...previous, ...patch, page: 1 }));
  useEffect(() => {
    if (own && !uuid) return;
    let disposed = false;
    let timer;
    const fetchList = async () => {
      try {
        const result = own ? await getUserSubmissions(uuid, filters) : await getProblemSubmissions(id, filters);
        if (disposed) return;
        setData(result); setError('');
        if (result.items.some((row) => ['pending', 'processing'].includes(row.status))) timer = setTimeout(fetchList, 1800);
      } catch (err) {
        if (!disposed) { setError(err.message || '获取提交记录失败'); setData({ items: [], total: 0 }); }
      } finally { if (!disposed) setLoading(false); }
    };
    setLoading(true);
    fetchList();
    return () => { disposed = true; clearTimeout(timer); };
  }, [own, uuid, id, filters, revision]);
  if (own && !uuid) return <div className={styles.page}><Alert type="info" message={<span>请先 <Link to="/login">登录</Link> 查看个人提交。</span>} /></div>;
  return <div className={styles.page}>
    <div className={styles.heading}><div><Typography.Title level={2}>{own ? '我的提交记录' : '题目提交记录'}</Typography.Title><Typography.Text type="secondary">{own ? '每一次尝试，都记录在这里。' : <Link to={'/problem/' + id}>返回题目</Link>}</Typography.Text></div><Button icon={<ReloadOutlined />} loading={loading} onClick={() => setRevision((value) => value + 1)}>刷新</Button></div>
    <Card className={styles.card}>
      <Space wrap className={styles.filters}>
        <Select aria-label="评测结果筛选" value={filters.status} onChange={(status) => change({ status })} style={{ width: 180 }} options={[{ value: '', label: '全部结果' }, ...Object.entries(VERDICTS).map(([value, meta]) => ({ value, label: value + ' · ' + meta.text }))]} />
        <Select aria-label="语言筛选" value={filters.language} onChange={(language) => change({ language })} style={{ width: 140 }} options={[{ value: '', label: '全部语言' }, { value: 'python', label: 'Python' }, { value: 'cpp', label: 'C++' }, { value: 'java', label: 'Java' }, { value: 'go', label: 'Go' }]} />
        {own && <Input aria-label="题目筛选" placeholder="题目 ID" value={filters.problem_id} onChange={(event) => change({ problem_id: event.target.value })} style={{ width: 150 }} />}
      </Space>
      {error && <Alert type="error" showIcon message={error} className={styles.notice} />}
      <SubmissionTable items={data.items} loading={loading} showProblem={own} pagination={{ current: filters.page, pageSize: filters.size, total: data.total, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], showTotal: (total) => '共 ' + total + ' 条', onChange: (page, size) => setFilters((previous) => ({ ...previous, page, size })) }} />
    </Card>
  </div>;
}
