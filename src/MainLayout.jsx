import { Outlet } from 'react-router-dom';
import HeaderNav from './components/HeaderNav/HeaderNav';
import { Container } from 'react-bootstrap';
import './main.css' 


const MainLayout = () => {
  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <HeaderNav />
      <Container fluid style={{ backgroundColor: 'white', width: '100%' }}>
        <Outlet />
      </Container>   
    </div>
  );
};

export default MainLayout;

