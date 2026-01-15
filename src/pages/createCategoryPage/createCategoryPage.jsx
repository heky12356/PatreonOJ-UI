import { Container, Row, Col, Modal, Button, Spinner } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { createCategory } from '../../api/createCategoty.js';
import { getCategories } from '../../api/getcategories.js';
import styles from './createCategoryPage.module.css';

export default function CreateCategoryPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
  });
  const [errInfo, setErrInfo] = useState('');
  const [show, setShow] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // 获取分类列表
  const fetchCategories = async () => {
    const result = await getCategories();
    setCategoryList(result || []);
  };

  // 关闭弹窗
  const handleClose = () => setShow(false);
  // 打开弹窗
  const handleShow = () => setShow(true);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errInfo) setErrInfo('');
  };

  // 添加分类函数
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrInfo('');

    if (!String(formData.name || '').trim()) {
      setErrInfo('请填写分类名称');
      return;
    }

    setLoading(true);
    try {
      const result = await createCategory(formData);
      if (result?.code === 200) {
        setFormData({
          name: '',
          slug: '',
          parent_id: '',
          description: '',
        });
        await fetchCategories();
        handleShow();
      } else {
        setErrInfo(result?.msg || '创建分类失败，请稍后再试');
      }
    } catch (err) {
      setErrInfo(err?.message || '创建分类失败，请稍后再试');
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
      <Modal.Body>分类创建成功！</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          确定
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div>
      <Container className={styles.container}>
        <Row>
          <Col>
            <div className={styles['category-header']}>
              <h3>添加分类</h3>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <div className={styles['category-container']}>
              <div>
                <form
                  className={styles['category-form']}
                  onSubmit={handleSubmit}
                >
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>分类名称</label>
                    <input
                      type="text"
                      className={`form-control ${styles['form-control']}`}
                      name="name"
                      placeholder="请输入分类名称"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>分类缩略名</label>
                    <input
                      type="text"
                      className={`form-control ${styles['form-control']}`}
                      name="slug"
                      placeholder="请输入分类缩略名"
                      value={formData.slug}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>父级分类</label>
                    <select
                      className={styles.parentSelect}
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInputChange}
                    >
                      <option value="">无</option>
                      {categoryList.map((category) => (
                        <option key={category.id} value={parseInt(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>分类描述</label>
                    <textarea
                      className={`form-control ${styles['form-control']}`}
                      name="description"
                      placeholder="请输入分类描述"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errInfo && (
                    <div className={styles['error-message']}>{errInfo}</div>
                  )}
                  <div className={styles['form-group']}>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className={styles['custom-button']}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          提交中...
                        </>
                      ) : (
                        '添加分类'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {successModal}
    </div>
  );
}
