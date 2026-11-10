import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Empty, Space, Spin, Tabs, Typography, message } from 'antd';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { getSubmissionResult } from '../../api/judge.js';
import { getVerdict, VERDICTS, formatDate, languageName, shortSubmissionId } from '../../utils/submission.js';
import VerdictTag from '../submissions/VerdictTag.jsx';
import styles from '../submissions/Record.module.css';

export default function SubmissionDetailPage() {
  const { submissionId } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let disposed = false;
    let timer;
    setRecord(null); setError('');
    const load = async () => {
      try {
        const result = await getSubmissionResult(submissionId);
        if (disposed) return;
        setRecord(result); setError('');
        if (['PENDING', 'JUDGING'].includes(getVerdict(result))) timer = setTimeout(load, 1500);
        else window.dispatchEvent(new CustomEvent('submission-evaluated'));
      } catch (err) { if (!disposed) setError(err.message || '读取提交失败'); }
    };
    load();
    return () => { disposed = true; clearTimeout(timer); };
  }, [submissionId, revision]);
  const sourceCode = typeof record?.source_code === 'string' ? record.source_code : typeof record?.code === 'string' ? record.code : null;
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(sourceCode); message.success('代码已复制'); }
    catch { message.error('复制失败，请手动选择代码'); }
  };
  if (error) return <div className={styles.page}><Alert type="error" showIcon message="无法查看这条提交" description={error} action={<Button onClick={() => setRevision((value) => value + 1)}>重试</Button>} /></div>;
  if (!record) return <div className={styles.page}><Spin /> 正在读取提交…</div>;
  const verdict = getVerdict(record);
  const waiting = ['PENDING', 'JUDGING'].includes(verdict);
  const cases = record.results || [];
  const passed = record.passed_cases ?? cases.filter((test) => test.is_correct).length;
  const total = record.total_cases ?? cases.length;
  const caseContent = cases.length ? <div className={styles.caseGrid}>{cases.map((test, index) => <section className={styles.testCase} key={test.test_case_id || index}>
    <header><strong>#{index + 1}</strong><VerdictTag record={{ status: 'completed', verdict: test.verdict || (test.is_correct ? 'AC' : 'WA') }} /></header>
    <small>{test.runtime ?? 0} ms · {test.memory_usage ?? 0} KB</small>
    {test.is_hidden ? <small>隐藏测试</small> : <details><summary>输入与输出</summary>{[['输入', test.input], ['期望输出', test.expected_output], ['实际输出', test.actual_output]].map(([label, content]) => <div key={label}><small>{label}</small><pre className={styles.io}>{content || '（空）'}</pre></div>)}</details>}
  </section>)}</div> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={waiting ? '评测完成后显示测试点结果' : '暂无测试点结果'} />;
  const codeContent = sourceCode !== null ? <>
    <div className={styles.heading}><Typography.Text type="secondary">{languageName(record.language)} · {record.code_length ?? new TextEncoder().encode(sourceCode).length} B</Typography.Text><Button size="small" icon={<CopyOutlined />} onClick={copyCode}>复制代码</Button></div>
    <pre className={styles.code} aria-label="提交的源代码"><code>{sourceCode.split('\n').map((line, index) => <span className={styles.codeLine} key={index}><span className={styles.lineNumber} aria-hidden="true">{index + 1}</span>{line || '\u200b'}{'\n'}</span>)}</code></pre>
  </> : <Empty description="此提交没有可用的源代码" />;
  return <main className={styles.page}>
    <div className={styles.heading}><div><Space><Link to={'/problem/' + record.question_pk + '/submissions'}>提交记录</Link><span>/ #{shortSubmissionId(record.submission_id)}</span></Space><Typography.Title level={2} style={{ marginTop: 12 }}><Link to={'/problem/' + record.question_pk}>{record.question_id || ''} {record.question_title || '评测详情'}</Link></Typography.Title></div><Button icon={<ReloadOutlined />} onClick={() => setRevision((value) => value + 1)}>刷新</Button></div>
    <div className={styles.detailGrid}><div>
      <Card className={styles.card}>
        <div className={styles.heading}><div><VerdictTag record={record} /><Typography.Title level={3} style={{ marginTop: 12, marginBottom: 0 }}>{VERDICTS[verdict].text}</Typography.Title></div><Typography.Text type="secondary">{waiting ? <Spin size="small" /> : total ? passed + ' / ' + total + ' 个测试点通过' : '—'}</Typography.Text></div>
        {record.error_message && <Alert type={verdict === 'SE' ? 'warning' : 'error'} showIcon message={record.message || VERDICTS[verdict].text} description={<pre className={styles.io}>{record.error_message}</pre>} />}
        <Tabs defaultActiveKey="code" items={[{ key: 'code', label: '源代码', children: codeContent }, { key: 'cases', label: '测试点 (' + total + ')', children: caseContent }]} />
      </Card>
    </div><aside><Card title="提交信息" className={styles.card}><dl className={styles.meta}>
      <div><dt>用户</dt><dd>{record.username ? <Link to={'/users/' + record.user_id}>{record.username}</Link> : '已注销用户'}</dd></div>
      <div><dt>提交编号</dt><dd title={record.submission_id} className="font-monospace">#{shortSubmissionId(record.submission_id)}</dd></div>
      <div><dt>提交日期</dt><dd>{formatDate(record.created_at)}</dd></div>
      <div><dt>语言</dt><dd>{languageName(record.language)}</dd></div>
      <div><dt>运行用时</dt><dd>{waiting ? '—' : (record.runtime_ms ?? 0) + ' ms'}</dd></div>
      <div><dt>内存使用</dt><dd>{waiting ? '—' : (record.memory_kb ?? 0) + ' KB'}</dd></div>
    </dl></Card><Link to={'/problem/' + record.question_pk}>返回题目并再次提交 →</Link></aside></div>
  </main>;
}
