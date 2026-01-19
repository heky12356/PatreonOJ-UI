import { Outlet } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserId, isLoggedIn } from '../../api/user.js';
import { Container, Button } from 'react-bootstrap';
import { getProblem as getProblemApi } from '../../api/getproblem.js';
import FootNav from '../../components/footNav/footNav.jsx';
import { Modal } from 'react-bootstrap';
import { deleteProblem } from '../../api/deleteProblem.js';
import styles from './update.module.css';

export default function Updatebase() {
  const params = useParams();
  const [isonly, setIsonly] = useState(false);
  const [problem, setProblem] = useState([]);
  const [pageIdx, setPageIdx] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCnt, setTotalCnt] = useState(0);
  const [show, setShow] = useState(false); // 确认删除弹窗显示
  const [deleteSuccessShow, setDeleteSuccessShow] = useState(false); // 删除成功弹窗显示

  const [deleteId, setDeleteId] = useState('');

  const uuid = getUserId();

  // 处理弹窗显示和隐藏
  const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setDeleteId(id);
    setShow(true);
  };

  // 删除成功弹窗显示和隐藏
  const handleDeleteSuccessClose = () => setDeleteSuccessShow(false);
  const handleDeleteSuccessShow = () => setDeleteSuccessShow(true);

  const getProblem = async () => {
    const data = await getProblemApi({
      pageIdx: pageIdx,
      pageSize: 5,
    });
    setProblem(data.result || []);
    setPageIdx(data.pageIdx || 1);
    setPageSize(data.pageSize || 50);
    setTotalCnt(data.totalCnt || 0);
  };

  const handledelete = async (id) => {
    const response = await deleteProblem(id, uuid);
    // console.log(response);
    if (response.code === 200) {
      setPageIdx(1);
      handleClose();
      handleDeleteSuccessShow();
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      setIsonly(true);
    }
    getProblem();
  }, [params]);

  useEffect(() => {
    getProblem({
      pageIdx: pageIdx,
    });
  }, [pageIdx]);

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
        <Button variant="primary" onClick={() => handledelete(deleteId)}>
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

  const layout = (
    <Container className={styles.container}>
      <h2>更新题目</h2>
      {problem.map((item, i) => (
        <div key={i} className={styles.problemBox}>
          <div className={styles.problemTitle}>Problem {item.question_id}</div>
          <p>{item.content}</p>
          <a
            href={`/admin/updateproblem/${item.question_id}`}
            style={{ marginRight: '10px' }}
          >
            更新
          </a>
          <a
            href={`/admin/manageTestCase/${item.question_id}`}
            style={{ marginRight: '10px' }}
          >
            管理测试用例
          </a>
          <button
            className={styles.btn}
            // onClick={() => handledelete(item.question_number)}
            onClick={() => handleShow(item.question_number)}
          >
            <div className={styles.btnText}>删除</div>
          </button>
        </div>
      ))}
      <FootNav
        pageIdx={pageIdx}
        setIdx={setPageIdx}
        pageCnt={Math.ceil(totalCnt / pageSize)}
      />
      {deleteModal}
      {deleteSuccessModal}
    </Container>
  );

  return (
    <div>
      {/* 渲染子路由内容 */}
      {isonly ? <Outlet /> : layout}
    </div>
  );
}
