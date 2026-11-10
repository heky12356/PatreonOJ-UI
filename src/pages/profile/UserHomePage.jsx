import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Avatar, Button, Card, Empty, Spin, Table, Tag, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserHome } from '../../api/user.js';
import useCurrentUserUuid from '../../hooks/useCurrentUserUuid.js';
import SubmissionTable from '../../components/submissions/SubmissionTable.jsx';
import { formatDate } from '../../utils/submission.js';
import styles from '../../components/submissions/Record.module.css';

export default function UserHomePage() {
  const { id } = useParams();
  const uuid = useCurrentUserUuid();
  const [page, setPage] = useState(1);
  const [home, setHome] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setPage(1); setHome(null); }, [id]);
  useEffect(() => {
    let disposed = false;
    setLoading(true); setError('');
    getUserHome(id, { page, size: 20 }).then((result) => { if (!disposed) setHome(result); })
      .catch((err) => { if (!disposed) {setHome(null); setError(err.message || '读取主页失败');} })
      .finally(() => { if (!disposed) setLoading(false); });
    return () => { disposed = true; };
  }, [id, uuid, page]);
  if (error) return <div className={styles.page}><Alert type="error" message="主页加载失败" description={error} /></div>;
  if (!home) return <div className={styles.page}><Spin /> 正在读取主页…</div>;
  const owner = home.uuid === uuid;
  const columns = [
    { title: '题目', key: 'question', render: (_, row) => <Link to={'/problem/' + row.id}>{row.question_id} · {row.title}</Link> },
    { title: '状态', key: 'status', width: 110, render: (_, row) => <Tag color={row.accepted ? 'success' : 'warning'}>{row.accepted ? '已通过' : '未通过'}</Tag> },
    { title: '尝试次数', dataIndex: 'attempts', width: 110 },
    { title: '最近提交', dataIndex: 'last_submitted_at', width: 135, render: formatDate },
  ];
  return <main className={styles.page}>
    <Card className={styles.card}><div className={styles.profileHero}><Avatar size={80} src={home.avatar_url?.startsWith('oss/') ? '/' + home.avatar_url : home.avatar_url} icon={<UserOutlined />} /><div><h1>{home.username}</h1>{home.nickname && home.nickname !== home.username && <Typography.Text>{home.nickname}</Typography.Text>}<p>加入于 {formatDate(home.created_at)}</p></div>{owner && <Button style={{ marginLeft: 'auto' }}><Link to="/settings">编辑资料与隐私</Link></Button>}</div></Card>
    {!home.activity_visible ? <Card className={styles.card}><Empty description="该用户已隐藏做题详情" /></Card> : <>
      {!home.show_activity && <Alert className={styles.notice} type="info" showIcon message="做题详情已隐藏，当前内容仅本人和管理员可见。" />}
      <div className={styles.stats}>{[['已通过', home.stats?.solved_count], ['尝试题目', home.stats?.attempted_count], ['提交次数', home.stats?.submission_count], ['通过率', home.stats?.submission_count ? Math.round(home.stats.accepted_count / home.stats.submission_count * 100) + '%' : '—']].map(([label, value]) => <div className={styles.stat} key={label}><span>{label}</span><strong>{value ?? 0}</strong></div>)}</div>
      <Card className={styles.card} title="做题详情"><Table rowKey="id" columns={columns} dataSource={home.problems || []} loading={loading} scroll={{ x: 620 }} pagination={{ current: page, pageSize: 20, total: home.total, showSizeChanger: false, onChange: setPage, showTotal: (total) => '共 ' + total + ' 题' }} locale={{ emptyText: '还没有做题记录' }} /></Card>
      <Card className={styles.card} title="最近提交"><SubmissionTable items={home.recent_submissions || []} showProblem /></Card>
    </>}
  </main>;
}
