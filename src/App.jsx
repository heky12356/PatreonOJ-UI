import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import SiteProvider from './site/SiteProvider.jsx';
import KnowledgeGraphPage from './pages/knowledgeGraph/KnowledgeGraphPage.jsx';
import useSiteSettings from './site/useSiteSettings.js';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './MainLayout.jsx';
import Login from './pages/login/Login.jsx';
import Register from './pages/register/Register.jsx';
import StudyComponent from './components/ContentComponent/StudyComponent.jsx';
import QuestionBank from './pages/questionBank/QuestionBank.jsx';
import ProblemPage from './pages/problemPage/ProblemPage.jsx';
import SubmissionDetailPage from './components/ContentComponent/SubmissionDetailPage.jsx';
import Profile from './pages/profile/profile.jsx';
import UserHomePage from './pages/profile/UserHomePage.jsx';
import AddProblem from './pages/addproblem';
import UpdateProblem from './pages/updateproblem';
import Updatebase from './pages/updatebase/update.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ManageTestCasePage from './pages/manage_test_case_page/index.jsx';
import Home from './pages/home/index.jsx';
import Admin from './pages/admin/index.jsx';
import UserManagementPage from './pages/admin/UserManagementPage.jsx';
import SettingPage from './pages/settingPage/settingPage.jsx';
import UserSettingPage from './pages/userSettingPage/UserSettingPage.jsx';
import ProblemSubmissionsPage from './pages/submitionPage/ProblemSubmissionsPage.jsx';
import UserSubmissionsPage from './pages/submitionPage/UserSubmissionsPage.jsx';
import QuestionGraphPage from './pages/questionGraph/QuestionGraphPage.jsx';

const whiteTheme = {
  token: {
    colorBgBase: '#ffffff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#ffffff',
    colorBgElevated: '#ffffff',
  },
};

function AppRoutes() {
  const { theme } = useSiteSettings();
  return (
    <ConfigProvider theme={{ token: { ...whiteTheme.token, ...theme.antdToken } }} locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route index element={<Home />} />
            <Route path="study" element={<StudyComponent />} />
            <Route path="problem" element={<QuestionBank />} />
            <Route path="graph" element={<KnowledgeGraphPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="users/:id" element={<UserHomePage />} />
            <Route path="settings" element={<UserSettingPage />} />
            <Route path="problem/:id" element={<ProblemPage />} />
            <Route path="problem/:id/graph" element={<QuestionGraphPage />} />
            <Route
              path="problem/:id/submissions"
              element={<ProblemSubmissionsPage />}
            />
            <Route
              path="profile/submissions"
              element={<UserSubmissionsPage />}
            />
            <Route
              path="submission/:submissionId"
              element={<SubmissionDetailPage />}
            />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredPermissions={['admin']}>
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route
              path="addproblem"
              element={
                <ProtectedRoute requiredPermissions={['admin', 'moderator']}>
                  <AddProblem />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="manageTestCase/:problem_id"
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
            <Route
              path="users"
              element={
                <ProtectedRoute requiredPermissions={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:uuid"
              element={
                <ProtectedRoute requiredPermissions={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default function App() {
  return <SiteProvider><AppRoutes /></SiteProvider>;
}
