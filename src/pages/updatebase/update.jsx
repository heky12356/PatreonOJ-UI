import { Outlet } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserId, isLoggedIn } from '../../api/user.js';
import { Container, Button } from 'react-bootstrap';


export default function Updatebase () {
    const params = useParams();
    const [isonly, setIsonly] = useState(false);    
    const [problem, setProblem] = useState([]);

    const uuid = getUserId();

    const getProblem = async () => {
        const response = await fetch(`/api/question/`);
        if (!response.ok) {
            throw new Error('获取题目失败');
        }
        const data = await response.json();
        setProblem(data.result);
    }

    const handledelete = async (id) => {
        const response = await fetch(`/api/question/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                number: id,
                uuid: uuid,
            })
        });
        if (!response.ok) {
            throw new Error('删除题目失败');
        }
        getProblem();
    }



    useEffect(() => {
        if (Object.keys(params).length > 0) {
            setIsonly(true);
        }
        getProblem();
    }, [params]);
    
    const layout = (
    <Container style={style.container}>
        <h2>更新题目</h2>
        {
            problem.map((item, i) => (
                <div key={i} style={style.problemBox}>
                    <div style={style.problemTitle}>Problem {item.question_number}</div>
                    <p>{item.content}</p>
                    <Link to={`/updateproblem/${item.question_number}`} style={{marginRight:'10px'}}>更新</Link>
                    <Link to={`/manageTestCase/${item.question_number}`}>管理测试用例</Link>
                    <button style={style.btn} onClick={() => handledelete(item.question_number)} >
                        <div style={style.btnText}>
                            删除
                        </div>
                    </button>
                </div>
            ))
        }
    </Container>
    );
    
    return(
        <div>
            {/* 渲染子路由内容 */}
            {isonly ? <Outlet /> : layout}
        </div>
    )
}

const style = {
    container: {
        marginTop: "3vh",
    },
    problemBox: {
        border: "1px solid #000",
        borderRadius: "10px",
        marginBottom: "2vh",
        padding: '10px',
    },
    btn: {
        marginLeft: '10px',
        height: '3vh',
        width: '3vw',
        borderRadius: '10px',
        backgroundColor: 'red',
        border: 'none',
    },
    btnText: {
        color: 'white',
        fontSize: '13px',
    },
    problemTitle: {
        fontSize: '18px',
        fontWeight: 'bold',
    }
}