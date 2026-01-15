//app里只放路由和配置
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import MainLayout from './MainLayout.jsx';
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';
import StudyComponent from './components/ContentComponent/StudyComponent.jsx';
import QuestionBank from './pages/questionBank/QuestionBank.jsx';
import ProblemPage from './pages/problemPage/ProblemPage.jsx';
import SubmissionDetailPage from './components/ContentComponent/SubmissionDetailPage.jsx';
import Profile from './pages/profile/profile.jsx';
import AddProblem from './pages/addproblem';
import UpdateProblem from './pages/updateproblem';
import Updatebase from './pages/updatebase/update.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ManageTestCasePage from './pages/manage_test_case_page/index.jsx';
import Home from './pages/home/index.jsx';
import Admin from './pages/admin/index.jsx';
import SettingPage from './pages/settingPage/settingPage.jsx';
import AddpPage1 from './pages/addpPage1/index.jsx';
import CategoryAdminPage from './pages/CategoryAdminPage/CategoryAdminPage.jsx';
import CreateCategoryPage from './pages/createCategoryPage/createCategoryPage.jsx';
import UpdateCategoryPage from './pages/updateCategoryPage/updateCategoryPage.jsx';
import Frame from './atlasComponent/frame.jsx';
import ProblemSubmissionsPage from './pages/submitionPage/ProblemSubmissionsPage.jsx';
import UserSubmissionsPage from './pages/submitionPage/UserSubmissionsPage.jsx';

// Ant Design 白色主题配置
const whiteTheme = {
  token: {
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#ffffff',
    colorBgElevated: '#ffffff',
  },
};

function App() {
  return (
    <ConfigProvider theme={whiteTheme}>
      <Router>
        <Routes>
          {/* 使用主布局的所有页面 */}
          <Route path="/" element={<MainLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route index element={<HomeComponent />} /> */}
            <Route index element={<Home />} />
            <Route path="study" element={<StudyComponent />} />
            <Route path="graph" element={<Frame />} />
            {/* <Route path="problem" element={<ProblemComponent />} /> */}
            <Route path="problem" element={<QuestionBank />} />
            {/* <Route path="rank" element={<Rank />} /> */}
            <Route path="profile" element={<Profile />} />
            {/* 题目详情页，也使用主布局 */}
            <Route path="problem/:id" element={<ProblemPage />} />
            <Route
              path="problem/:question_number/submissions"
              element={<ProblemSubmissionsPage />}
            />
            <Route
              path="profile/submissions"
              element={<UserSubmissionsPage />}
            />
            {/* 评测结果详情页 */}
            <Route
              path="submission/:submissionId"
              element={<SubmissionDetailPage />}
            />
          </Route>
          {/** admin页面专门开一个页面  */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPermissions={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          >
            {/* 添加题目页面 - 需要题目管理权限 */}
            <Route
              path="addproblem"
              element={
                <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                  <AddProblem />
                </ProtectedRoute>
              }
            ></Route>
            {/* 更新题目页面 - 需要题目管理权限 */}
            <Route
              path="updateproblem/"
              element={
                <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                  <Updatebase />
                </ProtectedRoute>
              }
            >
              <Route path=":id" element={<UpdateProblem />} />
            </Route>
            {/* 管理测试用例页面 - 需要题目管理权限 */}
            <Route
              path="manageTestCase/:problem_number"
              element={
                <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                  <ManageTestCasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="setting"
              element={
                <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                  <SettingPage />
                </ProtectedRoute>
              }
            />
            {/* 分类管理页面 - 需要管理员权限 */}
            <Route
              path="category"
              element={
                <ProtectedRoute requiredPermissions={['admin']}>
                  <CategoryAdminPage />
                </ProtectedRoute>
              }
            />
            {/* 添加分类页面 - 需要管理员权限 */}
            <Route
              path="createcategory"
              element={
                <ProtectedRoute requiredPermissions={['admin']}>
                  <CreateCategoryPage />
                </ProtectedRoute>
              }
            />
            {/* 编辑分类页面 - 需要管理员权限 */}
            <Route
              path="updatecategory/:id"
              element={
                <ProtectedRoute requiredPermissions={['admin']}>
                  <UpdateCategoryPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
