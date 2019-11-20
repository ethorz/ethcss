import * as freeStyle from 'free-style'

const Style = freeStyle.create()
let options = {}

const clearUtilityStyles = (stylesObject) => {
    delete stylesObject.toString
    delete stylesObject.__isICSS
}

export const cn = function() {
    const classNames = []
    const mainArguments = Array.prototype.slice.call(arguments)

    mainArguments.forEach((className) => {
        if (typeof className === 'string') {
            classNames.push(className)
        }

        if (typeof className === 'object') {
            if (!className.__isICSS) {
              for (let key in className) {
                  if (className.hasOwnProperty(key) && className[key]) {
                      classNames.push(key)
                  }
              }
              return
            }

            classNames.push(className.toString())
        }
    })

    return classNames.join(' ')
}

export const init = (initOptions = {}) => {
    options = initOptions
}

export const addStyles = (innerStyles, styleInstance) => {
    const styles = innerStyles
    let key

    if (!styleInstance) {
      styleInstance = Style
    }

    const mapStyle = (key, style) => {
        clearUtilityStyles(style)

        const name = styleInstance.registerStyle(style, key);

        styles[key].__isICSS = true
        styles[key].toString = () => name
    }

    const mapItem = (key) => {
        let style = styles[key]

        if (typeof style === 'function') {
            style = style.bind(styles)
            style = style()
        }

        styles[key] = {
          ...style
        }

        const additionalStyles = [
          {
            key: '_global',
            register() {
              for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    clearUtilityStyles(style[subKey])
                }
              }
              styleInstance.registerCss(style)
            }
          },
          {
            key: '_rules',
            register() {
              for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    styleInstance.registerRule(subKey, style[subKey])
                }
              }
            },
          },
          {
            key: '_animation',
            register() {
              for (let subKey in style) {
                if (style.hasOwnProperty(subKey)) {
                    clearUtilityStyles(style[subKey])

                    const name = styleInstance.registerKeyframes(style[subKey], subKey)

                    styles[key][subKey].__isICSS = true
                    styles[key][subKey].toString = () => name
                }
              }
            }
          }
        ]

        const registerStyleByKey = additionalStyles.find(adStyleItem => adStyleItem.key.includes(key))

        if (registerStyleByKey) {
            registerStyleByKey.register()
            return
        }

        mapStyle(key, style)

        if (!options.media) {
          return
        }

        for (let media in options.media) {
            if (options.media.hasOwnProperty(media)) {
                const mediaKey = `${key}_${media}`
                const mediaOption = options.media[media]

                styles[mediaKey] = {[mediaOption]: {...style}}
                mapStyle(mediaKey, {[mediaOption]: style})
            }
        }
    }

    const typesNeedMapItem = ['object', 'function']

    for (key in styles) {
        const propertyTypeOf = typeof styles[key]

        if (styles.hasOwnProperty(key) && typesNeedMapItem.includes(propertyTypeOf)) {
            mapItem(key)
        }
    }

    return styles
}

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
}
