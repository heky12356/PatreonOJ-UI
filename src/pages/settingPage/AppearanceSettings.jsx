import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Form, Spinner } from 'react-bootstrap';
import useSiteSettings from '../../site/useSiteSettings.js';
import { safeSiteURL } from '../../site/urls.js';
import { uploadSiteImage } from '../../api/site.js';
import './AppearanceSettings.css';

export default function AppearanceSettings() {
  const { settings, availableThemes, loading, error, save, refresh } = useSiteSettings();
  const [initialized, setInitialized] = useState(false);
  const [themeId, setThemeId] = useState('default');
  const [carousel, setCarousel] = useState({ enabled: false, interval_ms: 6000, slides: [] });
  const [saving, setSaving] = useState('');
  const [uploading, setUploading] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!loading && !error && !initialized) {
      setThemeId(settings.theme_id);
      setCarousel(settings.carousel);
      setInitialized(true);
    }
  }, [loading, error, initialized, settings]);

  const submit = async (section, patch) => {
    setSaving(section); setNotice(null);
    try {
      const result = await save(patch);
      if (section === 'theme') setThemeId(result.theme_id);
      else setCarousel(result.carousel);
      setNotice({ variant: 'success', text: section === 'theme' ? '主题已保存，已应用到整个站点。' : '幻灯片设置已保存。' });
    } catch (e) { setNotice({ variant: 'danger', text: e.message }); }
    finally { setSaving(''); }
  };

  const changeSlide = (id, patch) => setCarousel((old) => ({ ...old, slides: old.slides.map((slide) => slide.id === id ? { ...slide, ...patch } : slide) }));
  const move = (index, offset) => setCarousel((old) => {
    const slides = [...old.slides];
    [slides[index], slides[index + offset]] = [slides[index + offset], slides[index]];
    return { ...old, slides };
  });
  const upload = async (id, file) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setNotice({ variant: 'danger', text: '请选择不超过 8 MB 的 JPG、PNG 或 GIF 图片。' }); return;
    }
    setUploading(id); setNotice(null);
    try { changeSlide(id, await uploadSiteImage(file)); }
    catch (e) { setNotice({ variant: 'danger', text: e.message }); }
    finally { setUploading(''); }
  };
  const saveCarousel = (event) => {
    event.preventDefault();
    if (carousel.enabled && !carousel.slides.length) { setNotice({ variant: 'danger', text: '请至少添加一张幻灯片后再启用。' }); return; }
    if (carousel.slides.some((slide) => !safeSiteURL(slide.image_url) || (slide.link_url && !safeSiteURL(slide.link_url)))) {
      setNotice({ variant: 'danger', text: '请为每张幻灯片设置有效图片，链接支持站内路径或 HTTP(S) 地址。' }); return;
    }
    submit('carousel', { carousel });
  };

  if (loading) return <div className="appearance-loading"><Spinner size="sm" /> 正在读取站点设置…</div>;
  if (error) return <Alert variant="danger">{error} <Button size="sm" variant="outline-danger" onClick={refresh}>重新读取</Button></Alert>;
  const installed = availableThemes.some((theme) => theme.id === themeId);

  return <div className="appearance-settings">
    {notice && <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)} role="status">{notice.text}</Alert>}
    <section className="appearance-section" aria-labelledby="theme-heading">
      <div className="appearance-section-header"><div><h2 id="theme-heading">站点主题</h2><p>选择全站外观，保留已有内容和幻灯片设置。</p></div><Badge bg="light" text="dark">{availableThemes.length} 套可用主题</Badge></div>
      {!installed && <Alert variant="warning">当前设置的主题未安装，页面暂用默认主题。选择一套可用主题后保存即可切换。</Alert>}
      <div className="theme-options" role="radiogroup" aria-label="站点主题">
        {availableThemes.map((theme) => <label key={theme.id} className={`theme-option ${themeId === theme.id ? 'is-selected' : ''}`}>
          <input type="radio" name="site-theme" value={theme.id} checked={themeId === theme.id} onChange={() => setThemeId(theme.id)} />
          <span className="theme-thumbnail" style={{ '--preview-accent': theme.swatch || '#51624f' }} aria-hidden="true"><i /><span><b /><em /><em /></span><span className="theme-preview-block" /></span>
          <span className="theme-option-copy"><strong>{theme.name}</strong><span>{theme.description}</span></span>
        </label>)}
      </div>
      <div className="appearance-actions"><Button disabled={!!saving || !installed} onClick={() => submit('theme', { theme_id: themeId })}>{saving === 'theme' ? '保存中…' : '保存主题'}</Button></div>
    </section>

    <section className="appearance-section" aria-labelledby="carousel-heading">
      <div className="appearance-section-header"><div><h2 id="carousel-heading">首页幻灯片</h2><p>独立于主题，可上传图片、设置点击链接并调整显示顺序。</p></div><Form.Check type="switch" id="carousel-enabled" label={carousel.enabled ? '已启用' : '未启用'} checked={carousel.enabled} onChange={(e) => setCarousel((old) => ({ ...old, enabled: e.target.checked }))} /></div>
      <Form onSubmit={saveCarousel}>
        <Form.Group className="carousel-interval" controlId="carousel-interval"><Form.Label>轮播间隔（秒）</Form.Label><Form.Control type="number" min="3" max="30" required value={carousel.interval_ms / 1000} onChange={(e) => setCarousel((old) => ({ ...old, interval_ms: Number(e.target.value) * 1000 }))} /><Form.Text>鼠标悬停或点击暂停时停止自动播放。</Form.Text></Form.Group>
        {carousel.slides.length === 0 && <div className="slides-empty"><span className="bi bi-images" aria-hidden="true" /><strong>还没有幻灯片</strong><span>添加图片后，可在首页展示活动、课程或通知。</span></div>}
        <div className="slides-editor">
          {carousel.slides.map((slide, index) => <article className="slide-editor" key={slide.id} aria-label={`幻灯片 ${index + 1}`}>
            <div className="slide-image-preview">{safeSiteURL(slide.image_url) ? <img src={safeSiteURL(slide.image_url)} alt={slide.title || `幻灯片 ${index + 1} 预览`} /> : <span>图片预览</span>}</div>
            <div className="slide-editor-fields">
              <div className="slide-editor-header"><strong>幻灯片 {index + 1}</strong><div><Button type="button" size="sm" variant="outline-secondary" aria-label={`上移幻灯片 ${index + 1}`} disabled={index === 0 || !!uploading} onClick={() => move(index, -1)}>上移</Button><Button type="button" size="sm" variant="outline-secondary" aria-label={`下移幻灯片 ${index + 1}`} disabled={index === carousel.slides.length - 1 || !!uploading} onClick={() => move(index, 1)}>下移</Button><Button type="button" size="sm" variant="outline-danger" aria-label={`删除幻灯片 ${index + 1}`} disabled={!!uploading} onClick={() => setCarousel((old) => ({ ...old, slides: old.slides.filter((item) => item.id !== slide.id) }))}>删除</Button></div></div>
              <Form.Group controlId={`slide-upload-${slide.id}`}><Form.Label>上传图片</Form.Label><Form.Control type="file" accept="image/jpeg,image/png,image/gif" disabled={!!uploading} onChange={(e) => upload(slide.id, e.target.files?.[0])} /><Form.Text>{uploading === slide.id ? '图片上传中…' : 'JPG / PNG / GIF，最大 8 MB。建议使用横向图片。'}</Form.Text></Form.Group>
              <Form.Group controlId={`slide-image-${slide.id}`}><Form.Label>图片地址</Form.Label><Form.Control value={slide.image_url} maxLength={2048} required placeholder="上传后自动填入，也可粘贴图片网址" onChange={(e) => changeSlide(slide.id, { image_url: e.target.value })} /></Form.Group>
              <div className="slide-fields-pair"><Form.Group controlId={`slide-title-${slide.id}`}><Form.Label>图片说明</Form.Label><Form.Control value={slide.title} maxLength={120} placeholder="例如：本周实验安排" onChange={(e) => changeSlide(slide.id, { title: e.target.value })} /></Form.Group><Form.Group controlId={`slide-link-${slide.id}`}><Form.Label>点击链接</Form.Label><Form.Control value={slide.link_url} maxLength={2048} placeholder="/problem 或 https://example.com" onChange={(e) => changeSlide(slide.id, { link_url: e.target.value })} /></Form.Group></div>
            </div>
          </article>)}
        </div>
        <div className="appearance-actions"><Button type="button" variant="outline-secondary" disabled={carousel.slides.length >= 10 || !!uploading} onClick={() => setCarousel((old) => ({ ...old, slides: [...old.slides, { id: crypto.randomUUID(), title: '', image_url: '', link_url: '' }] }))}>添加幻灯片</Button><span className="text-secondary small">{carousel.slides.length} / 10 张</span><Button type="submit" disabled={!!saving || !!uploading}>{saving === 'carousel' ? '保存中…' : '保存幻灯片'}</Button></div>
      </Form>
    </section>
  </div>;
}
