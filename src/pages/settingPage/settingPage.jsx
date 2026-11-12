import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from './settingPage.module.css';
import {
  getAnnouncement,
  getHomeShowText,
  updateAnnouncement,
  updateHomeText,
} from '../../api/homeShowText.js';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AppearanceSettings from './AppearanceSettings.jsx';

export default function SettingPage() {
  const [homeShowText, setHomeShowText] = useState('');
  const [homeSTEditStatus, setHomeSTEditStatus] = useState(false);

  const [announcement, setAnnouncement] = useState('');
  const [announcementEditStatus, setAnnouncementEditStatus] = useState(false);

  const handleHomeTextChange = (e) => {
    const { value } = e.target;
    setHomeShowText(value);
  };

  const handleAnnouncementChange = (e) => {
    const { value } = e.target;
    setAnnouncement(value);
  };

  const saveHomeShowText = async () => {
    const result = await updateHomeText(homeShowText);
    if (result?.code === 200) {
      setHomeSTEditStatus(false);
    }
  };

  const saveAnnouncement = async () => {
    const result = await updateAnnouncement(announcement);
    if (result?.code === 200) {
      setAnnouncementEditStatus(false);
    }
  };

  const fetchHomeShowText = async () => {
    const data = await getHomeShowText();
    setHomeShowText(data || '');
  };

  const fetchAnnouncement = async () => {
    const data = await getAnnouncement();
    setAnnouncement(data || '');
  };

  useEffect(() => {
    fetchHomeShowText();
    fetchAnnouncement();
  }, []);

  return (
    <Container>
      <Row>
        <Col xs={12}>
          <div className={styles.settingPage}>
            <h1>站点设置</h1>
            <AppearanceSettings />

            <h2>首页内容</h2>
            <h3>显示效果</h3>
            <div className={styles.markdownPreview}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {homeShowText}
              </ReactMarkdown>
            </div>
            <textarea
              name="content"
              value={homeShowText}
              onChange={handleHomeTextChange}
              placeholder="首页显示内容..."
              rows="15"
              disabled={!homeSTEditStatus}
            ></textarea>
            <div className={styles.buttonGroup}>
              {homeSTEditStatus && <Button onClick={saveHomeShowText}>保存</Button>}
              {!homeSTEditStatus && (
                <Button onClick={() => setHomeSTEditStatus(true)}>编辑</Button>
              )}
            </div>

            <h2>公告</h2>
            <h3>显示效果</h3>
            <div className={styles.markdownPreview}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {announcement}
              </ReactMarkdown>
            </div>
            <textarea
              name="announcement"
              value={announcement}
              onChange={handleAnnouncementChange}
              placeholder="公告内容..."
              rows="15"
              disabled={!announcementEditStatus}
            ></textarea>
            <div className={styles.buttonGroup}>
              {announcementEditStatus && (
                <Button onClick={saveAnnouncement}>保存</Button>
              )}
              {!announcementEditStatus && (
                <Button onClick={() => setAnnouncementEditStatus(true)}>
                  编辑
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
