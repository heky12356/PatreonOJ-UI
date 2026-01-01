import styles from './footNav.module.css'

export default function FootNav({
    pageCnt,
    pageIdx,
    setIdx,
}) {

    const changeIdx = (idx) => {
        // console.log(idx)
        setIdx(idx)
    }

    let mp = [];
    for (let i = 1; i <= pageCnt; i ++) {
        let style = [styles.littleButton]
        if (i == pageIdx) {
            style.push(styles.focusLittleButton)
        }
        mp.push(
            <div key={i} onClick={() => changeIdx(i)} className={style.join(' ')}>
                <div>
                    {i}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {mp}
        </div>
    )
}