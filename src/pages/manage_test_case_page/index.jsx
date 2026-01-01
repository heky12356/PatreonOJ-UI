import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getProblemTestcaseFileTree,
  uploadTestCaseViaOss,
} from '../../api/test_case_api';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
  Badge,
  Modal,
} from 'react-bootstrap';

const AddTestPage = ({ problem_number, setIsAdd, show, onUploaded }) => {
  const [caseNo, setCaseNo] = useState('');
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [isHidden, setIsHidden] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCaseNo('');
    setInputFile(null);
    setOutputFile(null);
    setIsHidden(true);
    setError('');
  };

  const handleCancel = () => {
    setIsAdd(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedCaseNo = String(caseNo).trim();
    if (!normalizedCaseNo) {
      setError('请填写用例编号（caseNo）');
      return;
    }
    if (!inputFile || !outputFile) {
      setError('请选择 .in 和 .out 文件');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await uploadTestCaseViaOss({
        question_number: parseInt(problem_number),
        case_no: normalizedCaseNo,
        inputFile,
        outputFile,
        is_hidden: isHidden,
      });

      setIsAdd(false);
      resetForm();
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('上传失败:', err);
      setError('上传测试用例失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>上传测试用例（OSS 直传）</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>用例编号（caseNo）</Form.Label>
                <Form.Control
                  value={caseNo}
                  onChange={(e) => setCaseNo(e.target.value)}
                  placeholder="例如：1"
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Form.Check
                type="switch"
                id="isHiddenSwitch"
                label={isHidden ? '隐藏用例' : '公开用例'}
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>输入文件（.in）</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setInputFile(e.target.files?.[0] ?? null)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>输出文件（.out）</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => setOutputFile(e.target.files?.[0] ?? null)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          取消
        </Button>
        <Button variant="dark" onClick={handleSubmit} disabled={loading}>
          {loading ? '上传中...' : '开始上传'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default function ManageTestCasePage() {
  const { problem_number } = useParams();
  const [isadd, setIsAdd] = useState(false);

  const [tree, setTree] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeError, setTreeError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setIsAdd(true);
  };

  const refreshTree = async () => {
    if (!problem_number) return;

    setTreeLoading(true);
    setTreeError('');
    try {
      const data = await getProblemTestcaseFileTree({
        question_number: parseInt(problem_number),
        recursive: false,
      });
      setTree(data);
    } catch (error) {
      console.error('获取测试用例文件树失败:', error);
      setTreeError('获取测试用例文件树失败');
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    refreshTree();
  }, [problem_number, refreshKey]);

  const objects = useMemo(() => {
    const list = tree?.objects ?? [];
    return [...list].sort((a, b) => {
      const ad = !!a.is_dir;
      const bd = !!b.is_dir;
      if (ad !== bd) return ad ? -1 : 1;
      return String(a.key).localeCompare(String(b.key));
    });
  }, [tree]);

  const fileCount = useMemo(() => {
    return objects.filter((o) => !o.is_dir).length;
  }, [objects]);

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom">
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0 text-dark">测试用例管理</h4>
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={refreshTree}
                    className="me-2"
                    disabled={treeLoading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    刷新
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleAddClick}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    上传测试用例
                  </Button>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light rounded border">
                    <strong className="text-muted">当前题目：</strong>
                    <span className="text-dark">{problem_number}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 bg-light rounded border">
                    <strong className="text-muted">文件数量：</strong>
                    <Badge bg="secondary" className="ms-2">
                      {fileCount}
                    </Badge>
                  </div>
                </Col>
              </Row>

              {treeError ? <Alert variant="danger">{treeError}</Alert> : null}

              {treeLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">加载中...</span>
                  </div>
                  <p className="mt-2 text-muted">正在加载文件树...</p>
                </div>
              ) : (
                <div className="border rounded bg-white overflow-hidden">
                  {objects.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {objects.map((obj) => (
                        <div
                          key={obj.key}
                          className="list-group-item d-flex align-items-center justify-content-between"
                        >
                          <div className="d-flex align-items-center">
                            <i
                              className={
                                obj.is_dir
                                  ? 'bi bi-folder me-2'
                                  : 'bi bi-file-earmark-text me-2'
                              }
                            ></i>
                            <span className="text-dark">{obj.key}</span>
                          </div>
                          <div
                            className="text-muted"
                            style={{ fontSize: '0.85rem' }}
                          >
                            {!obj.is_dir ? `${obj.size ?? 0} bytes` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <i
                        className="bi bi-inbox"
                        style={{ fontSize: '3rem' }}
                      ></i>
                      <h5 className="mt-3">暂无文件</h5>
                      <p>点击右上角“上传测试用例”添加 .in/.out 文件</p>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddTestPage
        problem_number={problem_number}
        setIsAdd={setIsAdd}
        show={isadd}
        onUploaded={() => setRefreshKey((k) => k + 1)}
      />
    </Container>
  );
}
