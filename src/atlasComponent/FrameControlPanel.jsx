import React, { memo } from 'react';
import { FaSearch, FaInfoCircle, FaSync, FaTimes, FaLink } from 'react-icons/fa';
import styles from './frame.module.css';

const FrameControlPanel = memo(({
  searchKeyword,
  onSearchChange,
  edgeFilters,
  onFilterChange,
  pathStart,
  pathEnd,
  onPathStartChange,
  onPathEndChange,
  onFindPath,
  onReset,
  onRefresh,
  loading,
  stats,
  nodeOptions
}) => {
  return (
    <div className={styles.controlPanel}>
      <div className={styles.header}>
        <div className={styles.title}>
          <FaInfoCircle size={20} color="#51624f" />
          <span>知识图谱探索</span>
        </div>
        <div className={styles.controls}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onReset}
            disabled={loading}
          >
            <FaTimes /> 重置
          </button>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onRefresh}
            disabled={loading}
          >
            <FaSync className={loading ? 'fa-spin' : ''} /> 刷新
          </button>
        </div>
      </div>

      <div className={styles.mainControls}>
        <div className={styles.inputGroup}>
          <FaSearch className={styles.inputIcon} />
          <input
            type="text"
            className={styles.formControl}
            placeholder="搜索..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {[
            { key: 'HAS_SKILL', label: '包含技能' },
            { key: 'PREREQUISITE', label: '前置' },
            { key: 'SKILL_CO_OCCUR', label: '技能共现' },
          ].map(({ key, label }) => (
            <label key={key} className={styles.checkboxLabel}>
              <input
                className={styles.checkboxInput}
                type="checkbox"
                checked={!!edgeFilters[key]}
                onChange={(e) => onFilterChange(key, e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.pathFinder}>
        <span className={styles.pathLabel}>路径:</span>
        <input
          className={styles.pathInput}
          list="graph-path-start"
          placeholder="起点"
          value={pathStart || ''}
          onChange={(e) => onPathStartChange(e.target.value)}
        />
        <datalist id="graph-path-start">
          {nodeOptions.map((node) => (
            <option key={`start-${node.id}`} value={node.id}>
              {node.title}
            </option>
          ))}
        </datalist>

        <span className={styles.arrow}>→</span>

        <input
          className={styles.pathInput}
          list="graph-path-end"
          placeholder="终点"
          value={pathEnd || ''}
          onChange={(e) => onPathEndChange(e.target.value)}
        />
        <datalist id="graph-path-end">
          {nodeOptions.map((node) => (
            <option key={`end-${node.id}`} value={node.id}>
              {node.title}
            </option>
          ))}
        </datalist>

        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onFindPath}
          disabled={loading}
        >
          <FaLink /> 查找
        </button>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span>题目:</span>
          <strong>{stats.questionCount}</strong>
        </div>
        <div className={styles.statItem}>
          <span>技能:</span>
          <strong>{stats.skillCount}</strong>
        </div>
        <div className={styles.statItem}>
          <span>边:</span>
          <strong>{stats.edgeCount}</strong>
        </div>
        {stats.pathLength > 0 && (
          <div className={styles.statItem}>
            <span>路径:</span>
            <strong>{stats.pathLength}</strong>
          </div>
        )}
      </div>
    </div>
  );
});

export default FrameControlPanel;
