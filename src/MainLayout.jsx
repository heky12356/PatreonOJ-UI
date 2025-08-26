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
      <Container style={{ backgroundColor: 'white' }}>
        <Outlet />
      </Container>   
    </div>
  );
};

export default MainLayout;

