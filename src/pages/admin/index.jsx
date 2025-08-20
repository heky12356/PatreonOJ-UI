import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";

export default function Admin() {
  return (
    <>
      <Container style={style.container}>
        <Row>
          <Row>
            <Col md={12}>
              <h3>Admin</h3>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Link to="/addproblem">add problem</Link>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <Link to="/updateproblem">message problem</Link>
            </Col>
          </Row>
        </Row>
      </Container>
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
