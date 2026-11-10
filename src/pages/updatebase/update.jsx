import { Outlet, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserId } from '../../api/user.js';
import { Container, Button, Modal } from 'react-bootstrap';
import { getProblem as getProblemApi } from '../../api/getproblem.js';
import FootNav from '../../components/footNav/footNav.jsx';
import { deleteProblem } from '../../api/deleteProblem.js';
import styles from './update.module.css';

export default function Updatebase() {
  const params = useParams();
  const [isonly, setIsonly] = useState(false);
  const [problem, setProblem] = useState([]);
  const [pageIdx, setPageIdx] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCnt, setTotalCnt] = useState(0);

  const [show, setShow] = useState(false);
  const [deleteSuccessShow, setDeleteSuccessShow] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const uuid = getUserId();

  const handleClose = () => setShow(false);
  const handleShow = (id) => {
    setDeleteId(id);
    setShow(true);
  };

  const handleDeleteSuccessClose = () => setDeleteSuccessShow(false);
  const handleDeleteSuccessShow = () => setDeleteSuccessShow(true);

  const getProblem = async () => {
    const data = await getProblemApi({
      pageIdx,
      pageSize,
    });
    setProblem(data.result || []);
    setPageIdx(data.pageIdx || 1);
    setPageSize(data.pageSize || 10);
    setTotalCnt(data.totalCnt || 0);
  };

  const handledelete = async (id) => {
    const response = await deleteProblem(id, uuid);
    if (response?.code === 200) {
      setPageIdx(1);
      handleClose();
      handleDeleteSuccessShow();
      await getProblem();
    }
  };

  useEffect(() => {
    if (Object.keys(params).length > 0) {
      setIsonly(true);
    }
    getProblem();
  }, [params]);

  useEffect(() => {
    getProblem();
  }, [pageIdx]);

  const deleteModal = (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>提示</Modal.Title>
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
        <Modal.Title>提示</Modal.Title>
      </Modal.Header>
      <Modal.Body>删除成功</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleDeleteSuccessClose}>
          确定
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
            href={`/admin/updateproblem/${item.id}`}
            style={{ marginRight: '10px' }}
          >
            更新
          </a>
          <a
            href={`/admin/manageTestCase/${item.id}`}
            style={{ marginRight: '10px' }}
          >
            管理测试用例
          </a>
          <button className={styles.btn} onClick={() => handleShow(item.id)}>
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

  return <div>{isonly ? <Outlet /> : layout}</div>;
}
