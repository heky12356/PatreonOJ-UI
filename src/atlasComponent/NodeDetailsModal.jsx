import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './frame.module.css';

const NodeDetailsModal = ({ node, onClose, graphLinks }) => {
  if (!node) return null;

  const isSkill = node.node_type === 'skill' || String(node.id).startsWith('S:');

  // Helper to find related questions for a skill node
  const getRelatedQuestions = () => {
    if (!isSkill) return [];
    
    return [...new Set(
      graphLinks
        .filter((l) => {
          const sid = String(node.id);
          const s = String(l.source);
          const t = String(l.target);
          return (
            (s === sid && t.startsWith('Q:')) ||
            (t === sid && s.startsWith('Q:'))
          );
        })
        .map((l) => {
          const sid = String(node.id);
          const targetId = String(l.source) === sid ? String(l.target) : String(l.source);
          return targetId.replace(/^Q:/, ''); // Return clean ID
        })
    )].slice(0, 50);
  };

  const renderSkillContent = () => (
    <div>
      <h3 className={styles.modalNodeTitle}>{node.title}</h3>
      <div className={styles.infoSection}>
        <p>
          <span className={styles.infoLabel}>技能 Key:</span>{' '}
          {node.skill_key || String(node.id).replace(/^S:/, '')}
        </p>
        {node.updated_at && (
          <p>
            <span className={styles.infoLabel}>更新时间:</span>{' '}
            {String(node.updated_at)}
          </p>
        )}
      </div>
      <div className={styles.infoSection}>
        <span className={styles.infoLabel}>相关题目:</span>
        <div className={styles.relatedTags}>
          {getRelatedQuestions().map((qid) => (
            <a
              key={qid}
              className={styles.relatedLink}
              href={`/problem/${qid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {qid}
            </a>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuestionContent = () => (
    <div>
      <div className={styles.modalHeaderActions}>
        <h3 className={styles.modalNodeTitle}>{node.title}</h3>
        <a
          className={`${styles.btn} ${styles.btnPrimary}`}
          href={`/problem/${String(node.id).replace(/^Q:/, '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          去做题
        </a>
      </div>

      <div className={styles.infoGrid}>
        <div>
          <span className={styles.infoLabel}>题目编号</span>
          <div>{String(node.id).replace(/^Q:/, '')}</div>
        </div>
        <div>
          <span className={styles.infoLabel}>难度</span>
          <span
            className={`${styles.badge} ${
              node.difficulty === '简单'
                ? styles.badgeEasy
                : node.difficulty === '中等'
                  ? styles.badgeMedium
                  : node.difficulty === '困难'
                    ? styles.badgeHard
                    : styles.badgeDefault
            }`}
          >
            {node.difficulty}
          </span>
        </div>
      </div>

      {node.tags && (
        <div className={styles.infoSection}>
          <span className={styles.infoLabel}>标签</span>
          <div className={styles.tagList}>
            {node.tags.split(',').map(tag => tag.trim() && (
              <span key={tag} className={`${styles.badge} ${styles.badgeDefault}`}>
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.description && (
        <div className={styles.infoSection}>
          <span className={styles.infoLabel}>题目描述</span>
          <div className={styles.descriptionBox}>
            {node.description}
          </div>
        </div>
      )}

      {node.sample_input && node.sample_output && (
        <div className={styles.infoSection}>
          <div className={styles.sampleGrid}>
            <div>
              <span className={styles.infoLabel}>样例输入</span>
              <div className={styles.codeBlock}>{node.sample_input}</div>
            </div>
            <div>
              <span className={styles.infoLabel}>样例输出</span>
              <div className={styles.codeBlock}>{node.sample_output}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h5 className={styles.modalType}>
            {isSkill ? '技能详情' : '题目详情'}
          </h5>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className={styles.modalBody}>
          {isSkill ? renderSkillContent() : renderQuestionContent()}
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsModal;
