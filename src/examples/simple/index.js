import React from 'react';
import ReactDOM from 'react-dom';
import {init} from 'e-css';

init({
    media: {
        tab: '@media (max-width: 960px)',
        tabMini: '@media (max-width: 700px)',
        mob: '@media (max-width: 450px)'
    }
});
const App = require('./app').default;
ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
    module.hot.accept('./app', () => {
        const NextApp = require('./app').default;
        ReactDOM.render(<NextApp/>, document.getElementById('root'));
    });
}
