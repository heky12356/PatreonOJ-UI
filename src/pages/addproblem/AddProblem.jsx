import { useState } from 'react';
import styles from './AddProblem.module.css';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { createProm } from '../../api/creatproblem';
import MDEditor from '@uiw/react-md-editor';

const initialForm = {
  question_id: '',
  title: '',
  content: '',
  difficulty: '简单',
  time_limit: 1000,
  memory_limit: 128,
  tags: '',
  status: 'published',
};

const AddProblem = () => {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.question_id || !formData.title || !formData.content) {
      setError('请填写必填项：题目业务ID、标题和题目内容');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createProm(formData);
      setFormData(initialForm);
      setShow(true);
    } catch (err) {
      console.error('create problem failed:', err);
      setError(err?.message || '创建题目失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Row>
        <Col md={9}>
          <div className={styles.left}>
            <h2 className={styles.title}>创建新题目</h2>
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
                  height={430}
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  className={`btn ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? '提交中...' : '创建题目'}
                </button>
              </div>
            </form>
          </div>
        </Col>

        <Col md={3}>
          <div className={styles.rightContainer}>
            <div className={styles.right}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>标签（逗号分隔）</label>
                <input
                  type="text"
                  className={`form-control ${styles.formControl} ${styles.tagsInput}`}
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="例如：数组,哈希"
                />
              </div>
            </div>

            <div className={styles.right}>
              <div>其他</div>
              <div className="row">
                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>时间限制(ms)</label>
                    <input
                      type="number"
                      className={`form-control ${styles.formControl}`}
                      name="time_limit"
                      value={formData.time_limit}
                      onChange={handleInputChange}
                      min="100"
                      step="100"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>内存限制(MB)</label>
                    <input
                      type="number"
                      className={`form-control ${styles.formControl}`}
                      name="memory_limit"
                      value={formData.memory_limit}
                      onChange={handleInputChange}
                      min="16"
                      step="16"
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
        <Modal.Body>题目创建成功</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            确定
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AddProblem;
