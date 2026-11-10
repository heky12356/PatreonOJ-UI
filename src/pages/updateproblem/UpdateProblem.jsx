import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './UpdateProblem.module.css';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { updateProblem } from '../../api/updateProblem';
import { getProblemById } from '../../api/getproblem';
import MDEditor from '@uiw/react-md-editor';

const defaultForm = {
  question_id: '',
  title: '',
  content: '',
  difficulty: '简单',
  time_limit: 1000,
  memory_limit: 128,
  tags: '',
  status: 'published',
};

export default function UpdateProblem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const fetchProblemData = async () => {
    if (!id) return;

    setInitLoading(true);
    setError('');
    try {
      const response = await getProblemById(id);
      const data = response?.data || {};
      setFormData({
        ...defaultForm,
        ...data,
      });
    } catch (err) {
      console.error('fetch problem failed:', err);
      setError(err?.message || '获取题目数据失败，请稍后再试');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question_id || !formData.title || !formData.content) {
      setError('请填写必填项：题目业务ID、标题和题目内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await updateProblem(formData, id);
      handleShow();
    } catch (err) {
      console.error('update problem failed:', err);
      setError(err?.message || '题目更新失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Row>
        <Col md={9}>
          <div className={styles.left}>
            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-3">
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>
                      题目业务ID
                    </label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      name="question_id"
                      value={formData.question_id}
                      onChange={handleInputChange}
                      placeholder="例如：P1001"
                      disabled={initLoading}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>
                      题目标题
                    </label>
                    <input
                      type="text"
                      className={`form-control ${styles.formControl}`}
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="例如：两数之和"
                      disabled={initLoading}
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <div className={styles.formGroup}>
                    <label className={`${styles.formLabel} ${styles.requiredField}`}>
                      难度
                    </label>
                    <select
                      className={styles.difficultySelect}
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      disabled={initLoading}
                    >
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className={styles.formGroup}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={formData.status === 'hidden' ? 'published' : 'hidden'}
                        checked={formData.status !== 'published'}
                        name="status"
                        onChange={handleInputChange}
                        disabled={initLoading}
                      />
                      <label className="form-check-label">隐藏</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles.requiredField}`}>
                  题目内容
                </label>
                <MDEditor
                  className={`form-control ${styles.formControl} ${styles.textArea}`}
                  name="content"
                  value={formData.content}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, content: val || '' }));
                    if (error) setError('');
                  }}
                  height={480}
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className={`btn ${styles.submitBtn}`}
                  disabled={loading || initLoading}
                >
                  {loading ? '提交中...' : '更新题目'}
                </button>
              </div>
            </form>
          </div>
        </Col>

        <Col md={3}>
          <div className={styles.rightContainer}>
            <div className={styles.right}>
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>标签（逗号分隔）</label>
                  <input
                    type="text"
                    className={`form-control ${styles.formControl} ${styles.tagsInput}`}
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="例如：数组,哈希"
                    disabled={initLoading}
                  />
                </div>
              </div>
            </div>

            <div className={styles.right}>
              <div>其他</div>
              <div className="row">
                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>时间限制 (ms)</label>
                    <input
                      type="number"
                      className={`form-control ${styles.formControl}`}
                      name="time_limit"
                      value={formData.time_limit}
                      onChange={handleInputChange}
                      min="100"
                      step="100"
                      disabled={initLoading}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>内存限制 (MB)</label>
                    <input
                      type="number"
                      className={`form-control ${styles.formControl}`}
                      name="memory_limit"
                      value={formData.memory_limit}
                      onChange={handleInputChange}
                      min="16"
                      step="16"
                      disabled={initLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>提示</Modal.Title>
        </Modal.Header>
        <Modal.Body>题目更新成功</Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              handleClose();
              navigate(`/admin/updateproblem/${id}`);
            }}
          >
            确定
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
