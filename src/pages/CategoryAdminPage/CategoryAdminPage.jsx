import { Container, Row, Col, Modal, Button, Collapse } from 'react-bootstrap';
import styles from './CategoryAdminPage.module.css';
import { getCategories } from '../../api/getcategories';
import { useEffect, useMemo, useState } from 'react';
import { deleteCategory } from '../../api/deleteCategory';

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState([]);
  const [show, setShow] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteSuccessShow, setDeleteSuccessShow] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});

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

  // 切换分类展开状态
  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev?.[id],
    }));
  };

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
      fetchCategories();
      setShow(false);
      setDeleteSuccessShow(true);
    }
  };

  const handleEditCategory = (id) => {
    window.location.href = `/admin/updatecategory/${id}`;
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
                    const isOpen = !!expandedIds?.[n.id];
                    const indent = Math.min(depth, 8) * 16;

                    return (
                      <div key={n.id} className={styles['category-item']}>
                        <div className="d-flex align-items-center justify-content-between gap-2">
                          <div
                            className="d-flex align-items-center"
                            style={{ paddingLeft: indent }}
                          >
                            {hasChildren ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="p-0 me-2 text-decoration-none"
                                onClick={() => toggleExpand(n.id)}
                              >
                                {isOpen ? '▾' : '▸'}
                              </Button>
                            ) : (
                              <span
                                className="me-2 text-secondary"
                                style={{ width: 16, display: 'inline-block' }}
                              />
                            )}
                            <div className={styles['category-name']}>
                              {n.name}
                            </div>
                          </div>

                          <div className={styles['category-actions']}>
                            <button
                              className={styles['custom-button']}
                              onClick={() => handleEditCategory(n.id)}
                            >
                              编辑
                            </button>
                            <button
                              className={styles['custom-button']}
                              onClick={() => handleShowDeleteModal(n.id)}
                            >
                              删除
                            </button>
                          </div>
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
            </div>
          </Col>
        </Row>
      </Container>
      {deleteModal}
      {deleteSuccessModal}
    </div>
  );
}
