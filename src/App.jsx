//app里只放路由和配置
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import QuestionBank from '../src/components/ContentComponent/QuestionBank.jsx';
import ProblemPage from '../src/components/ContentComponent/ProblemPage.jsx';   // 题目详情
import ContentComponent from "./components/ContentComponent/ContentComponent.jsx";
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* 其他页面（使用主布局） */}
                <Route path="/*" element={<MainLayout />} />
                <Route path="*" element={<ContentComponent />} />

                {/* 题目详情页，:id 是动态参数（如 p1000） */}
                <Route path="/questionBank/:id" element={<ProblemPage />} />
            </Routes>
        </Router>
    );
}

export default App;