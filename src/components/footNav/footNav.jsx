import styles from './footNav.module.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function FootNav({ pageCnt, pageIdx, setIdx }) {
  // 智能分页逻辑：显示当前页附近的页码
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // 最多显示5个页码按钮（不含首尾）

    if (pageCnt <= 7) {
      // 页数较少时全部显示
      for (let i = 1; i <= pageCnt; i++) pages.push(i);
    } else {
      // 始终显示第一页
      pages.push(1);

      if (pageIdx > 4) {
        pages.push('...');
      }

      // 计算中间显示的页码范围
      let start = Math.max(2, pageIdx - 1);
      let end = Math.min(pageCnt - 1, pageIdx + 1);

      // 调整以保证至少显示3个中间页码
      if (pageIdx <= 4) {
        end = 5;
      } else if (pageIdx >= pageCnt - 3) {
        start = pageCnt - 4;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (pageIdx < pageCnt - 3) {
        pages.push('...');
      }

      // 始终显示最后一页
      pages.push(pageCnt);
    }
    return pages;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pageCnt && newPage !== pageIdx) {
      setIdx(newPage);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (pageCnt <= 1) return null;

  return (
    <div className={styles.container}>
      {/* 上一页按钮 */}
      <div
        className={`${styles.paginationButton} ${pageIdx === 1 ? styles.paginationButtonDisabled : ''}`}
        onClick={() => handlePageChange(pageIdx - 1)}
      >
        <FaChevronLeft size={12} />
      </div>

      {/* 页码按钮 */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`dots-${index}`} className={styles.dots}>
              ...
            </span>
          );
        }
        return (
          <div
            key={page}
            onClick={() => handlePageChange(page)}
            className={`${styles.paginationButton} ${page === pageIdx ? styles.paginationButtonActive : ''}`}
          >
            {page}
          </div>
        );
      })}

      {/* 下一页按钮 */}
      <div
        className={`${styles.paginationButton} ${pageIdx === pageCnt ? styles.paginationButtonDisabled : ''}`}
        onClick={() => handlePageChange(pageIdx + 1)}
      >
        <FaChevronRight size={12} />
      </div>
    </div>
  );
}
