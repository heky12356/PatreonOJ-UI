import { Tag } from 'antd';
import { getVerdict, VERDICTS } from '../../utils/submission.js';
export default function VerdictTag({ record }) {
  const verdict = getVerdict(record);
  const meta = VERDICTS[verdict];
  return <Tag color={meta.color} title={meta.text} aria-label={verdict + '：' + meta.text} style={{ whiteSpace: 'nowrap', margin: 0, fontWeight: 600 }}>{verdict} · {meta.text}</Tag>;
}
