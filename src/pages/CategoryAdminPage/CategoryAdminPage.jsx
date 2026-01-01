import { Container, Row, Col, Modal, Button } from 'react-bootstrap';
import styles from './CategoryAdminPage.module.css';
import { getCategories } from '../../api/getcategories';
import { useEffect, useState } from 'react';
import { deleteCategory } from '../../api/deleteCategory';

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccessShow, setDeleteSuccessShow] = useState(false);

  const fetchCategories = async () => {
    const result = await getCategories();
    // console.log(result);
    setCategories(result);
  };

  // 跳转到添加分类页面
  const handleAddCategory = () => {
    window.location.href = '/admin/createcategory';
  };

  // 删除分类
  const handleDeleteCategory = async (id) => {
    const result = await deleteCategory(id);
    if (result.code === 400) {
      console.error('删除分类失败');
    } else {
      console.log('删除分类成功');
      fetchCategories();
      setShow(false);
      setDeleteSuccessShow(true);
    }
  };

  // 关闭删除分类弹窗
  const handleClose = () => setShow(false);

  // 关闭删除成功弹窗
  const handleDeleteSuccessClose = () => setDeleteSuccessShow(false);

  // 打开删除分类弹窗
  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShow(true);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const deleteModal = (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>提醒</Modal.Title>
      </Modal.Header>
      <Modal.Body>确认删除吗？</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          取消
        </Button>
        <Button
          variant="primary"
          onClick={() => handleDeleteCategory(deleteId)}
        >
          确认
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const deleteSuccessModal = (
    <Modal show={deleteSuccessShow} onHide={handleDeleteSuccessClose}>
      <Modal.Header closeButton>
        <Modal.Title>提醒</Modal.Title>
      </Modal.Header>
      <Modal.Body>删除成功</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDeleteSuccessClose}>
          确认
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <div>
      <Container className={styles.container}>
        <Row>
          <Col>
            <div className={styles['category-container']}>
              <div className={styles['category-header']}>
                <h3>分类管理</h3>
                <button
                  className={styles['custom-button']}
                  onClick={handleAddCategory}
                >
                  添加分类
                </button>
              </div>
              <div className={styles['category-list']}>
                {categories.map((category) => (
                  <div key={category.Id} className={styles['category-item']}>
                    <div className={styles['category-name']}>
                      {category.Name}
                    </div>
                    <div className={styles['category-actions']}>
                      <button className={styles['custom-button']}>编辑</button>
                      <button
                        className={styles['custom-button']}
                        onClick={() => handleShowDeleteModal(category.Id)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
      {deleteModal}
      {deleteSuccessModal}
    </div>
  );
}
