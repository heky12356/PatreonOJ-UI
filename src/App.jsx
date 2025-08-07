//app里只放路由和配置
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import HomeComponent from './components/ContentComponent/HomeComponent.jsx';
import StudyComponent from './components/ContentComponent/StudyComponent.jsx';
import ProblemComponent from './components/ContentComponent/ProblemComponent.jsx';
import QuestionBank from './components/ContentComponent/QuestionBank.jsx';
import Rank from './components/ContentComponent/Rank.jsx';
import ProblemPage from './components/ContentComponent/ProblemPage.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* 使用主布局的所有页面 */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomeComponent />} />
                    <Route path="study" element={<StudyComponent />} />
                    <Route path="problem" element={<ProblemComponent />} />
                    <Route path="questionBank" element={<QuestionBank />} />
                    <Route path="rank" element={<Rank />} />
                    <Route path="profile" element={<div>个人中心页面</div>} />
                    {/* 题目详情页，也使用主布局 */}
                    <Route path="questionBank/:id" element={<ProblemPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;