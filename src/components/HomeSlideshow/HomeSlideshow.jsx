import { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import useSiteSettings from '../../site/useSiteSettings.js';
import { safeSiteURL } from '../../site/urls.js';
import './HomeSlideshow.css';

export default function HomeSlideshow() {
  const { settings } = useSiteSettings();
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const { carousel } = settings;
  const slides = (carousel?.slides || []).filter((slide) => safeSiteURL(slide.image_url));

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  if (!carousel?.enabled || slides.length === 0) return null;
  return (
    <section className="home-slideshow" aria-label="首页幻灯片">
      <Carousel key={slides.map((s) => s.id).join(',')} interval={paused || reducedMotion ? null : carousel.interval_ms} slide={!reducedMotion} controls={slides.length > 1} indicators={slides.length > 1} nextLabel="下一张" prevLabel="上一张" pause="hover" keyboard>
        {slides.map((slide, index) => {
          const image = <img src={safeSiteURL(slide.image_url)} alt={slide.title || `首页幻灯片 ${index + 1}`} decoding="async" />;
          const href = safeSiteURL(slide.link_url);
          return <Carousel.Item key={slide.id}>
            {href ? <a href={href} className="home-slide-link">{image}</a> : image}
            {slide.title && <Carousel.Caption><span>{slide.title}</span></Carousel.Caption>}
          </Carousel.Item>;
        })}
      </Carousel>
      {slides.length > 1 && <button type="button" className="home-slide-pause" aria-pressed={paused || reducedMotion} onClick={() => setPaused((value) => !value)} disabled={reducedMotion}>{paused || reducedMotion ? '已暂停' : '暂停轮播'}</button>}
    </section>
  );
}
