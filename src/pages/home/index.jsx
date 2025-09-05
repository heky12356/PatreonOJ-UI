import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import styles from './index.module.css';

export default function Home() {
    return (
        <div className={styles.home}>
            <Container>
                {/* 欢迎区域 */}
                <Row className={`justify-content-center text-center py-5 ${styles.welcome}`}>
                    <Col lg={8}>
                        <h1 className={styles.title}>欢迎来到 TGU-OJ</h1>
                        <p className={styles.subtitle}>在线编程练习平台</p>
                        <p className={styles.description}>
                            提升编程技能，挑战算法题目，与同学一起成长
                        </p>
                        <div className={styles.buttonGroup}>
                            <Button variant="success" size="lg" className="me-3" href="/problem">
                                开始练习
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}