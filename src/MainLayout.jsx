import { Outlet } from 'react-router-dom';
import HeaderNav from './components/HeaderNav/HeaderNav';
import { Container } from 'react-bootstrap';


const MainLayout = () => {
  return (
    <>
      <HeaderNav />
      <Container>
        <Outlet />
      </Container>   
    </>
  );
};

export default MainLayout;