// pages/addproblem/AddProblem.jsx
import { useState, useMemo } from 'react';
import styles from './AddProblem.module.css';
import { Row, Col, Modal, Button, Collapse } from 'react-bootstrap';
import { createProm } from '../../api/creatproblem';
import MDEditor from '@uiw/react-md-editor';
import { getCategories } from '../../api/getcategories';
import { useEffect } from 'react';

const AddProblem = () => {
  // 表单数据状态
  const [formData, setFormData] = useState({
    question_id: '',
    title: '',
    content: '',
    difficulty: '简单',
    time_limit: 1000,
    memory_limit: 128,
    tags: '',
    category_id: '',
    status: 'published',
  });

  const [expandedCategoryIds, setExpandedCategoryIds] = useState({});

  // 分类
  const [categories, setCategories] = useState([]);

  // 提交状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 弹窗状态
  const [show, setShow] = useState(false);

  // 处理弹窗显示和隐藏
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // 获取分类
  const fetchCategories = async () => {
    const result = await getCategories();
    // console.log(result);
    setCategories(result);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const normalizeId = (v) => {
    const s = String(v ?? '').trim();
    return s === '' ? null : s;
  };

  const normalizeParentId = (v) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    if (s === '' || s === '0') return null;
    return s;
  };

  const categoryTree = useMemo(() => {
    const list = Array.isArray(categories) ? categories : [];
    const byId = new Map();

    list.forEach((c) => {
      const id = normalizeId(c?.id ?? c?.Id);
      if (!id) return;
      byId.set(id, {
        ...c,
        id,
        name: c?.name ?? c?.Name,
        parent_id: normalizeParentId(
          c?.parent_id ?? c?.ParentId ?? c?.parentId
        ),
        children: [],
      });
    });

    const roots = [];

    byId.forEach((node) => {
      const pid = node.parent_id;
      if (pid && byId.has(pid) && pid !== node.id) {
        byId.get(pid).children.push(node);
      } else {
        roots.push(node);
      }
    });

    const sortNodes = (arr) => {
      arr.sort((a, b) =>
        String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'zh')
      );
      arr.forEach((n) => sortNodes(n.children));
    };

    sortNodes(roots);
    return roots;
  }, [categories]);

  const toggleCategoryExpand = (id) => {
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [id]: !prev?.[id],
    }));
  };

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleCategoryToggle = (id, checked) => {
    setFormData((prev) => ({
      ...prev,
      category_id: checked ? id : 0,
    }));
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
      const response = await createProm(formData);

      // 创建成功
      setSuccess('题目创建成功！');
      handleShow();
      // console.log('题目创建成功:', response.data);

      // 清空表单或跳转
      setFormData({
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
      setSuccess('');
    } catch (err) {
      console.error('题目创建失败:', err);
      setError(err.response?.data?.message || '题目创建失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  // 成功弹窗
  const successModal = (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>提醒</Modal.Title>
      </Modal.Header>
      <Modal.Body>题目创建成功！</Modal.Body>
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
            <h2 className={styles.title}>创建新题目</h2>
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
                  height={430}
                />
              </div>

              {/* 提交按钮 */}
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
              <p>分类</p>
              {categoryTree.length === 0 ? (
                <div className="text-secondary">暂无分类</div>
              ) : null}

              {categoryTree.map((node) => {
                const renderNode = (n, depth = 0, visited = new Set()) => {
                  if (!n?.id) return null;
                  if (visited.has(n.id)) return null;
                  const nextVisited = new Set(visited);
                  nextVisited.add(n.id);

                  const hasChildren =
                    Array.isArray(n.children) && n.children.length > 0;
                  const isOpen = !!expandedCategoryIds?.[n.id];
                  const indent = Math.min(depth, 6) * 14;
                  const checked = String(formData.category_id) === String(n.id);

                  return (
                    <div key={n.id} style={{ paddingLeft: indent }}>
                      <div className="d-flex align-items-center justify-content-between">
                        <label
                          className={styles.formLabel}
                          style={{ marginBottom: 0 }}
                        >
                          <input
                            type="checkbox"
                            name="category_id"
                            value={n.id}
                            checked={checked}
                            onChange={(e) =>
                              handleCategoryToggle(n.id, e.target.checked)
                            }
                          />
                          {n.name}
                        </label>

                        {hasChildren ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-decoration-none"
                            onClick={() => toggleCategoryExpand(n.id)}
                          >
                            {isOpen ? '▾' : '▸'}
                          </Button>
                        ) : null}
                      </div>

                      {hasChildren ? (
                        <Collapse in={isOpen}>
                          <div>
                            {n.children.map((child) =>
                              renderNode(child, depth + 1, nextVisited)
                            )}
                          </div>
                        </Collapse>
                      ) : null}
                    </div>
                  );
                };

                return renderNode(node, 0, new Set());
              })}
            </div>
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
};

export default AddProblem;
