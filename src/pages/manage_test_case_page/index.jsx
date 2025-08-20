import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getTestCasesByProblemNumber,
  addTestCase,
  apideleteTestCase,
} from "../../api/test_case_api";
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
} from "react-bootstrap";

const AddTestPage = ({ problem_number, setIsAdd, show }) => {
  const [inputValue1, setInputValue1] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue1.trim() || !inputValue2.trim()) {
      setError("请填写完整的输入和期望输出");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const resp = await addTestCase({
        input: inputValue1,
        expected_output: inputValue2,
        problem_number,
      });
      console.log(resp);
      // 提交成功后关闭表单
      setIsAdd(false);
      // 清空输入框
      setInputValue1("");
      setInputValue2("");
    } catch (error) {
      console.error("提交失败:", error);
      setError("添加测试用例失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdd(false);
    setInputValue1("");
    setInputValue2("");
    setError("");
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>添加测试用例</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>输入数据</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={inputValue1}
              onChange={(e) => setInputValue1(e.target.value)}
              placeholder="请输入测试用例的输入数据"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>期望输出</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={inputValue2}
              onChange={(e) => setInputValue2(e.target.value)}
              placeholder="请输入期望的输出结果"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          取消
        </Button>
        <Button variant="dark" onClick={handleSubmit} disabled={loading}>
          {loading ? "添加中..." : "添加测试用例"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default function ManageTestCasePage() {
  const { problem_number } = useParams();
  const [testCases, setTestCases] = useState({});
  const [testCasesDetail, setTestCasesDetail] = useState([]);
  const [isadd, setIsAdd] = useState(false);
  const [isdelete, setIsDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const handleAddClick = () => {
    setIsAdd(true);
  };

  const deleteTestCase = async (id) => {
    setDeleteLoading(id);
    try {
      await apideleteTestCase({ id: parseInt(id) });
      setIsDelete(id);
    } catch (error) {
      console.error("删除测试用例失败:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getTestCasesByProblemNumber(problem_number);
        setTestCases(data);
        setTestCasesDetail(data.result);
      } catch (error) {
        console.error("获取测试用例失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (problem_number) {
      fetchData();
    }
  }, [problem_number, isadd, isdelete]);

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
                    onClick={handleAddClick}
                    className="me-2"
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    添加测试用例
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
                    <strong className="text-muted">测试用例数量：</strong> 
                    <Badge bg="secondary" className="ms-2">
                      {testCases.count || 0}
                    </Badge>
                  </div>
                </Col>
              </Row>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-secondary" role="status">
                    <span className="visually-hidden">加载中...</span>
                  </div>
                  <p className="mt-2 text-muted">正在加载测试用例...</p>
                </div>
              ) : (
                <>
                  {testCasesDetail && testCasesDetail.length > 0 ? (
                    <Row>
                      {testCasesDetail.map((testCase, index) => (
                        <Col md={6} lg={4} key={testCase.ID} className="mb-3">
                          <Card className="h-100 border">
                            <Card.Header className="bg-white border-bottom">
                              <Row className="align-items-center">
                                <Col>
                                  <h6 className="mb-0">
                                    <Badge bg="secondary" className="me-2">
                                      #{index + 1}
                                    </Badge>
                                    <span className="text-muted">测试用例</span>
                                  </h6>
                                </Col>
                                <Col xs="auto">
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => deleteTestCase(testCase.ID)}
                                    disabled={deleteLoading === testCase.ID}
                                  >
                                    {deleteLoading === testCase.ID ? (
                                      <>
                                        <span
                                          className="spinner-border spinner-border-sm me-1"
                                          role="status"
                                        ></span>
                                        删除中
                                      </>
                                    ) : (
                                      <>
                                        <i className="bi bi-trash me-1"></i>
                                        删除
                                      </>
                                    )}
                                  </Button>
                                </Col>
                              </Row>
                            </Card.Header>
                            <Card.Body className="bg-white">
                              <div className="mb-3">
                                <strong className="text-muted">
                                  输入数据：
                                </strong>
                                <div className="mt-1 p-2 bg-light rounded border">
                                  <code className="text-dark">
                                    {testCase.Input || "(空)"}
                                  </code>
                                </div>
                              </div>
                              <div>
                                <strong className="text-muted">
                                  期望输出：
                                </strong>
                                <div className="mt-1 p-2 bg-light rounded border">
                                  <code className="text-dark">
                                    {testCase.ExpectedOutput || "(空)"}
                                  </code>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <div className="text-center py-5">
                      <div className="text-muted">
                        <i
                          className="bi bi-inbox"
                          style={{ fontSize: "3rem" }}
                        ></i>
                        <h5 className="mt-3">暂无测试用例</h5>
                        <p>点击上方"添加测试用例"按钮来创建第一个测试用例</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <AddTestPage
        problem_number={problem_number}
        setIsAdd={setIsAdd}
        show={isadd}
      />
    </Container>
  );
}
