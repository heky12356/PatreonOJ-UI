//app里只放路由和配置
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './MainLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import HomeComponent from './components/ContentComponent/HomeComponent.jsx';
import StudyComponent from './components/ContentComponent/StudyComponent.jsx';
import QuestionBank from './components/ContentComponent/QuestionBank.jsx';
import Rank from './components/ContentComponent/Rank.jsx';
import ProblemPage from './components/ContentComponent/ProblemPage.jsx';
import SubmissionDetailPage from './components/ContentComponent/SubmissionDetailPage.jsx';
import Profile from './pages/profile/profile.jsx';
import AddProblem from './pages/addproblem';
import UpdateProblem from './pages/updateproblem';
import Updatebase from './pages/updatebase/update.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ManageTestCasePage from './pages/manage_test_case_page/index.jsx';


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
                    {/* <Route path="problem" element={<ProblemComponent />} /> */}
                    <Route path="questionBank" element={<QuestionBank />} />
                    <Route path="rank" element={<Rank />} />
                    <Route path="profile" element={<Profile />} />
                    {/* 题目详情页，也使用主布局 */}
                    <Route path="questionBank/:id" element={<ProblemPage />} />
                    {/* 评测结果详情页 */}
                    <Route path="submission/:submissionId" element={<SubmissionDetailPage />} />
                    {/* 添加题目页面 - 需要题目管理权限 */}
                    <Route path="addproblem" element={
                        <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                            <AddProblem />
                        </ProtectedRoute>
                    } />
                    {/* 更新题目页面 - 需要题目管理权限 */}
                    <Route path="updateproblem/" element={
                        <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                            <Updatebase />
                        </ProtectedRoute>
                    } >
                        <Route path=":id" element={<UpdateProblem />} />
                    </Route>
                    {/* 管理测试用例页面 - 需要题目管理权限 */}
                    <Route path="manageTestCase/:problem_number" element={
                        <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                            <ManageTestCasePage />
                        </ProtectedRoute>
                    } />

                </Route>
            </Routes>
        </Router>
    );
}

export default App;