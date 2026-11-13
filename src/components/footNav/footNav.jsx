import styles from './footNav.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function FootNav({ pageCnt, pageIdx, setIdx }) {
  const pages = [];
  if (pageCnt <= 7) {
    for (let page = 1; page <= pageCnt; page++) pages.push(page);
  } else {
    pages.push(1);
    if (pageIdx > 4) pages.push('...');
    let start = Math.max(2, pageIdx - 1);
    let end = Math.min(pageCnt - 1, pageIdx + 1);
    if (pageIdx <= 4) end = 5;
    else if (pageIdx >= pageCnt - 3) start = pageCnt - 4;
    for (let page = start; page <= end; page++) pages.push(page);
    if (pageIdx < pageCnt - 3) pages.push('...');
    pages.push(pageCnt);
  }
  const changePage = page => {
    if (page >= 1 && page <= pageCnt && page !== pageIdx) {
      setIdx(page);
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };
  if (pageCnt <= 1) return null;
  return <nav className={styles.container} aria-label="题库分页">
    <button type="button" aria-label="上一页" disabled={pageIdx === 1} className={styles.paginationButton} onClick={() => changePage(pageIdx - 1)}><FaChevronLeft size={11} /></button>
    <span className={styles.pageNumbers}>{pages.map((page, index) => page === '...' ? <span key={`dots-${index}`} className={styles.dots}>…</span> : <button type="button" key={page} aria-label={`第 ${page} 页`} aria-current={page === pageIdx ? 'page' : undefined} onClick={() => changePage(page)} className={`${styles.paginationButton} ${page === pageIdx ? styles.paginationButtonActive : ''}`}>{page}</button>)}</span>
    <span className={styles.mobileSummary}>第 {pageIdx} / {pageCnt} 页</span>
    <button type="button" aria-label="下一页" disabled={pageIdx === pageCnt} className={styles.paginationButton} onClick={() => changePage(pageIdx + 1)}><FaChevronRight size={11} /></button>
  </nav>;
}
