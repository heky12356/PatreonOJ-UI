import { Outlet } from 'react-router-dom';
import HeaderNav from './components/HeaderNav/HeaderNav';
import { Container } from 'react-bootstrap';
import './main.css' 


const MainLayout = () => {
  return (
    <div>
      <HeaderNav />
      <Container>
        <Outlet />
      </Container>   
    </div>
  );
};

export default MainLayout;

