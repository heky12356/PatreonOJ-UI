export const VERDICTS = {
  AC: { text: '通过', color: 'success' },
  WA: { text: '答案错误', color: 'error' },
  RE: { text: '运行错误', color: 'error' },
  TLE: { text: '时间超限', color: 'warning' },
  MLE: { text: '内存超限', color: 'warning' },
  OLE: { text: '输出超限', color: 'warning' },
  CE: { text: '编译错误', color: 'warning' },
  SE: { text: '系统错误', color: 'default' },
  PENDING: { text: '等待评测', color: 'default' },
  JUDGING: { text: '评测中', color: 'processing' },
};
export function getVerdict(record = {}) {
  const stage = String(record.status || '').toLowerCase();
  if (stage === 'pending') return 'PENDING';
  if (['processing', 'judging'].includes(stage)) return 'JUDGING';
  const explicit = String(record.verdict || '').toUpperCase();
  if (VERDICTS[explicit]) return explicit;
  if (stage === 'accepted') return 'AC';
  if (stage === 'error') return ({ E002: 'CE', E003: 'TLE', E004: 'MLE' })[record.error_code] || 'SE';
  if (stage === 'completed' && Array.isArray(record.results) && record.results.length) {
    return record.results.every((test) => test.is_correct) ? 'AC' : 'WA';
  }
  return 'SE';
}
export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
export const shortSubmissionId = (value) => String(value || '').slice(0, 8) || '-';
export const languageName = (value) => ({ cpp: 'C++', python: 'Python', java: 'Java', go: 'Go' })[value] || value || '-';
