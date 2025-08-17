import { render } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserId, isLoggedIn } from '../../api/user.js';


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
    <div>
        <h2>更新题目</h2>
        {
            problem.map((item, i) => (
                <div key={i}>
                    <h4>题目{i+1}</h4>
                    <p>{item.content}</p>
                    <Link to={`/updateproblem/${item.question_number}`}>更新</Link>
                    <button onClick={() => handledelete(item.question_number)}>删除</button>
                    <Link to={`/manageTestCase/${item.question_number}`}>管理测试用例</Link>
                </div>
            ))
        }
    </div>
    );
    
    return(
        <div>
            {/* 渲染子路由内容 */}
            {isonly ? <Outlet /> : layout}
        </div>
    )
}