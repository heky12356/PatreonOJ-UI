import { Outlet } from 'react-router-dom';
import useCurrentUserUuid from './hooks/useCurrentUserUuid.js';
import HeaderNav from './components/HeaderNav/HeaderNav';
import { Container } from 'react-bootstrap';
import './main.css' 


const MainLayout = () => {
  const uuid = useCurrentUserUuid();
  return (
    <div style={{ 
      backgroundColor: 'white', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <HeaderNav />
      <Container fluid style={{ backgroundColor: 'white', width: '100%' }}>
        <Outlet key={uuid || 'anonymous'} />
      </Container>   
    </div>
  );
};

export default MainLayout;

