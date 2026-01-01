import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from './settingPage.module.css';
import { getHomeShowText, updateHomeText } from '../../api/homeShowText.js';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function SettingPage() {
  const [homeShowText, setHomeShowText] = useState(''); // OJ首页展示文本
  const [homeSTEditStatus, setHomeSTEditStatus] = useState(false); // 状态

  const handleInputChange = (e) => {
    const { value } = e.target;
    setHomeShowText(value);
  };

  const saveHomeShowText = async () => {
    console.log(homeShowText);
    const result = await updateHomeText(homeShowText);
    if (result.code === 200) {
      setHomeSTEditStatus(false);
    }
  };

  const fetchHomeShowText = async () => {
    const data = await getHomeShowText();
    setHomeShowText(data || '');
  };

  useEffect(() => {
    fetchHomeShowText();
  }, []);

  return (
    <Container>
      <Row>
        <Col md={10}>
          <div className={styles.settingPage}>
            <h1>设置</h1>
            <h2>首页内容</h2>
            <h3>显示效果</h3>
            <div className={styles.markdownPreview}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {homeShowText}
              </ReactMarkdown>
            </div>
            <textarea
              // className={`${styles.textArea}`}
              name="content"
              value={homeShowText}
              onChange={handleInputChange}
              placeholder="首页显示内容..."
              rows="15"
              disabled={!homeSTEditStatus}
            ></textarea>
            <div className={styles.buttonGroup}>
              {homeSTEditStatus && (
                <Button onClick={saveHomeShowText}>保存</Button>
              )}
              {!homeSTEditStatus && (
                <Button onClick={() => setHomeSTEditStatus(true)}>编辑</Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
