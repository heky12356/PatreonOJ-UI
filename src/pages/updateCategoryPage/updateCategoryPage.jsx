import {
  Container,
  Row,
  Col,
  Modal,
  Button,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCategories } from '../../api/getcategories.js';
import { updateCategory } from '../../api/updateCategory.js';
import styles from '../createCategoryPage/createCategoryPage.module.css';

const getCatId = (c) => c?.id ?? c?.Id;
const getCatName = (c) => c?.name ?? c?.Name;
const getCatSlug = (c) => c?.slug ?? c?.Slug;
const getCatParentId = (c) => c?.parent_id ?? c?.ParentId ?? c?.parentId;
const getCatDesc = (c) => c?.description ?? c?.Description;

export default function UpdateCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const categoryId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : id;
  }, [id]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
  });

  const [errInfo, setErrInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const [categoryList, setCategoryList] = useState([]);
  const [initLoading, setInitLoading] = useState(false);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const fetchCategories = async () => {
    const result = await getCategories();
    setCategoryList(Array.isArray(result) ? result : []);
    return Array.isArray(result) ? result : [];
  };

  const loadCurrentCategory = async () => {
    if (id === undefined || id === null || String(id).trim() === '') {
      setErrInfo('分类ID不存在');
      return;
    }

    setInitLoading(true);
    setErrInfo('');
    try {
      const list = await fetchCategories();
      const current = list.find(
        (c) => String(getCatId(c)) === String(categoryId)
      );
      if (!current) {
        setErrInfo('未找到该分类');
        return;
      }

      const parentId = getCatParentId(current);
      setFormData({
        name: getCatName(current) || '',
        slug: getCatSlug(current) || '',
        parent_id:
          parentId === undefined || parentId === null ? '' : String(parentId),
        description: getCatDesc(current) || '',
      });
    } catch (e) {
      setErrInfo(e?.message || '加载分类信息失败，请稍后再试');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentCategory();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errInfo) setErrInfo('');
  };

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
      const payload = {
        name: String(formData.name || '').trim(),
        slug: String(formData.slug || '').trim(),
        description: String(formData.description || '').trim(),
        parent_id: formData.parent_id === '' ? null : formData.parent_id,
      };

      const result = await updateCategory(payload, categoryId);

      if (result?.code === 200) {
        await fetchCategories();
        handleShow();
      } else {
        setErrInfo(result?.message || '更新分类失败，请稍后再试');
      }
    } catch (err) {
      setErrInfo(err?.message || '更新分类失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const successModal = (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>提醒</Modal.Title>
      </Modal.Header>
      <Modal.Body>分类更新成功！</Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            handleClose();
            navigate('/admin/category');
          }}
        >
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
              <h3>编辑分类</h3>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className={styles['category-container']}>
              <div>
                {errInfo ? <Alert variant="danger">{errInfo}</Alert> : null}

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
                      disabled={initLoading}
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
                      disabled={initLoading}
                    />
                  </div>

                  <div className={styles['form-group']}>
                    <label className={styles['form-label']}>父级分类</label>
                    <select
                      className={styles.parentSelect}
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInputChange}
                      disabled={initLoading}
                    >
                      <option value="">无</option>
                      {categoryList
                        .filter(
                          (c) => String(getCatId(c)) !== String(categoryId)
                        )
                        .map((category) => (
                          <option
                            key={String(getCatId(category))}
                            value={String(getCatId(category))}
                          >
                            {getCatName(category)}
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
                      disabled={initLoading}
                    />
                  </div>

                  <div
                    className={styles['form-group']}
                    style={{ display: 'flex', gap: 12 }}
                  >
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={loading || initLoading}
                      onClick={() => navigate('/admin/category')}
                    >
                      返回
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading || initLoading}
                      className={styles['custom-button']}
                    >
                      {initLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          加载中...
                        </>
                      ) : loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          提交中...
                        </>
                      ) : (
                        '保存修改'
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
