import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Button, Checkbox, Input, Space, Spin, Tabs, Tag } from 'antd';
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { cancelDebugRun, createDebugRun, getDebugRun, getPublicSamples } from '../../api/debug.js';
import { isLoggedIn } from '../../api/user.js';
import styles from './SelfTestPanel.module.css';

const verdicts = { OK: ['运行完成', 'success'], CE: ['编译错误', 'error'], RE: ['运行错误', 'error'], TLE: ['运行超时', 'warning'], MLE: ['内存超限', 'warning'], OLE: ['输出超限', 'warning'], SE: ['服务异常', 'error'], CANCELLED: ['已停止', 'default'] };

export default forwardRef(function SelfTestPanel({ problem, code, language, onBusyChange }, ref) {
  const [samples, setSamples] = useState([]);
  const [sampleError, setSampleError] = useState('');
  const [input, setInput] = useState('');
  const [expected, setExpected] = useState('');
  const [compare, setCompare] = useState(false);
  const [job, setJob] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [resultTab, setResultTab] = useState('stdout');
  const panelRef = useRef(null);
  const sequence = useRef(0);
  const mounted = useRef(true);
  const busy = starting || ['pending', 'running'].includes(job?.status);
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; sequence.current += 1; }; }, []);
  useEffect(() => {
    const abort = new AbortController();
    getPublicSamples(problem.id, abort.signal).then((data) => { setSamples(data.samples || []); setSampleError(data.truncated ? '部分公开样例较大，请从题面复制所需输入。' : ''); }).catch((e) => { if (e.name !== 'AbortError') setSampleError('公开样例暂不可用，可以手动输入测试数据。'); });
    return () => abort.abort();
  }, [problem.id]);
  useEffect(() => {
    if (!job?.id || !['pending', 'running'].includes(job.status)) return undefined;
    let disposed = false; let timer;
    const abort = new AbortController();
    const poll = async () => {
      try {
        const result = await getDebugRun(job.id, abort.signal);
        if (disposed) return;
        setJob(result);
        if (['pending', 'running'].includes(result.status)) timer = setTimeout(poll, 900);
        else if (result.stderr && result.verdict !== 'OK') setResultTab('stderr');
      } catch (e) { if (!disposed) { setError(e.message); setJob((old) => ({ ...old, status: 'failed' })); } }
    };
    timer = setTimeout(poll, 500);
    return () => { disposed = true; clearTimeout(timer); abort.abort(); };
  }, [job?.id, job?.status]);
  const run = async () => {
    panelRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    if (busy) return;
    if (!isLoggedIn()) { setError('登录后可以运行自测。'); return; }
    if (!code.trim()) { setError('请先编写代码。'); return; }
    if (new TextEncoder().encode(input).length > 65536 || (compare && new TextEncoder().encode(expected).length > 65536)) { setError('输入和预期输出各不能超过 64 KB。'); return; }
    const runSequence = ++sequence.current;
    setStarting(true); setError(''); setJob(null); setResultTab('stdout');
    try {
      const result = await createDebugRun({ question_pk: problem.id, language, code, input, ...(compare ? { expected_output: expected } : {}) });
      if (mounted.current && runSequence === sequence.current) setJob(result);
    } catch (e) { if (mounted.current) setError(e.message); }
    finally { if (mounted.current && runSequence === sequence.current) setStarting(false); }
  };
  useImperativeHandle(ref, () => ({ run }));
  const stop = async () => { if (!job?.id) return; try { setJob(await cancelDebugRun(job.id)); } catch (e) { setError(e.message); } };
  const meta = verdicts[job?.verdict] || ['等待结果', 'default'];
  const finished = ['completed', 'cancelled'].includes(job?.status);
  return <section ref={panelRef} className={styles.panel} aria-labelledby="self-test-heading">
    <header className={styles.header}><div><h3 id="self-test-heading">在线自测</h3><p>使用样例或自定义输入调试代码；自测单独运行，正式提交用于完整评测。</p></div><Space wrap><Button aria-label="运行自测" icon={<PlayCircleOutlined />} loading={starting} disabled={busy} onClick={run}>运行自测</Button>{busy && <Button aria-label="停止" danger icon={<StopOutlined />} disabled={!job?.id} onClick={stop}>停止</Button>}</Space></header>
    {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}
    <div className={styles.workspace}><div className={styles.inputs}>
      <div className={styles.samples}><strong>测试输入</strong><Space wrap>{samples.map((sample, index) => <Button size="small" key={sample.id} disabled={busy} onClick={() => { setInput(sample.input); setExpected(sample.output); setCompare(true); }}>载入样例 {index + 1}</Button>)}</Space></div>
      {sampleError && <p className={styles.hint}>{sampleError}</p>}
      {!sampleError && samples.length === 0 && <p className={styles.hint}>可以从题面复制样例，或输入自己的测试数据。</p>}
      <Input.TextArea aria-label="自测输入" spellCheck={false} value={input} onChange={(e) => setInput(e.target.value)} disabled={busy} rows={8} placeholder="输入程序从标准输入读取的数据；也可以留空" className={styles.textarea} />
      <Checkbox checked={compare} disabled={busy} onChange={(e) => setCompare(e.target.checked)}>对照预期输出</Checkbox>
      {compare && <Input.TextArea aria-label="预期输出" spellCheck={false} value={expected} onChange={(e) => setExpected(e.target.value)} disabled={busy} rows={4} placeholder="预期输出，可以为空" className={styles.textarea} />}
    </div><div className={styles.results} aria-live="polite">
      <div className={styles.resultHeading}><strong>运行结果</strong>{busy ? <span><Spin size="small" /> {job?.status === 'running' ? '运行中…' : '等待运行…'}</span> : finished && <Tag color={meta[1]}>{meta[0]}</Tag>}</div>
      {finished && <div className={styles.metrics}><span>用时 {job.runtime_ms ?? 0} ms</span><span>内存 {job.memory_kb ?? 0} KB</span><span>退出码 {job.exit_code ?? '—'}</span>{job.comparison && <Tag color={job.comparison === 'match' ? 'success' : 'warning'}>{job.comparison === 'match' ? '输出一致' : '输出不一致'}</Tag>}</div>}
      <Tabs activeKey={resultTab} onChange={setResultTab} items={[{ key: 'stdout', label: '程序输出', children: <pre className={styles.output}>{job?.stdout || (finished ? '（无输出）' : '运行后将在这里显示标准输出。')}</pre> }, { key: 'stderr', label: '错误信息', children: <pre className={styles.output}>{job?.stderr || (finished ? '（无错误信息）' : '编译或运行错误将在这里显示。')}</pre> }]} />
      <p className={styles.hint}>仅使用当前输入，不读取隐藏测试数据，也不改变题目完成状态。</p>
    </div></div>
  </section>;
});
