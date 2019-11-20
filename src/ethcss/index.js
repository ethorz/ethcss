import * as freeStyle from 'free-style'

const Style = freeStyle.create()
let options = {}

export const cn = function() {
    const classNames = [];
    const mainArguments = Array.prototype.slice.call(arguments);

    mainArguments.forEach((className) => {
        if (typeof className === 'string') {
            classNames.push(className);
        } else if (typeof className === 'object') {
            if (className.__isICSS) {
                classNames.push(className.toString());
            } else {
                for (let key in className) {
                    if (className.hasOwnProperty(key)) {
                        if (className[key]) {
                            classNames.push(key);
                        }
                    }
                }
            }
        }
    });

    return classNames.join(' ');
};

export const init = (initOptions = {}) => {
    options = initOptions;
};

export const addStyles = (innerStyles, styleInstance) => {
    const styles = innerStyles;
    let key;

    if (!styleInstance) {
      styleInstance = Style
    }

    const mapStyle = (key, style) => {
        delete style.toString;
        delete style.__isICSS;
        let name;

        name = styleInstance.registerStyle(style, key);

        styles[key].__isICSS = true;
        styles[key].toString = () => {
            return name;
        };
    };

    const mapItem = (key) => {
        let style = styles[key];
        if (typeof style === 'function') {
            style = style.bind(styles);
            style = style();
        }

        styles[key] = {...style};
        if (key === '_global') {
            for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    delete style[subKey].toString;
                    delete style[subKey].__isICSS;
                }
            }
            styleInstance.registerCss(style);
        } else if (key === '_rules') {
            for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    styleInstance.registerRule(subKey, style[subKey]);
                }
            }
        } else if (key === '_animation') {
            for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    delete style[subKey].toString;
                    delete style[subKey].__isICSS;
                    let name;
                    name = styleInstance.registerKeyframes(style[subKey], subKey);

                    styles[key][subKey].__isICSS = true;
                    styles[key][subKey].toString = () => {
                        return name;
                    };
                }
            }
        } else {
            mapStyle(key, style);

            if (options.media) {
                for (let media in options.media) {
                    if (options.media.hasOwnProperty(media)) {
                        const mediaKey = `${key}_${media}`;
                        const mediaOption = options.media[media];

                        styles[mediaKey] = {[mediaOption]: {...style}};
                        mapStyle(mediaKey, {[mediaOption]: style});
                    }
                }
            }
        }
    };

    for (key in styles) {
        if (styles.hasOwnProperty(key)) {
            if (typeof styles[key] === 'object') {
                mapItem(key);
            }
        }
    }

    for (key in styles) {
        if (styles.hasOwnProperty(key)) {
            if (typeof styles[key] === 'function') {
                mapItem(key);
            }
        }
    }

    return styles;
};

export const injectStyles = (innerStyles) => {
    const sheet = document.createElement('style')
    const InjectedStyleInstance = freeStyle.create()
    const injectedStyles = addStyles(innerStyles, InjectedStyleInstance)

    Style.merge(InjectedStyleInstance)
    sheet.innerHTML = InjectedStyleInstance.getStyles()
    document.head.appendChild(sheet)

    return injectedStyles
}

export const renderCss = (styleElement) => {
    if (!styleElement) {
      return Style.getStyles()
    }

    styleElement.innerHTML = Style.getStyles()
};
