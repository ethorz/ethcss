import React from 'react'
import { injectStyles } from 'ecss'

const styles = {
    wrapper: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: '100px',
        height: '100px',
        backgroundColor: 'white'
    }
}

injectStyles(styles)

const LazyModule = () => (
    <div className={styles.wrapper}>
      Check inject styles
    </div>
)

export default LazyModule
