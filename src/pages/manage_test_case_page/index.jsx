import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  ListGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  TableEmptyRow,
} from '../../components/feedback/AsyncState.jsx';
import {
  deleteTestCase,
  getProblemTestcaseFileTree,
  getTestCaseById,
  getTestCasesByProblemNumber,
  updateTestCaseViaOss,
  uploadTestCaseViaOss,
} from '../../api/test_case_api';
import { getRequestErrorMessage } from '../../utils/request.js';

const formatSize = (size) => {
  const value = Number(size || 0);
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

const getCaseNoFromKey = (key) => {
  const value = String(key || '').trim();
  const fileName = value.split('/').pop() || value;
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
};

const sortObjects = (objects) =>
  [...objects].sort((a, b) => {
    const ad = Boolean(a?.is_dir);
    const bd = Boolean(b?.is_dir);
    if (ad !== bd) return ad ? -1 : 1;
    return String(a?.key || '').localeCompare(String(b?.key || ''));
  });

function TestCaseFormModal({
  mode,
  show,
  problemId,
  testCase,
  onClose,
  onSaved,
}) {
  const isEdit = mode === 'edit';
  const [caseNo, setCaseNo] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [isHidden, setIsHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!show) return;
    setCaseNo(getCaseNoFromKey(testCase?.input_key));
    setInputFile(null);
    setOutputFile(null);
    setIsHidden(Boolean(testCase?.is_hidden ?? true));
    setError('');
  }, [show, testCase]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!problemId) {
      setError('缺少题目主键。');
      return;
    }

    if (!isEdit && !caseNo.trim()) {
      setError('请填写用例编号。');
      return;
    }

    if (!isEdit && (!inputFile || !outputFile)) {
      setError('请同时选择输入文件和输出文件。');
      return;
    }

    if (isEdit && !testCase?.id) {
      setError('缺少测试用例信息。');
      return;
    }

    setLoading(true);
    setError('');
    try {
      let saved = null;

      if (isEdit) {
        saved = await updateTestCaseViaOss({
          id: testCase.id,
          question_pk: problemId,
          input_key: testCase.input_key,
          output_key: testCase.output_key,
          inputFile,
          outputFile,
          is_hidden: isHidden,
        });
      } else {
        saved = await uploadTestCaseViaOss({
          question_pk: Number(problemId),
          case_no: caseNo.trim(),
          inputFile,
          outputFile,
          is_hidden: isHidden,
        });
      }

      await onSaved?.(saved?.result ?? saved ?? null);
      onClose();
    } catch (err) {
      setError(
        getRequestErrorMessage(
          err,
          isEdit ? '更新测试用例失败。' : '创建测试用例失败。'
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? '编辑测试用例' : '新增测试用例'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error ? <Alert variant="danger">{error}</Alert> : null}
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>用例编号</Form.Label>
                <Form.Control
                  value={caseNo}
                  onChange={(event) => setCaseNo(event.target.value)}
                  placeholder="例如：1"
                  disabled={isEdit || loading}
                />
                <Form.Text className="text-secondary">
                  {isEdit
                    ? '编辑时沿用当前文件名。'
                    : '会生成 {caseNo}.in 和 {caseNo}.out。'}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="testcase-hidden-switch"
                label={isHidden ? '隐藏用例' : '公开用例'}
                checked={isHidden}
                disabled={loading}
                onChange={(event) => setIsHidden(event.target.checked)}
              />
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {isEdit ? '替换输入文件（可选）' : '输入文件（.in）'}
                </Form.Label>
                <Form.Control
                  type="file"
                  disabled={loading}
                  onChange={(event) =>
                    setInputFile(event.target.files?.[0] ?? null)
                  }
                />
                {isEdit && testCase?.input_key ? (
                  <Form.Text className="text-secondary">
                    当前文件：{testCase.input_key}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>
                  {isEdit ? '替换输出文件（可选）' : '输出文件（.out）'}
                </Form.Label>
                <Form.Control
                  type="file"
                  disabled={loading}
                  onChange={(event) =>
                    setOutputFile(event.target.files?.[0] ?? null)
                  }
                />
                {isEdit && testCase?.output_key ? (
                  <Form.Text className="text-secondary">
                    当前文件：{testCase.output_key}
                  </Form.Text>
                ) : null}
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button variant="dark" onClick={handleSubmit} disabled={loading}>
          {loading ? (isEdit ? '保存中...' : '创建中...') : isEdit ? '保存修改' : '开始创建'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function ManageTestCasePage() {
  const { problem_id: problemId } = useParams();

  const [activeView, setActiveView] = useState('business');
  const [testCases, setTestCases] = useState([]);
  const [questionMeta, setQuestionMeta] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const [tree, setTree] = useState({ prefix: '', objects: [] });
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState('');
  const [recursive, setRecursive] = useState(false);

  const [feedback, setFeedback] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTestCases = async () => {
    if (!problemId) return [];

    setListLoading(true);
    setListError('');
    try {
      const response = await getTestCasesByProblemNumber(problemId);
      const rows = Array.isArray(response?.result) ? response.result : [];

      setTestCases(rows);
      setQuestionMeta({
        question_pk: response?.question_pk ?? Number(problemId),
        question_id: response?.question_id || '',
        question_title: response?.question_title || '',
        count: Number(response?.count ?? rows.length),
      });
      return rows;
    } catch (error) {
      setListError(getRequestErrorMessage(error, '获取测试用例列表失败。'));
      setTestCases([]);
      setQuestionMeta(null);
      return [];
    } finally {
      setListLoading(false);
    }
  };

  const loadDetail = async (id) => {
    if (!id) {
      setDetail(null);
      setDetailError('');
      return null;
    }

    setDetailLoading(true);
    setDetailError('');
    try {
      const response = await getTestCaseById(id);
      const result = response?.result ?? null;
      setDetail(result);
      return result;
    } catch (error) {
      setDetailError(getRequestErrorMessage(error, '获取测试用例详情失败。'));
      setDetail(null);
      return null;
    } finally {
      setDetailLoading(false);
    }
  };

  const loadTree = async () => {
    if (!problemId) return;

    setTreeLoading(true);
    setTreeError('');
    try {
      const response = await getProblemTestcaseFileTree({
        question_pk: Number(problemId),
        recursive,
      });
      setTree({
        prefix: response?.prefix || `problems/${problemId}/`,
        objects: Array.isArray(response?.objects) ? response.objects : [],
      });
    } catch (error) {
      setTreeError(getRequestErrorMessage(error, '获取 OSS 文件树失败。'));
      setTree({ prefix: '', objects: [] });
    } finally {
      setTreeLoading(false);
    }
  };

  const refreshAll = async ({ keepSelection = true } = {}) => {
    const rows = await loadTestCases();
    await loadTree();

    let nextSelectedId = selectedId;
    if (!keepSelection || !rows.some((item) => item.id === selectedId)) {
      nextSelectedId = rows[0]?.id ?? null;
      setSelectedId(nextSelectedId);
    }

    if (nextSelectedId) {
      await loadDetail(nextSelectedId);
    } else {
      setDetail(null);
      setDetailError('');
    }
  };

  useEffect(() => {
    void refreshAll({ keepSelection: false });
  }, [problemId, recursive]);

  useEffect(() => {
    if (selectedId) {
      void loadDetail(selectedId);
    }
  }, [selectedId]);

  const treeObjects = useMemo(() => sortObjects(tree?.objects ?? []), [tree]);
  const selectedSummary = useMemo(
    () => testCases.find((item) => item.id === selectedId) ?? null,
    [selectedId, testCases]
  );

  const handleDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await deleteTestCase({ id: selectedId });
      setFeedback({ type: 'success', text: '测试用例已删除。' });
      setShowDeleteModal(false);
      await refreshAll({ keepSelection: false });
    } catch (error) {
      setFeedback({
        type: 'danger',
        text: getRequestErrorMessage(error, '删除测试用例失败。'),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="align-items-center g-2 mb-3">
        <Col xs={12} md>
          <h2 className="mb-1">测试用例管理</h2>
          <div className="text-secondary small">
            题目主键 {problemId || '-'}
            {questionMeta?.question_id ? ` / 题号 ${questionMeta.question_id}` : ''}
            {questionMeta?.question_title ? ` / ${questionMeta.question_title}` : ''}
          </div>
        </Col>
        <Col xs={12} md="auto" className="d-flex gap-2">
          <Button
            variant={activeView === 'business' ? 'dark' : 'outline-secondary'}
            onClick={() => setActiveView('business')}
          >
            业务测试用例
          </Button>
          <Button
            variant={activeView === 'oss' ? 'dark' : 'outline-secondary'}
            onClick={() => setActiveView('oss')}
          >
            OSS 文件树
          </Button>
        </Col>
      </Row>

      {feedback ? (
        <Alert
          variant={feedback.type}
          dismissible
          onClose={() => setFeedback(null)}
        >
          {feedback.text}
        </Alert>
      ) : null}

      {activeView === 'business' ? (
        <Row className="g-3">
          <Col xl={7}>
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>测试用例列表</span>
                <div className="d-flex gap-2">
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => void refreshAll()}
                    disabled={listLoading || treeLoading}
                  >
                    刷新
                  </Button>
                  <Button size="sm" variant="dark" onClick={() => setShowAddModal(true)}>
                    新增测试用例
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <Row className="g-3 mb-3">
                  <Col md={4}>
                    <div className="p-3 bg-light border rounded">
                      <div className="text-secondary small">用例数量</div>
                      <div className="fs-5 fw-semibold">
                        {questionMeta?.count ?? testCases.length}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 bg-light border rounded">
                      <div className="text-secondary small">隐藏用例</div>
                      <div className="fs-5 fw-semibold">
                        {testCases.filter((item) => item.is_hidden).length}
                      </div>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 bg-light border rounded">
                      <div className="text-secondary small">公开用例</div>
                      <div className="fs-5 fw-semibold">
                        {testCases.filter((item) => !item.is_hidden).length}
                      </div>
                    </div>
                  </Col>
                </Row>

                {listError ? (
                  <ErrorState
                    title="测试用例列表加载失败"
                    message={listError}
                    onRetry={() => void refreshAll()}
                  />
                ) : listLoading && testCases.length === 0 ? (
                  <LoadingState text="正在加载测试用例..." />
                ) : (
                  <Table hover responsive className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>用例编号</th>
                        <th>状态</th>
                        <th>输入大小</th>
                        <th>输出大小</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testCases.length === 0 ? (
                        <TableEmptyRow
                          colSpan={5}
                          emptyText="暂无测试用例"
                        />
                      ) : (
                        testCases.map((item) => {
                          const active = item.id === selectedId;
                          return (
                            <tr
                              key={item.id}
                              onClick={() => setSelectedId(item.id)}
                              className={active ? 'table-primary' : ''}
                              style={{ cursor: 'pointer' }}
                            >
                              <td>{item.id}</td>
                              <td>{getCaseNoFromKey(item.input_key)}</td>
                              <td>
                                {item.is_hidden ? (
                                  <Badge bg="warning" text="dark">
                                    隐藏
                                  </Badge>
                                ) : (
                                  <Badge bg="success">公开</Badge>
                                )}
                              </td>
                              <td>{formatSize(item.input_size)}</td>
                              <td>{formatSize(item.output_size)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xl={5}>
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>测试用例详情</span>
                {selectedSummary ? (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      onClick={() => void loadDetail(selectedSummary.id)}
                      disabled={detailLoading}
                    >
                      刷新详情
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => setShowEditModal(true)}
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      删除
                    </Button>
                  </div>
                ) : null}
              </Card.Header>
              <Card.Body>
                {!selectedId ? (
                  <EmptyState
                    title="未选择测试用例"
                    description="请先从左侧列表选择一个测试用例。"
                  />
                ) : detailError ? (
                  <ErrorState
                    title="测试用例详情加载失败"
                    message={detailError}
                    onRetry={() => void loadDetail(selectedId)}
                  />
                ) : detailLoading && !detail ? (
                  <LoadingState text="正在加载测试用例详情..." />
                ) : detail ? (
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <div className="text-secondary small">测试用例 ID</div>
                      <div className="fw-semibold">{detail.id}</div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="text-secondary small">题目主键</div>
                      <div className="fw-semibold">{detail.question_id}</div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="text-secondary small">用例编号</div>
                      <div className="fw-semibold">
                        {getCaseNoFromKey(detail.input_key)}
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="text-secondary small">隐藏状态</div>
                      <div>
                        {detail.is_hidden ? (
                          <Badge bg="warning" text="dark">
                            隐藏
                          </Badge>
                        ) : (
                          <Badge bg="success">公开</Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="text-secondary small">输入文件</div>
                      <div className="fw-semibold text-break">{detail.input_key}</div>
                      <div className="small text-secondary mt-1">
                        大小：{formatSize(detail.input_size)}
                      </div>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="text-secondary small">输出文件</div>
                      <div className="fw-semibold text-break">{detail.output_key}</div>
                      <div className="small text-secondary mt-1">
                        大小：{formatSize(detail.output_size)}
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <EmptyState
                    title="暂无测试用例详情"
                    description="没有找到当前测试用例的详细信息。"
                  />
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>OSS 文件树</span>
            <div className="d-flex gap-2 align-items-center">
              <Form.Check
                type="switch"
                id="tree-recursive-switch"
                label={recursive ? '递归浏览' : '仅当前目录'}
                checked={recursive}
                onChange={(event) => setRecursive(event.target.checked)}
              />
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => void loadTree()}
                disabled={treeLoading}
              >
                刷新
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row className="g-3 mb-3">
              <Col md={6}>
                <div className="p-3 bg-light border rounded">
                  <div className="text-secondary small">当前前缀</div>
                  <div className="fw-semibold text-break">
                    {tree?.prefix || `problems/${problemId}/`}
                  </div>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 bg-light border rounded">
                  <div className="text-secondary small">对象数量</div>
                  <div className="fs-5 fw-semibold">{treeObjects.length}</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 bg-light border rounded">
                  <div className="text-secondary small">文件数量</div>
                  <div className="fs-5 fw-semibold">
                    {treeObjects.filter((item) => !item?.is_dir).length}
                  </div>
                </div>
              </Col>
            </Row>

            {treeError ? (
              <ErrorState
                title="OSS 文件树加载失败"
                message={treeError}
                onRetry={() => void loadTree()}
              />
            ) : treeLoading && treeObjects.length === 0 ? (
              <LoadingState text="正在加载 OSS 文件树..." />
            ) : treeObjects.length === 0 ? (
              <EmptyState
                title="暂无 OSS 文件"
                description="当前题目目录下没有可展示的对象。"
              />
            ) : (
              <div className="border rounded overflow-hidden">
                <Table hover responsive className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>Key</th>
                      <th>大小</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treeObjects.map((item) => (
                      <tr key={item.key}>
                        <td>
                          {item.is_dir ? (
                            <Badge bg="secondary">目录</Badge>
                          ) : (
                            <Badge bg="light" text="dark">
                              文件
                            </Badge>
                          )}
                        </td>
                        <td className="text-break">{item.key}</td>
                        <td>{item.is_dir ? '-' : formatSize(item.size)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <TestCaseFormModal
        mode="create"
        show={showAddModal}
        problemId={problemId}
        testCase={null}
        onClose={() => setShowAddModal(false)}
        onSaved={async (saved) => {
          await refreshAll({ keepSelection: false });
          if (saved?.id) {
            setSelectedId(saved.id);
          }
        }}
      />

      <TestCaseFormModal
        mode="edit"
        show={showEditModal}
        problemId={problemId}
        testCase={detail}
        onClose={() => setShowEditModal(false)}
        onSaved={async (saved) => {
          if (saved?.id) {
            setSelectedId(saved.id);
          }
          await refreshAll();
        }}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>删除测试用例</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          确认删除测试用例 {detail?.id ? `#${detail.id}` : ''} 吗？该操作只会删除数据库记录，不会自动删除 OSS 文件。
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            取消
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? '删除中...' : '确认删除'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
