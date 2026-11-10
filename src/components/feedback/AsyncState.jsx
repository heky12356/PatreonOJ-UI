import { Alert, Button, Spinner } from 'react-bootstrap';

export function LoadingState({ text = '加载中...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary">
      <Spinner animation="border" role="status" className="mb-3" />
      <div>{text}</div>
    </div>
  );
}

export function ErrorState({
  title = '加载失败',
  message,
  retryText = '重试',
  onRetry,
}) {
  return (
    <Alert variant="danger" className="mb-0">
      <div className="fw-semibold mb-1">{title}</div>
      <div>{message || '请求未成功完成。'}</div>
      {onRetry ? (
        <div className="mt-3">
          <Button size="sm" variant="outline-danger" onClick={onRetry}>
            {retryText}
          </Button>
        </div>
      ) : null}
    </Alert>
  );
}

export function EmptyState({
  title = '暂无数据',
  description = '当前没有可展示的内容。',
  action,
}) {
  return (
    <div className="border rounded bg-light-subtle text-center py-5 px-4 text-secondary">
      <div className="fw-semibold text-dark mb-2">{title}</div>
      <div>{description}</div>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function TableEmptyRow({
  colSpan,
  loading = false,
  emptyText = '暂无数据',
  loadingText = '加载中...',
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center text-secondary py-4">
        {loading ? loadingText : emptyText}
      </td>
    </tr>
  );
}
