import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import AdminNav from "../../components/adminNav/adminNav";
import { Outlet } from 'react-router-dom';

export default function Admin() {
  const path = window.location.pathname;
  if (path == '/admin') {
    return (
      <>
        <AdminNav />
        <Container style={style.container}>
         hello world
        </Container>
      </>
    )
  }

  return (
    <>
      <AdminNav />
      <Outlet />
    </>
  );
}

const style = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
    height: "30vh",
    border: "1px solid #000",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "10vh",
  },
};
