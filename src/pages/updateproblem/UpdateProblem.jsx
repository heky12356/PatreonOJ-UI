// pages/updateproblem/UpdateProblem.jsx
import { useState, useEffect } from 'react';
import styles from './UpdateProblem.module.css';
import { Row, Col, Modal, Button } from 'react-bootstrap';
import { updateProblem } from '../../api/updateProblem';
import { getProblemById } from '../../api/getproblem';
import MDEditor from '@uiw/react-md-editor';

export default function UpdateProblem() {
  const id = window.location.href.split('/').pop();

  // 表单数据状态
  const [formData, setFormData] = useState({
    question_id: '',
    title: '',
    content: '',
    difficulty: '简单',
    time_limit: 1000,
    memory_limit: 128,
    tags: '',
    category_id: 0,
    status: 'published',
  });

  // 提交状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 弹窗状态
  const [show, setShow] = useState(false);

  // 处理弹窗显示和隐藏
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除错误和成功信息
    // console.log(name, value);
    if (error) setError('');
    if (success) setSuccess('');
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title || !formData.content || !formData.difficulty) {
      setError('请填写必填字段：题目标题、题目描述和难度等级');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 发送创建题目请求
      const response = await updateProblem(formData, id);

      // 更新成功
      setSuccess('题目更新成功！');
      handleShow();
      // console.log('题目更新成功:', response.data);

      // 刷新题目数据
      fetchProblemData();
      setSuccess('');
    } catch (err) {
      console.error('题目更新失败:', err);
      setError(err.response?.data?.message || '题目更新失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 获取题目数据
  const fetchProblemData = async () => {
    try {
      const response = await getProblemById(id);
      //   console.log(response);
      setFormData(response.data);
    } catch (err) {
      console.error('获取题目数据失败:', err);
      setError(err.response?.data?.message || '获取题目数据失败，请稍后再试');
    }
  };

  useEffect(() => {
    fetchProblemData();
  }, []);

  // 成功弹窗
  const successModal = (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>提醒</Modal.Title>
      </Modal.Header>
      <Modal.Body>题目更新成功！</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          确定
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div className={styles.container}>
      <Row>
        <Col md={9}>
          <div className={styles.left}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* 基本信息部分 */}
              <div className="row">
                <div className="col-md-3">
                  <div className={styles.formGroup}>
                    <label
                      className={`${styles.formLabel} ${styles.requiredField}`}
                    >
                      题目ID
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
                    <label
                      className={`${styles.formLabel} ${styles.requiredField}`}
                    >
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
                    <label
                      className={`${styles.formLabel} ${styles.requiredField}`}
                    >
                      难度等级
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
                        value={
                          formData.status == 'hidden' ? 'published' : 'hidden'
                        }
                        checked={formData.status != 'published'}
                        name="status"
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label">隐藏</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 题目描述 */}
              <div className={styles.formGroup}>
                <label
                  className={`${styles.formLabel} ${styles.requiredField}`}
                >
                  题目描述
                </label>
                <MDEditor
                  className={`form-control ${styles.formControl} ${styles.textArea}`}
                  name="content"
                  value={formData.content}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, content: val || '' }));
                    if (error) setError('');
                    if (success) setSuccess('');
                  }}
                  height={480}
                />
              </div>

              {/* 提交按钮 */}
              <div className="text-center">
                <button
                  type="submit"
                  className={`btn ${styles.submitBtn}`}
                  disabled={loading}
                >
                  {loading ? '提交中...' : '更新题目'}
                </button>
              </div>
            </form>
          </div>
        </Col>
        <Col md={3}>
          <div className={styles.rightContainer}>
            <div className={styles.right}>分类</div>
            <div className={styles.right}>
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>标签（用逗号分隔）</label>
                  <input
                    type="text"
                    className={`form-control ${styles.formControl} ${styles.tagsInput}`}
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="例如：数组,哈希表"
                  />
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div>其他</div>
              {/* 时间和内存限制 */}
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
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
      {successModal}
    </div>
  );
}
