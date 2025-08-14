import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { getUserId, isLoggedIn } from '../../api/user.js';
import { Link } from 'react-router-dom';

export default function Profile() {
    const [problemList, setProblemList] = useState([]);
    const userId = getUserId();
    useEffect(() => {
        if (!userId) {
            return;
        }
        const getProblemList = async () => {
            const response = await fetch(`/api/user/solves/${userId}`);
            if (!response.ok) {
                throw new Error('获取解题记录失败');
            }
            const data = await response.json();
            setProblemList(data);
            console.log(data);
        };
        getProblemList();

    }, [userId]);



    return (
        <>
            <h2>已解决题目</h2>
            <ListGroup>
                {problemList.map((item, i) => (
                    <ListGroup.Item key={i}>
                        <Link to={`/questionBank/${item}`}>{item}</Link>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    )
}
