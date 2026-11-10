import { Table } from 'antd';
import { Link } from 'react-router-dom';
import VerdictTag from './VerdictTag.jsx';
import { formatDate, languageName, shortSubmissionId } from '../../utils/submission.js';

export default function SubmissionTable({ items = [], loading = false, pagination = false, showProblem = false }) {
  const columns = [
    { title: '提交 ID', key: 'id', width: 110, render: (_, row) => <Link className="font-monospace" title={row.submission_id} to={'/submission/' + row.submission_id}>{shortSubmissionId(row.submission_id)}</Link> },
    ...(showProblem ? [{ title: '题目', key: 'problem', ellipsis: true, render: (_, row) => <Link to={'/problem/' + row.question_pk}>{row.question_id} {row.question_title}</Link> }] : []),
    { title: '用户', key: 'user', width: 135, ellipsis: true, render: (_, row) => row.username ? <Link to={'/users/' + row.user_id} title={row.username}>{row.username}</Link> : <span className="text-secondary">已注销用户</span> },
    { title: '提交日期', key: 'date', width: 120, render: (_, row) => formatDate(row.submitted_at) },
    { title: '评测结果', key: 'verdict', width: 155, render: (_, row) => <VerdictTag record={row} /> },
    { title: '用时', dataIndex: 'runtime_ms', width: 90, render: (value) => (value ?? '-') + ' ms' },
    { title: '内存', dataIndex: 'memory_kb', width: 100, render: (value) => (value ?? '-') + ' KB' },
    { title: '语言', dataIndex: 'language', width: 90, render: languageName },
    { title: '代码', dataIndex: 'code_length', width: 95, render: (value) => (value ?? '-') + ' B' },
    { title: '操作', key: 'action', width: 75, render: (_, row) => <Link to={'/submission/' + row.submission_id}>详情</Link> },
  ];
  return <Table rowKey="submission_id" columns={columns} dataSource={items} loading={loading} pagination={pagination} size="middle" scroll={{ x: showProblem ? 1160 : 1010 }} className="oj-submission-table" locale={{ emptyText: '暂无提交记录' }} />;
}
