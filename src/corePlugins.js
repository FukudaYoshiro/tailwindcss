import fs from 'fs'
import postcss from 'postcss'
import createUtilityPlugin from './util/createUtilityPlugin'
import buildMediaQuery from './util/buildMediaQuery'
import prefixSelector from './util/prefixSelector'
import parseAnimationValue from './util/parseAnimationValue'
import flattenColorPalette from './util/flattenColorPalette'
import withAlphaVariable, { withAlphaValue } from './util/withAlphaVariable'
import toColorValue from './util/toColorValue'
import isPlainObject from './util/isPlainObject'
import transformThemeValue from './util/transformThemeValue'
import nameClass from './util/nameClass'
import {
  applyPseudoToMarker,
  updateLastClasses,
  updateAllClasses,
  transformAllSelectors,
  transformAllClasses,
  transformLastClasses,
  asList,
  asLength,
  asLookupValue,
} from './util/pluginUtils'
import packageJson from '../package.json'
import log from './util/log'

// Variant plugins
export let pseudoElementVariants = ({ config, addVariant }) => {
  addVariant(
    'first-letter',
    transformAllSelectors((selector) => {
      return updateAllClasses(selector, (className, { withPseudo }) => {
        return withPseudo(`first-letter${config('separator')}${className}`, '::first-letter')
      })
    })
  )

  addVariant(
    'first-line',
    transformAllSelectors((selector) => {
      return updateAllClasses(selector, (className, { withPseudo }) => {
        return withPseudo(`first-line${config('separator')}${className}`, '::first-line')
      })
    })
  )

  addVariant('marker', [
    transformAllSelectors((selector) => {
      let variantSelector = updateAllClasses(selector, (className) => {
        return `marker${config('separator')}${className}`
      })

      return `${variantSelector} *::marker`
    }),
    transformAllSelectors((selector) => {
      return updateAllClasses(selector, (className, { withPseudo }) => {
        return withPseudo(`marker${config('separator')}${className}`, '::marker')
      })
    }),
  ])

  addVariant('selection', [
    transformAllSelectors((selector) => {
      let variantSelector = updateAllClasses(selector, (className) => {
        return `selection${config('separator')}${className}`
      })

      return `${variantSelector} *::selection`
    }),
    transformAllSelectors((selector) => {
      return updateAllClasses(selector, (className, { withPseudo }) => {
        return withPseudo(`selection${config('separator')}${className}`, '::selection')
      })
    }),
  ])

  addVariant(
    'before',
    transformAllSelectors(
      (selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`before${config('separator')}${className}`, '::before')
        })
      },
      {
        withRule: (rule) => {
          let foundContent = false
          rule.walkDecls('content', () => {
            foundContent = true
          })
          if (!foundContent) {
            rule.prepend(postcss.decl({ prop: 'content', value: '""' }))
          }
        },
      }
    )
  )

  addVariant(
    'after',
    transformAllSelectors(
      (selector) => {
        return updateAllClasses(selector, (className, { withPseudo }) => {
          return withPseudo(`after${config('separator')}${className}`, '::after')
        })
      },
      {
        withRule: (rule) => {
          let foundContent = false
          rule.walkDecls('content', () => {
            foundContent = true
          })
          if (!foundContent) {
            rule.prepend(postcss.decl({ prop: 'content', value: '""' }))
          }
        },
      }
    )
  )
}

export let pseudoClassVariants = ({ config, addVariant }) => {
  let pseudoVariants = [
    // Positional
    ['first', 'first-child'],
    ['last', 'last-child'],
    ['only', 'only-child'],
    ['odd', 'nth-child(odd)'],
    ['even', 'nth-child(even)'],
    'first-of-type',
    'last-of-type',
    'only-of-type',

    // State
    'visited',
    'target',

    // Forms
    'default',
    'checked',
    'indeterminate',
    'placeholder-shown',
    'autofill',
    'required',
    'valid',
    'invalid',
    'in-range',
    'out-of-range',
    'read-only',

    // Content
    'empty',

    // Interactive
    'focus-within',
    'hover',
    'focus',
    'focus-visible',
    'active',
    'disabled',
  ]

  for (let variant of pseudoVariants) {
    let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]

    addVariant(
      variantName,
      transformAllClasses((className, { withPseudo }) => {
        return withPseudo(`${variantName}${config('separator')}${className}`, `:${state}`)
      })
    )
  }

  let groupMarker = prefixSelector(config('prefix'), '.group')
  for (let variant of pseudoVariants) {
    let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
    let groupVariantName = `group-${variantName}`

    addVariant(
      groupVariantName,
      transformAllSelectors((selector) => {
        let variantSelector = updateAllClasses(selector, (className) => {
          if (`.${className}` === groupMarker) return className
          return `${groupVariantName}${config('separator')}${className}`
        })

        if (variantSelector === selector) {
          return null
        }

        return applyPseudoToMarker(
          variantSelector,
          groupMarker,
          state,
          (marker, selector) => `${marker} ${selector}`
        )
      })
    )
  }

  let peerMarker = prefixSelector(config('prefix'), '.peer')
  for (let variant of pseudoVariants) {
    let [variantName, state] = Array.isArray(variant) ? variant : [variant, variant]
    let peerVariantName = `peer-${variantName}`

    addVariant(
      peerVariantName,
      transformAllSelectors((selector) => {
        let variantSelector = updateAllClasses(selector, (className) => {
          if (`.${className}` === peerMarker) return className
          return `${peerVariantName}${config('separator')}${className}`
        })

        if (variantSelector === selector) {
          return null
        }

        return applyPseudoToMarker(variantSelector, peerMarker, state, (marker, selector) =>
          selector.trim().startsWith('~') ? `${marker}${selector}` : `${marker} ~ ${selector}`
        )
      })
    )
  }
}

export let directionVariants = ({ config, addVariant }) => {
  addVariant(
    'ltr',
    transformAllSelectors(
      (selector) =>
        `[dir="ltr"] ${updateAllClasses(
          selector,
          (className) => `ltr${config('separator')}${className}`
        )}`
    )
  )

  addVariant(
    'rtl',
    transformAllSelectors(
      (selector) =>
        `[dir="rtl"] ${updateAllClasses(
          selector,
          (className) => `rtl${config('separator')}${className}`
        )}`
    )
  )
}

export let reducedMotionVariants = ({ config, addVariant }) => {
  addVariant(
    'motion-safe',
    transformLastClasses(
      (className) => {
        return `motion-safe${config('separator')}${className}`
      },
      {
        wrap: () =>
          postcss.atRule({
            name: 'media',
            params: '(prefers-reduced-motion: no-preference)',
          }),
      }
    )
  )

  addVariant(
    'motion-reduce',
    transformLastClasses(
      (className) => {
        return `motion-reduce${config('separator')}${className}`
      },
      {
        wrap: () =>
          postcss.atRule({
            name: 'media',
            params: '(prefers-reduced-motion: reduce)',
          }),
      }
    )
  )
}

export let darkVariants = ({ config, addVariant }) => {
  let mode = config('darkMode', 'media')
  if (mode === false) {
    mode = 'media'
    log.warn([
      '`darkMode` is set to `false` in your config.',
      'This will behave just like the `media` value.',
    ])
  }

  if (mode === 'class') {
    addVariant(
      'dark',
      transformAllSelectors((selector) => {
        let variantSelector = updateLastClasses(selector, (className) => {
          return `dark${config('separator')}${className}`
        })

        if (variantSelector === selector) {
          return null
        }

        let darkSelector = prefixSelector(config('prefix'), `.dark`)

        return `${darkSelector} ${variantSelector}`
      })
    )
  } else if (mode === 'media') {
    addVariant(
      'dark',
      transformLastClasses(
        (className) => {
          return `dark${config('separator')}${className}`
        },
        {
          wrap: () =>
            postcss.atRule({
              name: 'media',
              params: '(prefers-color-scheme: dark)',
            }),
        }
      )
    )
  }
}

export let screenVariants = ({ config, theme, addVariant }) => {
  for (let screen in theme('screens')) {
    let size = theme('screens')[screen]
    let query = buildMediaQuery(size)

    addVariant(
      screen,
      transformLastClasses(
        (className) => {
          return `${screen}${config('separator')}${className}`
        },
        { wrap: () => postcss.atRule({ name: 'media', params: query }) }
      )
    )
  }
}

// Actual plugins
export let preflight = ({ addBase }) => {
  let preflightStyles = postcss.parse(fs.readFileSync(`${__dirname}/css/preflight.css`, 'utf8'))

  addBase([
    postcss.comment({
      text: `! tailwindcss v${packageJson.version} | MIT License | https://tailwindcss.com`,
    }),
    ...preflightStyles.nodes,
  ])
}

export let container = (() => {
  function extractMinWidths(breakpoints) {
    return Object.values(breakpoints ?? {}).flatMap((breakpoints) => {
      if (typeof breakpoints === 'string') {
        breakpoints = { min: breakpoints }
      }

      if (!Array.isArray(breakpoints)) {
        breakpoints = [breakpoints]
      }

      return breakpoints
        .filter((breakpoint) => {
          return breakpoint?.hasOwnProperty?.('min') || breakpoint?.hasOwnProperty('min-width')
        })
        .map((breakpoint) => {
          return breakpoint['min-width'] ?? breakpoint.min
        })
    })
  }

  function mapMinWidthsToPadding(minWidths, screens, paddings) {
    if (typeof paddings === 'undefined') {
      return []
    }

    if (!(typeof paddings === 'object' && paddings !== null)) {
      return [
        {
          screen: 'DEFAULT',
          minWidth: 0,
          padding: paddings,
        },
      ]
    }

    let mapping = []

    if (paddings.DEFAULT) {
      mapping.push({
        screen: 'DEFAULT',
        minWidth: 0,
        padding: paddings.DEFAULT,
      })
    }

    for (let minWidth of minWidths) {
      for (let [screen, value] of Object.entries(screens)) {
        let screenMinWidth =
          typeof value === 'object' && value !== null ? value.min || value['min-width'] : value

        if (`${screenMinWidth}` === `${minWidth}`) {
          mapping.push({
            screen,
            minWidth,
            padding: paddings[screen],
          })
        }
      }
    }

    return mapping
  }

  return function ({ addComponents, theme }) {
    let screens = theme('container.screens', theme('screens'))
    let minWidths = extractMinWidths(screens)
    let paddings = mapMinWidthsToPadding(minWidths, screens, theme('container.padding'))

    let generatePaddingFor = (minWidth) => {
      let paddingConfig = paddings.find((padding) => `${padding.minWidth}` === `${minWidth}`)

      if (!paddingConfig) {
        return {}
      }

      return {
        paddingRight: paddingConfig.padding,
        paddingLeft: paddingConfig.padding,
      }
    }

    let atRules = Array.from(
      new Set(minWidths.slice().sort((a, z) => parseInt(a) - parseInt(z)))
    ).map((minWidth) => ({
      [`@media (min-width: ${minWidth})`]: {
        '.container': {
          'max-width': minWidth,
          ...generatePaddingFor(minWidth),
        },
      },
    }))

    addComponents([
      {
        '.container': Object.assign(
          { width: '100%' },
          theme('container.center', false) ? { marginRight: 'auto', marginLeft: 'auto' } : {},
          generatePaddingFor(0)
        ),
      },
      ...atRules,
    ])
  }
})()

export let accessibility = ({ addUtilities }) => {
  addUtilities({
    '.sr-only': {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    },
    '.not-sr-only': {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
    },
  })
}

export let pointerEvents = ({ addUtilities }) => {
  addUtilities({
    '.pointer-events-none': { 'pointer-events': 'none' },
    '.pointer-events-auto': { 'pointer-events': 'auto' },
  })
}

export let visibility = ({ addUtilities }) => {
  addUtilities({
    '.visible': { visibility: 'visible' },
    '.invisible': { visibility: 'hidden' },
  })
}

export let position = ({ addUtilities }) => {
  addUtilities({
    '.static': { position: 'static' },
    '.fixed': { position: 'fixed' },
    '.absolute': { position: 'absolute' },
    '.relative': { position: 'relative' },
    '.sticky': { position: 'sticky' },
  })
}

export let inset = ({ matchUtilities, theme }) => {
  let options = {
    values: theme('inset'),
    type: 'any',
  }

  matchUtilities(
    { inset: (value) => ({ top: value, right: value, bottom: value, left: value }) },
    options
  )

  matchUtilities(
    {
      'inset-x': (value) => ({ left: value, right: value }),
      'inset-y': (value) => ({ top: value, bottom: value }),
    },
    options
  )

  matchUtilities(
    {
      top: (top) => ({ top }),
      right: (right) => ({ right }),
      bottom: (bottom) => ({ bottom }),
      left: (left) => ({ left }),
    },
    options
  )
}

export let isolation = ({ addUtilities }) => {
  addUtilities({
    '.isolate': { isolation: 'isolate' },
    '.isolation-auto': { isolation: 'auto' },
  })
}

export let zIndex = createUtilityPlugin('zIndex', [['z', ['zIndex']]])
export let order = createUtilityPlugin('order')
export let gridColumn = createUtilityPlugin('gridColumn', [['col', ['gridColumn']]])
export let gridColumnStart = createUtilityPlugin('gridColumnStart', [
  ['col-start', ['gridColumnStart']],
])
export let gridColumnEnd = createUtilityPlugin('gridColumnEnd', [['col-end', ['gridColumnEnd']]])
export let gridRow = createUtilityPlugin('gridRow', [['row', ['gridRow']]])
export let gridRowStart = createUtilityPlugin('gridRowStart', [['row-start', ['gridRowStart']]])
export let gridRowEnd = createUtilityPlugin('gridRowEnd', [['row-end', ['gridRowEnd']]])

export let float = ({ addUtilities }) => {
  addUtilities({
    '.float-right': { float: 'right' },
    '.float-left': { float: 'left' },
    '.float-none': { float: 'none' },
  })
}

export let clear = ({ addUtilities }) => {
  addUtilities({
    '.clear-left': { clear: 'left' },
    '.clear-right': { clear: 'right' },
    '.clear-both': { clear: 'both' },
    '.clear-none': { clear: 'none' },
  })
}

export let margin = createUtilityPlugin('margin', [
  ['m', ['margin']],
  [
    ['mx', ['margin-left', 'margin-right']],
    ['my', ['margin-top', 'margin-bottom']],
  ],
  [
    ['mt', ['margin-top']],
    ['mr', ['margin-right']],
    ['mb', ['margin-bottom']],
    ['ml', ['margin-left']],
  ],
])

export let boxSizing = ({ addUtilities }) => {
  addUtilities({
    '.box-border': { 'box-sizing': 'border-box' },
    '.box-content': { 'box-sizing': 'content-box' },
  })
}

export let display = ({ addUtilities }) => {
  addUtilities({
    '.block': { display: 'block' },
    '.inline-block': { display: 'inline-block' },
    '.inline': { display: 'inline' },
    '.flex': { display: 'flex' },
    '.inline-flex': { display: 'inline-flex' },
    '.table': { display: 'table' },
    '.inline-table': { display: 'inline-table' },
    '.table-caption': { display: 'table-caption' },
    '.table-cell': { display: 'table-cell' },
    '.table-column': { display: 'table-column' },
    '.table-column-group': { display: 'table-column-group' },
    '.table-footer-group': { display: 'table-footer-group' },
    '.table-header-group': { display: 'table-header-group' },
    '.table-row-group': { display: 'table-row-group' },
    '.table-row': { display: 'table-row' },
    '.flow-root': { display: 'flow-root' },
    '.grid': { display: 'grid' },
    '.inline-grid': { display: 'inline-grid' },
    '.contents': { display: 'contents' },
    '.list-item': { display: 'list-item' },
    '.hidden': { display: 'none' },
  })
}

export let aspectRatio = createUtilityPlugin('aspectRatio', [['aspect', ['aspect-ratio']]])
export let height = createUtilityPlugin('height', [['h', ['height']]])
export let maxHeight = createUtilityPlugin('maxHeight', [['max-h', ['maxHeight']]])
export let minHeight = createUtilityPlugin('minHeight', [['min-h', ['minHeight']]])
export let width = createUtilityPlugin('width', [['w', ['width']]])
export let minWidth = createUtilityPlugin('minWidth', [['min-w', ['minWidth']]])
export let maxWidth = createUtilityPlugin('maxWidth', [['max-w', ['maxWidth']]])
export let flex = createUtilityPlugin('flex')
export let flexShrink = createUtilityPlugin('flexShrink', [['flex-shrink', ['flex-shrink']]])
export let flexGrow = createUtilityPlugin('flexGrow', [['flex-grow', ['flex-grow']]])

export let tableLayout = ({ addUtilities }) => {
  addUtilities({
    '.table-auto': { 'table-layout': 'auto' },
    '.table-fixed': { 'table-layout': 'fixed' },
  })
}

export let borderCollapse = ({ addUtilities }) => {
  addUtilities({
    '.border-collapse': { 'border-collapse': 'collapse' },
    '.border-separate': { 'border-collapse': 'separate' },
  })
}

export let transformOrigin = createUtilityPlugin('transformOrigin', [
  ['origin', ['transformOrigin']],
])
export let translate = createUtilityPlugin('translate', [
  [
    [
      'translate-x',
      [['@defaults transform', {}], '--tw-translate-x', ['transform', 'var(--tw-transform)']],
    ],
    [
      'translate-y',
      [['@defaults transform', {}], '--tw-translate-y', ['transform', 'var(--tw-transform)']],
    ],
  ],
])
export let rotate = createUtilityPlugin('rotate', [
  ['rotate', [['@defaults transform', {}], '--tw-rotate', ['transform', 'var(--tw-transform)']]],
])
export let skew = createUtilityPlugin('skew', [
  [
    ['skew-x', [['@defaults transform', {}], '--tw-skew-x', ['transform', 'var(--tw-transform)']]],
    ['skew-y', [['@defaults transform', {}], '--tw-skew-y', ['transform', 'var(--tw-transform)']]],
  ],
])
export let scale = createUtilityPlugin('scale', [
  [
    'scale',
    [
      ['@defaults transform', {}],
      '--tw-scale-x',
      '--tw-scale-y',
      ['transform', 'var(--tw-transform)'],
    ],
  ],
  [
    [
      'scale-x',
      [['@defaults transform', {}], '--tw-scale-x', ['transform', 'var(--tw-transform)']],
    ],
    [
      'scale-y',
      [['@defaults transform', {}], '--tw-scale-y', ['transform', 'var(--tw-transform)']],
    ],
  ],
])

export let transform = ({ addBase, addUtilities }) => {
  addBase({
    '@defaults transform': {
      '--tw-translate-x': '0',
      '--tw-translate-y': '0',
      '--tw-rotate': '0',
      '--tw-skew-x': '0',
      '--tw-skew-y': '0',
      '--tw-scale-x': '1',
      '--tw-scale-y': '1',
      '--tw-transform': [
        'translateX(var(--tw-translate-x))',
        'translateY(var(--tw-translate-y))',
        'rotate(var(--tw-rotate))',
        'skewX(var(--tw-skew-x))',
        'skewY(var(--tw-skew-y))',
        'scaleX(var(--tw-scale-x))',
        'scaleY(var(--tw-scale-y))',
      ].join(' '),
    },
  })
  addUtilities({
    '.transform': { '@defaults transform': {}, transform: 'var(--tw-transform)' },
    '.transform-cpu': {
      '--tw-transform': [
        'translateX(var(--tw-translate-x))',
        'translateY(var(--tw-translate-y))',
        'rotate(var(--tw-rotate))',
        'skewX(var(--tw-skew-x))',
        'skewY(var(--tw-skew-y))',
        'scaleX(var(--tw-scale-x))',
        'scaleY(var(--tw-scale-y))',
      ].join(' '),
    },
    '.transform-gpu': {
      '--tw-transform': [
        'translate3d(var(--tw-translate-x), var(--tw-translate-y), 0)',
        'rotate(var(--tw-rotate))',
        'skewX(var(--tw-skew-x))',
        'skewY(var(--tw-skew-y))',
        'scaleX(var(--tw-scale-x))',
        'scaleY(var(--tw-scale-y))',
      ].join(' '),
    },
    '.transform-none': { transform: 'none' },
  })
}

export let animation = ({ matchUtilities, theme, prefix }) => {
  let prefixName = (name) => prefix(`.${name}`).slice(1)
  let keyframes = Object.fromEntries(
    Object.entries(theme('keyframes') ?? {}).map(([key, value]) => {
      return [key, [{ [`@keyframes ${prefixName(key)}`]: value }]]
    })
  )

  matchUtilities(
    {
      animate: (value, { includeRules }) => {
        let animations = parseAnimationValue(value)

        for (let { name } of animations) {
          if (keyframes[name] !== undefined) {
            includeRules(keyframes[name], { respectImportant: false })
          }
        }

        return {
          animation: animations
            .map(({ name, value }) => {
              if (name === undefined || keyframes[name] === undefined) {
                return value
              }
              return value.replace(name, prefixName(name))
            })
            .join(', '),
        }
      },
    },
    { values: theme('animation') }
  )
}

export let cursor = createUtilityPlugin('cursor')

export let userSelect = ({ addUtilities }) => {
  addUtilities({
    '.select-none': { 'user-select': 'none' },
    '.select-text': { 'user-select': 'text' },
    '.select-all': { 'user-select': 'all' },
    '.select-auto': { 'user-select': 'auto' },
  })
}

export let resize = ({ addUtilities }) => {
  addUtilities({
    '.resize-none': { resize: 'none' },
    '.resize-y': { resize: 'vertical' },
    '.resize-x': { resize: 'horizontal' },
    '.resize': { resize: 'both' },
  })
}

export let listStylePosition = ({ addUtilities }) => {
  addUtilities({
    '.list-inside': { 'list-style-position': 'inside' },
    '.list-outside': { 'list-style-position': 'outside' },
  })
}

export let listStyleType = createUtilityPlugin('listStyleType', [['list', ['listStyleType']]])

export let appearance = ({ addUtilities }) => {
  addUtilities({
    '.appearance-none': { appearance: 'none' },
  })
}

export let columns = createUtilityPlugin('columns', [['columns', ['columns']]])

export let gridAutoColumns = createUtilityPlugin('gridAutoColumns', [
  ['auto-cols', ['gridAutoColumns']],
])

export let gridAutoFlow = ({ addUtilities }) => {
  addUtilities({
    '.grid-flow-row': { gridAutoFlow: 'row' },
    '.grid-flow-col': { gridAutoFlow: 'column' },
    '.grid-flow-row-dense': { gridAutoFlow: 'row dense' },
    '.grid-flow-col-dense': { gridAutoFlow: 'column dense' },
  })
}

export let gridAutoRows = createUtilityPlugin('gridAutoRows', [['auto-rows', ['gridAutoRows']]])
export let gridTemplateColumns = createUtilityPlugin(
  'gridTemplateColumns',
  [['grid-cols', ['gridTemplateColumns']]],
  { resolveArbitraryValue: asList }
)
export let gridTemplateRows = createUtilityPlugin(
  'gridTemplateRows',
  [['grid-rows', ['gridTemplateRows']]],
  { resolveArbitraryValue: asList }
)

export let flexDirection = ({ addUtilities }) => {
  addUtilities({
    '.flex-row': { 'flex-direction': 'row' },
    '.flex-row-reverse': { 'flex-direction': 'row-reverse' },
    '.flex-col': { 'flex-direction': 'column' },
    '.flex-col-reverse': { 'flex-direction': 'column-reverse' },
  })
}

export let flexWrap = ({ addUtilities }) => {
  addUtilities({
    '.flex-wrap': { 'flex-wrap': 'wrap' },
    '.flex-wrap-reverse': { 'flex-wrap': 'wrap-reverse' },
    '.flex-nowrap': { 'flex-wrap': 'nowrap' },
  })
}

export let placeContent = ({ addUtilities }) => {
  addUtilities({
    '.place-content-center': { 'place-content': 'center' },
    '.place-content-start': { 'place-content': 'start' },
    '.place-content-end': { 'place-content': 'end' },
    '.place-content-between': { 'place-content': 'space-between' },
    '.place-content-around': { 'place-content': 'space-around' },
    '.place-content-evenly': { 'place-content': 'space-evenly' },
    '.place-content-stretch': { 'place-content': 'stretch' },
  })
}

export let placeItems = ({ addUtilities }) => {
  addUtilities({
    '.place-items-start': { 'place-items': 'start' },
    '.place-items-end': { 'place-items': 'end' },
    '.place-items-center': { 'place-items': 'center' },
    '.place-items-stretch': { 'place-items': 'stretch' },
  })
}

export let alignContent = ({ addUtilities }) => {
  addUtilities({
    '.content-center': { 'align-content': 'center' },
    '.content-start': { 'align-content': 'flex-start' },
    '.content-end': { 'align-content': 'flex-end' },
    '.content-between': { 'align-content': 'space-between' },
    '.content-around': { 'align-content': 'space-around' },
    '.content-evenly': { 'align-content': 'space-evenly' },
  })
}

export let alignItems = ({ addUtilities }) => {
  addUtilities({
    '.items-start': { 'align-items': 'flex-start' },
    '.items-end': { 'align-items': 'flex-end' },
    '.items-center': { 'align-items': 'center' },
    '.items-baseline': { 'align-items': 'baseline' },
    '.items-stretch': { 'align-items': 'stretch' },
  })
}

export let justifyContent = ({ addUtilities }) => {
  addUtilities({
    '.justify-start': { 'justify-content': 'flex-start' },
    '.justify-end': { 'justify-content': 'flex-end' },
    '.justify-center': { 'justify-content': 'center' },
    '.justify-between': { 'justify-content': 'space-between' },
    '.justify-around': { 'justify-content': 'space-around' },
    '.justify-evenly': { 'justify-content': 'space-evenly' },
  })
}

export let justifyItems = ({ addUtilities }) => {
  addUtilities({
    '.justify-items-start': { 'justify-items': 'start' },
    '.justify-items-end': { 'justify-items': 'end' },
    '.justify-items-center': { 'justify-items': 'center' },
    '.justify-items-stretch': { 'justify-items': 'stretch' },
  })
}

export let gap = createUtilityPlugin('gap', [
  ['gap', ['gap']],
  [
    ['gap-x', ['columnGap']],
    ['gap-y', ['rowGap']],
  ],
])

export let space = ({ matchUtilities, addUtilities, theme }) => {
  matchUtilities(
    {
      'space-x': (value) => {
        value = value === '0' ? '0px' : value

        return {
          '& > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-x-reverse': '0',
            'margin-right': `calc(${value} * var(--tw-space-x-reverse))`,
            'margin-left': `calc(${value} * calc(1 - var(--tw-space-x-reverse)))`,
          },
        }
      },
      'space-y': (value) => {
        value = value === '0' ? '0px' : value

        return {
          '& > :not([hidden]) ~ :not([hidden])': {
            '--tw-space-y-reverse': '0',
            'margin-top': `calc(${value} * calc(1 - var(--tw-space-y-reverse)))`,
            'margin-bottom': `calc(${value} * var(--tw-space-y-reverse))`,
          },
        }
      },
    },
    { values: theme('space'), type: 'any' }
  )

  addUtilities({
    '.space-y-reverse > :not([hidden]) ~ :not([hidden])': { '--tw-space-y-reverse': '1' },
    '.space-x-reverse > :not([hidden]) ~ :not([hidden])': { '--tw-space-x-reverse': '1' },
  })
}

export let divideWidth = ({ matchUtilities, addUtilities, theme }) => {
  matchUtilities(
    {
      'divide-x': (value) => {
        value = value === '0' ? '0px' : value

        return {
          '& > :not([hidden]) ~ :not([hidden])': {
            '@defaults border-width': {},
            '--tw-divide-x-reverse': '0',
            'border-right-width': `calc(${value} * var(--tw-divide-x-reverse))`,
            'border-left-width': `calc(${value} * calc(1 - var(--tw-divide-x-reverse)))`,
          },
        }
      },
      'divide-y': (value) => {
        value = value === '0' ? '0px' : value

        return {
          '& > :not([hidden]) ~ :not([hidden])': {
            '@defaults border-width': {},
            '--tw-divide-y-reverse': '0',
            'border-top-width': `calc(${value} * calc(1 - var(--tw-divide-y-reverse)))`,
            'border-bottom-width': `calc(${value} * var(--tw-divide-y-reverse))`,
          },
        }
      },
    },
    { values: theme('divideWidth'), type: 'length' }
  )

  addUtilities({
    '.divide-y-reverse > :not([hidden]) ~ :not([hidden])': {
      '@defaults border-width': {},
      '--tw-divide-y-reverse': '1',
    },
    '.divide-x-reverse > :not([hidden]) ~ :not([hidden])': {
      '@defaults border-width': {},
      '--tw-divide-x-reverse': '1',
    },
  })
}

export let divideStyle = ({ addUtilities }) => {
  addUtilities({
    '.divide-solid > :not([hidden]) ~ :not([hidden])': { 'border-style': 'solid' },
    '.divide-dashed > :not([hidden]) ~ :not([hidden])': { 'border-style': 'dashed' },
    '.divide-dotted > :not([hidden]) ~ :not([hidden])': { 'border-style': 'dotted' },
    '.divide-double > :not([hidden]) ~ :not([hidden])': { 'border-style': 'double' },
    '.divide-none > :not([hidden]) ~ :not([hidden])': { 'border-style': 'none' },
  })
}

export let divideColor = ({ matchUtilities, theme, corePlugins }) => {
  matchUtilities(
    {
      divide: (value) => {
        if (!corePlugins('divideOpacity')) {
          return { ['& > :not([hidden]) ~ :not([hidden])']: { 'border-color': value } }
        }

        return {
          ['& > :not([hidden]) ~ :not([hidden])']: withAlphaVariable({
            color: value,
            property: 'border-color',
            variable: '--tw-divide-opacity',
          }),
        }
      },
    },
    {
      values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette(theme('divideColor'))),
      type: 'color',
    }
  )
}

export let divideOpacity = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'divide-opacity': (value) => {
        return { [`& > :not([hidden]) ~ :not([hidden])`]: { '--tw-divide-opacity': value } }
      },
    },
    { values: theme('divideOpacity'), type: 'any' }
  )
}

export let placeSelf = ({ addUtilities }) => {
  addUtilities({
    '.place-self-auto': { 'place-self': 'auto' },
    '.place-self-start': { 'place-self': 'start' },
    '.place-self-end': { 'place-self': 'end' },
    '.place-self-center': { 'place-self': 'center' },
    '.place-self-stretch': { 'place-self': 'stretch' },
  })
}

export let alignSelf = ({ addUtilities }) => {
  addUtilities({
    '.self-auto': { 'align-self': 'auto' },
    '.self-start': { 'align-self': 'flex-start' },
    '.self-end': { 'align-self': 'flex-end' },
    '.self-center': { 'align-self': 'center' },
    '.self-stretch': { 'align-self': 'stretch' },
    '.self-baseline': { 'align-self': 'baseline' },
  })
}

export let justifySelf = ({ addUtilities }) => {
  addUtilities({
    '.justify-self-auto': { 'justify-self': 'auto' },
    '.justify-self-start': { 'justify-self': 'start' },
    '.justify-self-end': { 'justify-self': 'end' },
    '.justify-self-center': { 'justify-self': 'center' },
    '.justify-self-stretch': { 'justify-self': 'stretch' },
  })
}

export let overflow = ({ addUtilities }) => {
  addUtilities({
    '.overflow-auto': { overflow: 'auto' },
    '.overflow-hidden': { overflow: 'hidden' },
    '.overflow-visible': { overflow: 'visible' },
    '.overflow-scroll': { overflow: 'scroll' },
    '.overflow-x-auto': { 'overflow-x': 'auto' },
    '.overflow-y-auto': { 'overflow-y': 'auto' },
    '.overflow-x-hidden': { 'overflow-x': 'hidden' },
    '.overflow-y-hidden': { 'overflow-y': 'hidden' },
    '.overflow-x-visible': { 'overflow-x': 'visible' },
    '.overflow-y-visible': { 'overflow-y': 'visible' },
    '.overflow-x-scroll': { 'overflow-x': 'scroll' },
    '.overflow-y-scroll': { 'overflow-y': 'scroll' },
  })
}

export let overscrollBehavior = ({ addUtilities }) => {
  addUtilities({
    '.overscroll-auto': { 'overscroll-behavior': 'auto' },
    '.overscroll-contain': { 'overscroll-behavior': 'contain' },
    '.overscroll-none': { 'overscroll-behavior': 'none' },
    '.overscroll-y-auto': { 'overscroll-behavior-y': 'auto' },
    '.overscroll-y-contain': { 'overscroll-behavior-y': 'contain' },
    '.overscroll-y-none': { 'overscroll-behavior-y': 'none' },
    '.overscroll-x-auto': { 'overscroll-behavior-x': 'auto' },
    '.overscroll-x-contain': { 'overscroll-behavior-x': 'contain' },
    '.overscroll-x-none': { 'overscroll-behavior-x': 'none' },
  })
}

export let textOverflow = ({ addUtilities }) => {
  addUtilities({
    '.truncate': { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' },
    '.overflow-ellipsis': { 'text-overflow': 'ellipsis' },
    '.overflow-clip': { 'text-overflow': 'clip' },
  })
}

export let whitespace = ({ addUtilities }) => {
  addUtilities({
    '.whitespace-normal': { 'white-space': 'normal' },
    '.whitespace-nowrap': { 'white-space': 'nowrap' },
    '.whitespace-pre': { 'white-space': 'pre' },
    '.whitespace-pre-line': { 'white-space': 'pre-line' },
    '.whitespace-pre-wrap': { 'white-space': 'pre-wrap' },
  })
}

export let wordBreak = ({ addUtilities }) => {
  addUtilities({
    '.break-normal': { 'overflow-wrap': 'normal', 'word-break': 'normal' },
    '.break-words': { 'overflow-wrap': 'break-word' },
    '.break-all': { 'word-break': 'break-all' },
  })
}

export let borderRadius = createUtilityPlugin('borderRadius', [
  ['rounded', ['border-radius']],
  [
    ['rounded-t', ['border-top-left-radius', 'border-top-right-radius']],
    ['rounded-r', ['border-top-right-radius', 'border-bottom-right-radius']],
    ['rounded-b', ['border-bottom-right-radius', 'border-bottom-left-radius']],
    ['rounded-l', ['border-top-left-radius', 'border-bottom-left-radius']],
  ],
  [
    ['rounded-tl', ['border-top-left-radius']],
    ['rounded-tr', ['border-top-right-radius']],
    ['rounded-br', ['border-bottom-right-radius']],
    ['rounded-bl', ['border-bottom-left-radius']],
  ],
])

export let borderWidth = createUtilityPlugin(
  'borderWidth',
  [
    ['border', [['@defaults border-width', {}], 'border-width']],
    [
      ['border-t', [['@defaults border-width', {}], 'border-top-width']],
      ['border-r', [['@defaults border-width', {}], 'border-right-width']],
      ['border-b', [['@defaults border-width', {}], 'border-bottom-width']],
      ['border-l', [['@defaults border-width', {}], 'border-left-width']],
    ],
  ],
  { resolveArbitraryValue: asLength }
)

export let borderStyle = ({ addUtilities }) => {
  addUtilities({
    '.border-solid': { 'border-style': 'solid' },
    '.border-dashed': { 'border-style': 'dashed' },
    '.border-dotted': { 'border-style': 'dotted' },
    '.border-double': { 'border-style': 'double' },
    '.border-none': { 'border-style': 'none' },
  })
}

export let borderColor = ({ addBase, matchUtilities, theme, corePlugins }) => {
  if (!corePlugins('borderOpacity')) {
    addBase({
      '@defaults border-width': {
        'border-color': theme('borderColor.DEFAULT', 'currentColor'),
      },
    })
  } else {
    addBase({
      '@defaults border-width': withAlphaVariable({
        color: theme('borderColor.DEFAULT', 'currentColor'),
        property: 'border-color',
        variable: '--tw-border-opacity',
      }),
    })
  }

  matchUtilities(
    {
      border: (value) => {
        if (!corePlugins('borderOpacity')) {
          return { 'border-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'border-color',
          variable: '--tw-border-opacity',
        })
      },
    },
    {
      values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette(theme('borderColor'))),
      type: 'color',
    }
  )

  matchUtilities(
    {
      'border-t': (value) => {
        if (!corePlugins('borderOpacity')) {
          return { 'border-top-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'border-top-color',
          variable: '--tw-border-opacity',
        })
      },
      'border-r': (value) => {
        if (!corePlugins('borderOpacity')) {
          return { 'border-right-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'border-right-color',
          variable: '--tw-border-opacity',
        })
      },
      'border-b': (value) => {
        if (!corePlugins('borderOpacity')) {
          return { 'border-bottom-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'border-bottom-color',
          variable: '--tw-border-opacity',
        })
      },
      'border-l': (value) => {
        if (!corePlugins('borderOpacity')) {
          return { 'border-left-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'border-left-color',
          variable: '--tw-border-opacity',
        })
      },
    },
    {
      values: (({ DEFAULT: _, ...colors }) => colors)(flattenColorPalette(theme('borderColor'))),
      type: 'color',
    }
  )
}

export let borderOpacity = createUtilityPlugin('borderOpacity', [
  ['border-opacity', ['--tw-border-opacity']],
])

export let backgroundColor = ({ matchUtilities, theme, corePlugins }) => {
  matchUtilities(
    {
      bg: (value) => {
        if (!corePlugins('backgroundOpacity')) {
          return { 'background-color': value }
        }

        return withAlphaVariable({
          color: value,
          property: 'background-color',
          variable: '--tw-bg-opacity',
        })
      },
    },
    { values: flattenColorPalette(theme('backgroundColor')), type: 'color' }
  )
}

export let backgroundOpacity = createUtilityPlugin('backgroundOpacity', [
  ['bg-opacity', ['--tw-bg-opacity']],
])
export let backgroundImage = createUtilityPlugin(
  'backgroundImage',
  [['bg', ['background-image']]],
  { resolveArbitraryValue: asLookupValue }
)
export let gradientColorStops = (() => {
  function transparentTo(value) {
    return withAlphaValue(value, 0, 'rgb(255 255 255 / 0)')
  }

  return function ({ matchUtilities, theme }) {
    let options = {
      values: flattenColorPalette(theme('gradientColorStops')),
      type: ['color', 'any'],
    }

    matchUtilities(
      {
        from: (value) => {
          let transparentToValue = transparentTo(value)

          return {
            '--tw-gradient-from': toColorValue(value, 'from'),
            '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, ${transparentToValue})`,
          }
        },
      },
      options
    )
    matchUtilities(
      {
        via: (value) => {
          let transparentToValue = transparentTo(value)

          return {
            '--tw-gradient-stops': `var(--tw-gradient-from), ${toColorValue(
              value,
              'via'
            )}, var(--tw-gradient-to, ${transparentToValue})`,
          }
        },
      },
      options
    )
    matchUtilities({ to: (value) => ({ '--tw-gradient-to': toColorValue(value, 'to') }) }, options)
  }
})()

export let boxDecorationBreak = ({ addUtilities }) => {
  addUtilities({
    '.decoration-slice': { 'box-decoration-break': 'slice' },
    '.decoration-clone': { 'box-decoration-break': 'clone' },
  })
}

export let backgroundSize = createUtilityPlugin('backgroundSize', [['bg', ['background-size']]], {
  resolveArbitraryValue: asLookupValue,
})

export let backgroundAttachment = ({ addUtilities }) => {
  addUtilities({
    '.bg-fixed': { 'background-attachment': 'fixed' },
    '.bg-local': { 'background-attachment': 'local' },
    '.bg-scroll': { 'background-attachment': 'scroll' },
  })
}

export let backgroundClip = ({ addUtilities }) => {
  addUtilities({
    '.bg-clip-border': { 'background-clip': 'border-box' },
    '.bg-clip-padding': { 'background-clip': 'padding-box' },
    '.bg-clip-content': { 'background-clip': 'content-box' },
    '.bg-clip-text': { 'background-clip': 'text' },
  })
}

export let backgroundPosition = createUtilityPlugin(
  'backgroundPosition',
  [['bg', ['background-position']]],
  { resolveArbitraryValue: asLookupValue }
)

export let backgroundRepeat = ({ addUtilities }) => {
  addUtilities({
    '.bg-repeat': { 'background-repeat': 'repeat' },
    '.bg-no-repeat': { 'background-repeat': 'no-repeat' },
    '.bg-repeat-x': { 'background-repeat': 'repeat-x' },
    '.bg-repeat-y': { 'background-repeat': 'repeat-y' },
    '.bg-repeat-round': { 'background-repeat': 'round' },
    '.bg-repeat-space': { 'background-repeat': 'space' },
  })
}

export let backgroundOrigin = ({ addUtilities }) => {
  addUtilities({
    '.bg-origin-border': { 'background-origin': 'border-box' },
    '.bg-origin-padding': { 'background-origin': 'padding-box' },
    '.bg-origin-content': { 'background-origin': 'content-box' },
  })
}

export let fill = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      fill: (value) => {
        return { fill: toColorValue(value) }
      },
    },
    { values: flattenColorPalette(theme('fill')), type: ['color', 'any'] }
  )
}

export let stroke = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      stroke: (value) => {
        return { stroke: toColorValue(value) }
      },
    },
    { values: flattenColorPalette(theme('stroke')), type: 'color' }
  )
}

export let strokeWidth = createUtilityPlugin('strokeWidth', [['stroke', ['stroke-width']]], {
  resolveArbitraryValue: asLength,
})

export let objectFit = ({ addUtilities }) => {
  addUtilities({
    '.object-contain': { 'object-fit': 'contain' },
    '.object-cover': { 'object-fit': 'cover' },
    '.object-fill': { 'object-fit': 'fill' },
    '.object-none': { 'object-fit': 'none' },
    '.object-scale-down': { 'object-fit': 'scale-down' },
  })
}

export let objectPosition = createUtilityPlugin(
  'objectPosition',
  [['object', ['object-position']]],
  { resolveArbitraryValue: asList }
)
export let padding = createUtilityPlugin('padding', [
  ['p', ['padding']],
  [
    ['px', ['padding-left', 'padding-right']],
    ['py', ['padding-top', 'padding-bottom']],
  ],
  [
    ['pt', ['padding-top']],
    ['pr', ['padding-right']],
    ['pb', ['padding-bottom']],
    ['pl', ['padding-left']],
  ],
])

export let textAlign = ({ addUtilities }) => {
  addUtilities({
    '.text-left': { 'text-align': 'left' },
    '.text-center': { 'text-align': 'center' },
    '.text-right': { 'text-align': 'right' },
    '.text-justify': { 'text-align': 'justify' },
  })
}

export let textIndent = createUtilityPlugin('textIndent', [['indent', ['text-indent']]])

export let verticalAlign = ({ addUtilities }) => {
  addUtilities({
    '.align-baseline': { 'vertical-align': 'baseline' },
    '.align-top': { 'vertical-align': 'top' },
    '.align-middle': { 'vertical-align': 'middle' },
    '.align-bottom': { 'vertical-align': 'bottom' },
    '.align-text-top': { 'vertical-align': 'text-top' },
    '.align-text-bottom': { 'vertical-align': 'text-bottom' },
  })
}

export let fontFamily = createUtilityPlugin('fontFamily', [['font', ['fontFamily']]], {
  resolveArbitraryValue: asLookupValue,
})

export let fontSize = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      text: (value) => {
        let [fontSize, options] = Array.isArray(value) ? value : [value]
        let { lineHeight, letterSpacing } = isPlainObject(options)
          ? options
          : { lineHeight: options }

        return {
          'font-size': fontSize,
          ...(lineHeight === undefined ? {} : { 'line-height': lineHeight }),
          ...(letterSpacing === undefined ? {} : { 'letter-spacing': letterSpacing }),
        }
      },
    },
    { values: theme('fontSize'), type: 'length' }
  )
}

export let fontWeight = createUtilityPlugin('fontWeight', [['font', ['fontWeight']]], {
  resolveArbitraryValue: asLookupValue,
})

export let textTransform = ({ addUtilities }) => {
  addUtilities({
    '.uppercase': { 'text-transform': 'uppercase' },
    '.lowercase': { 'text-transform': 'lowercase' },
    '.capitalize': { 'text-transform': 'capitalize' },
    '.normal-case': { 'text-transform': 'none' },
  })
}

export let fontStyle = ({ addUtilities }) => {
  addUtilities({
    '.italic': { 'font-style': 'italic' },
    '.not-italic': { 'font-style': 'normal' },
  })
}

export let fontVariantNumeric = ({ addUtilities }) => {
  addUtilities({
    '.ordinal, .slashed-zero, .lining-nums, .oldstyle-nums, .proportional-nums, .tabular-nums, .diagonal-fractions, .stacked-fractions':
      {
        '--tw-ordinal': 'var(--tw-empty,/*!*/ /*!*/)',
        '--tw-slashed-zero': 'var(--tw-empty,/*!*/ /*!*/)',
        '--tw-numeric-figure': 'var(--tw-empty,/*!*/ /*!*/)',
        '--tw-numeric-spacing': 'var(--tw-empty,/*!*/ /*!*/)',
        '--tw-numeric-fraction': 'var(--tw-empty,/*!*/ /*!*/)',
        'font-variant-numeric':
          'var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)',
      },
    '.normal-nums': { 'font-variant-numeric': 'normal' },
    '.ordinal': { '--tw-ordinal': 'ordinal' },
    '.slashed-zero': { '--tw-slashed-zero': 'slashed-zero' },
    '.lining-nums': { '--tw-numeric-figure': 'lining-nums' },
    '.oldstyle-nums': { '--tw-numeric-figure': 'oldstyle-nums' },
    '.proportional-nums': { '--tw-numeric-spacing': 'proportional-nums' },
    '.tabular-nums': { '--tw-numeric-spacing': 'tabular-nums' },
    '.diagonal-fractions': { '--tw-numeric-fraction': 'diagonal-fractions' },
    '.stacked-fractions': { '--tw-numeric-fraction': 'stacked-fractions' },
  })
}

export let lineHeight = createUtilityPlugin('lineHeight', [['leading', ['lineHeight']]])
export let letterSpacing = createUtilityPlugin('letterSpacing', [['tracking', ['letterSpacing']]])

export let textColor = ({ matchUtilities, theme, corePlugins }) => {
  matchUtilities(
    {
      text: (value) => {
        if (!corePlugins('textOpacity')) {
          return { color: value }
        }

        return withAlphaVariable({
          color: value,
          property: 'color',
          variable: '--tw-text-opacity',
        })
      },
    },
    { values: flattenColorPalette(theme('textColor')), type: 'color' }
  )
}

export let textOpacity = createUtilityPlugin('textOpacity', [
  ['text-opacity', ['--tw-text-opacity']],
])

export let textDecoration = ({ addUtilities }) => {
  addUtilities({
    '.underline': { 'text-decoration': 'underline' },
    '.line-through': { 'text-decoration': 'line-through' },
    '.no-underline': { 'text-decoration': 'none' },
  })
}

export let fontSmoothing = ({ addUtilities }) => {
  addUtilities({
    '.antialiased': {
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
    },
    '.subpixel-antialiased': {
      '-webkit-font-smoothing': 'auto',
      '-moz-osx-font-smoothing': 'auto',
    },
  })
}

export let placeholderColor = ({ matchUtilities, theme, corePlugins }) => {
  matchUtilities(
    {
      placeholder: (value) => {
        if (!corePlugins('placeholderOpacity')) {
          return { '&::placeholder': { color: value } }
        }

        return {
          '&::placeholder': withAlphaVariable({
            color: value,
            property: 'color',
            variable: '--tw-placeholder-opacity',
          }),
        }
      },
    },
    { values: flattenColorPalette(theme('placeholderColor')), type: ['color', 'any'] }
  )
}

export let placeholderOpacity = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'placeholder-opacity': (value) => {
        return { ['&::placeholder']: { '--tw-placeholder-opacity': value } }
      },
    },
    { values: theme('placeholderOpacity'), type: 'any' }
  )
}

export let caretColor = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      caret: (value) => {
        return { 'caret-color': toColorValue(value) }
      },
    },
    { values: flattenColorPalette(theme('caretColor')), type: ['color', 'any'] }
  )
}

export let accentColor = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      accent: (value) => {
        return { 'accent-color': toColorValue(value) }
      },
    },
    { values: flattenColorPalette(theme('accentColor')), type: ['color', 'any'] }
  )
}

export let opacity = createUtilityPlugin('opacity', [['opacity', ['opacity']]])

export let backgroundBlendMode = ({ addUtilities }) => {
  addUtilities({
    '.bg-blend-normal': { 'background-blend-mode': 'normal' },
    '.bg-blend-multiply': { 'background-blend-mode': 'multiply' },
    '.bg-blend-screen': { 'background-blend-mode': 'screen' },
    '.bg-blend-overlay': { 'background-blend-mode': 'overlay' },
    '.bg-blend-darken': { 'background-blend-mode': 'darken' },
    '.bg-blend-lighten': { 'background-blend-mode': 'lighten' },
    '.bg-blend-color-dodge': { 'background-blend-mode': 'color-dodge' },
    '.bg-blend-color-burn': { 'background-blend-mode': 'color-burn' },
    '.bg-blend-hard-light': { 'background-blend-mode': 'hard-light' },
    '.bg-blend-soft-light': { 'background-blend-mode': 'soft-light' },
    '.bg-blend-difference': { 'background-blend-mode': 'difference' },
    '.bg-blend-exclusion': { 'background-blend-mode': 'exclusion' },
    '.bg-blend-hue': { 'background-blend-mode': 'hue' },
    '.bg-blend-saturation': { 'background-blend-mode': 'saturation' },
    '.bg-blend-color': { 'background-blend-mode': 'color' },
    '.bg-blend-luminosity': { 'background-blend-mode': 'luminosity' },
  })
}

export let mixBlendMode = ({ addUtilities }) => {
  addUtilities({
    '.mix-blend-normal': { 'mix-blend-mode': 'normal' },
    '.mix-blend-multiply': { 'mix-blend-mode': 'multiply' },
    '.mix-blend-screen': { 'mix-blend-mode': 'screen' },
    '.mix-blend-overlay': { 'mix-blend-mode': 'overlay' },
    '.mix-blend-darken': { 'mix-blend-mode': 'darken' },
    '.mix-blend-lighten': { 'mix-blend-mode': 'lighten' },
    '.mix-blend-color-dodge': { 'mix-blend-mode': 'color-dodge' },
    '.mix-blend-color-burn': { 'mix-blend-mode': 'color-burn' },
    '.mix-blend-hard-light': { 'mix-blend-mode': 'hard-light' },
    '.mix-blend-soft-light': { 'mix-blend-mode': 'soft-light' },
    '.mix-blend-difference': { 'mix-blend-mode': 'difference' },
    '.mix-blend-exclusion': { 'mix-blend-mode': 'exclusion' },
    '.mix-blend-hue': { 'mix-blend-mode': 'hue' },
    '.mix-blend-saturation': { 'mix-blend-mode': 'saturation' },
    '.mix-blend-color': { 'mix-blend-mode': 'color' },
    '.mix-blend-luminosity': { 'mix-blend-mode': 'luminosity' },
  })
}

export let boxShadow = (() => {
  let transformValue = transformThemeValue('boxShadow')
  let defaultBoxShadow = [
    `var(--tw-ring-offset-shadow, 0 0 #0000)`,
    `var(--tw-ring-shadow, 0 0 #0000)`,
    `var(--tw-shadow)`,
  ].join(', ')

  return function ({ matchUtilities, addBase, theme }) {
    addBase({
      '@defaults box-shadow': {
        '--tw-ring-offset-shadow': '0 0 #0000',
        '--tw-ring-shadow': '0 0 #0000',
        '--tw-shadow': '0 0 #0000',
      },
    })

    matchUtilities(
      {
        shadow: (value) => {
          value = transformValue(value)

          return {
            '@defaults box-shadow': {},
            '--tw-shadow': value === 'none' ? '0 0 #0000' : value,
            'box-shadow': defaultBoxShadow,
          }
        },
      },
      { values: theme('boxShadow'), type: 'lookup' }
    )
  }
})()

export let outline = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      outline: (value) => {
        let [outline, outlineOffset = '0'] = Array.isArray(value) ? value : [value]

        return { outline, 'outline-offset': outlineOffset }
      },
    },
    { values: theme('outline'), type: 'any' }
  )
}

export let ringWidth = ({ matchUtilities, addBase, addUtilities, theme }) => {
  let ringOpacityDefault = theme('ringOpacity.DEFAULT', '0.5')
  let ringColorDefault = withAlphaValue(
    theme('ringColor.DEFAULT'),
    ringOpacityDefault,
    `rgb(147 197 253 / ${ringOpacityDefault})`
  )

  addBase({
    '@defaults ring-width': {
      '--tw-ring-inset': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-ring-offset-width': theme('ringOffsetWidth.DEFAULT', '0px'),
      '--tw-ring-offset-color': theme('ringOffsetColor.DEFAULT', '#fff'),
      '--tw-ring-color': ringColorDefault,
      '--tw-ring-offset-shadow': '0 0 #0000',
      '--tw-ring-shadow': '0 0 #0000',
      '--tw-shadow': '0 0 #0000',
    },
  })

  matchUtilities(
    {
      ring: (value) => {
        return {
          '@defaults ring-width': {},
          '--tw-ring-offset-shadow': `var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)`,
          '--tw-ring-shadow': `var(--tw-ring-inset) 0 0 0 calc(${value} + var(--tw-ring-offset-width)) var(--tw-ring-color)`,
          'box-shadow': [
            `var(--tw-ring-offset-shadow)`,
            `var(--tw-ring-shadow)`,
            `var(--tw-shadow, 0 0 #0000)`,
          ].join(', '),
        }
      },
    },
    { values: theme('ringWidth'), type: 'length' }
  )

  addUtilities({
    '.ring-inset': { '@defaults ring-width': {}, '--tw-ring-inset': 'inset' },
  })
}

export let ringColor = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      ring: (value) => {
        return withAlphaVariable({
          color: value,
          property: '--tw-ring-color',
          variable: '--tw-ring-opacity',
        })
      },
    },
    {
      values: Object.fromEntries(
        Object.entries(flattenColorPalette(theme('ringColor'))).filter(
          ([modifier]) => modifier !== 'DEFAULT'
        )
      ),
      type: 'color',
    }
  )
}

export let ringOpacity = createUtilityPlugin(
  'ringOpacity',
  [['ring-opacity', ['--tw-ring-opacity']]],
  { filterDefault: true }
)
export let ringOffsetWidth = createUtilityPlugin(
  'ringOffsetWidth',
  [['ring-offset', ['--tw-ring-offset-width']]],
  { resolveArbitraryValue: asLength }
)

export let ringOffsetColor = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'ring-offset': (value) => {
        return {
          '--tw-ring-offset-color': toColorValue(value),
        }
      },
    },
    { values: flattenColorPalette(theme('ringOffsetColor')), type: 'color' }
  )
}

export let blur = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      blur: (value) => {
        return {
          '--tw-blur': `blur(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('blur'), type: 'any' }
  )
}

export let brightness = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      brightness: (value) => {
        return {
          '--tw-brightness': `brightness(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('brightness'), type: 'any' }
  )
}

export let contrast = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      contrast: (value) => {
        return {
          '--tw-contrast': `contrast(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('contrast'), type: 'any' }
  )
}

export let dropShadow = ({ addUtilities, theme }) => {
  let utilities = Object.fromEntries(
    Object.entries(theme('dropShadow') ?? {}).map(([modifier, value]) => {
      return [
        nameClass('drop-shadow', modifier),
        {
          '--tw-drop-shadow': Array.isArray(value)
            ? value.map((v) => `drop-shadow(${v})`).join(' ')
            : `drop-shadow(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        },
      ]
    })
  )

  addUtilities(utilities)
}

export let grayscale = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      grayscale: (value) => {
        return {
          '--tw-grayscale': `grayscale(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('grayscale'), type: 'any' }
  )
}

export let hueRotate = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'hue-rotate': (value) => {
        return {
          '--tw-hue-rotate': `hue-rotate(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('hueRotate'), type: 'any' }
  )
}

export let invert = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      invert: (value) => {
        return {
          '--tw-invert': `invert(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('invert'), type: 'any' }
  )
}

export let saturate = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      saturate: (value) => {
        return {
          '--tw-saturate': `saturate(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('saturate'), type: 'any' }
  )
}

export let sepia = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      sepia: (value) => {
        return {
          '--tw-sepia': `sepia(${value})`,
          '@defaults filter': {},
          filter: 'var(--tw-filter)',
        }
      },
    },
    { values: theme('sepia'), type: 'any' }
  )
}

export let filter = ({ addBase, addUtilities }) => {
  addBase({
    '@defaults filter': {
      '--tw-blur': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-brightness': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-contrast': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-grayscale': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-hue-rotate': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-invert': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-saturate': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-sepia': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-drop-shadow': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-filter': [
        'var(--tw-blur)',
        'var(--tw-brightness)',
        'var(--tw-contrast)',
        'var(--tw-grayscale)',
        'var(--tw-hue-rotate)',
        'var(--tw-invert)',
        'var(--tw-saturate)',
        'var(--tw-sepia)',
        'var(--tw-drop-shadow)',
      ].join(' '),
    },
  })
  addUtilities({
    '.filter': { '@defaults filter': {}, filter: 'var(--tw-filter)' },
    '.filter-none': { filter: 'none' },
  })
}

export let backdropBlur = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-blur': (value) => {
        return {
          '--tw-backdrop-blur': `blur(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropBlur'), type: 'any' }
  )
}

export let backdropBrightness = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-brightness': (value) => {
        return {
          '--tw-backdrop-brightness': `brightness(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropBrightness'), type: 'any' }
  )
}

export let backdropContrast = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-contrast': (value) => {
        return {
          '--tw-backdrop-contrast': `contrast(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropContrast'), type: 'any' }
  )
}

export let backdropGrayscale = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-grayscale': (value) => {
        return {
          '--tw-backdrop-grayscale': `grayscale(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropGrayscale'), type: 'any' }
  )
}

export let backdropHueRotate = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-hue-rotate': (value) => {
        return {
          '--tw-backdrop-hue-rotate': `hue-rotate(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropHueRotate'), type: 'any' }
  )
}

export let backdropInvert = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-invert': (value) => {
        return {
          '--tw-backdrop-invert': `invert(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropInvert'), type: 'any' }
  )
}

export let backdropOpacity = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-opacity': (value) => {
        return {
          '--tw-backdrop-opacity': `opacity(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropOpacity'), type: 'any' }
  )
}

export let backdropSaturate = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-saturate': (value) => {
        return {
          '--tw-backdrop-saturate': `saturate(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropSaturate'), type: 'any' }
  )
}

export let backdropSepia = ({ matchUtilities, theme }) => {
  matchUtilities(
    {
      'backdrop-sepia': (value) => {
        return {
          '--tw-backdrop-sepia': `sepia(${value})`,
          '@defaults backdrop-filter': {},
          'backdrop-filter': 'var(--tw-backdrop-filter)',
        }
      },
    },
    { values: theme('backdropSepia'), type: 'any' }
  )
}

export let backdropFilter = ({ addBase, addUtilities }) => {
  addBase({
    '@defaults backdrop-filter': {
      '--tw-backdrop-blur': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-brightness': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-contrast': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-grayscale': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-hue-rotate': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-invert': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-opacity': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-saturate': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-sepia': 'var(--tw-empty,/*!*/ /*!*/)',
      '--tw-backdrop-filter': [
        'var(--tw-backdrop-blur)',
        'var(--tw-backdrop-brightness)',
        'var(--tw-backdrop-contrast)',
        'var(--tw-backdrop-grayscale)',
        'var(--tw-backdrop-hue-rotate)',
        'var(--tw-backdrop-invert)',
        'var(--tw-backdrop-opacity)',
        'var(--tw-backdrop-saturate)',
        'var(--tw-backdrop-sepia)',
      ].join(' '),
    },
  })
  addUtilities({
    '.backdrop-filter': {
      '@defaults backdrop-filter': {},
      'backdrop-filter': 'var(--tw-backdrop-filter)',
    },
    '.backdrop-filter-none': { 'backdrop-filter': 'none' },
  })
}

export let transitionProperty = ({ matchUtilities, theme }) => {
  let defaultTimingFunction = theme('transitionTimingFunction.DEFAULT')
  let defaultDuration = theme('transitionDuration.DEFAULT')

  matchUtilities(
    {
      transition: (value) => {
        return {
          'transition-property': value,
          ...(value === 'none'
            ? {}
            : {
                'transition-timing-function': defaultTimingFunction,
                'transition-duration': defaultDuration,
              }),
        }
      },
    },
    { values: theme('transitionProperty'), type: 'lookup' }
  )
}

export let transitionDelay = createUtilityPlugin('transitionDelay', [
  ['delay', ['transitionDelay']],
])
export let transitionDuration = createUtilityPlugin(
  'transitionDuration',
  [['duration', ['transitionDuration']]],
  { filterDefault: true }
)
export let transitionTimingFunction = createUtilityPlugin(
  'transitionTimingFunction',
  [['ease', ['transitionTimingFunction']]],
  { filterDefault: true }
)
export let willChange = createUtilityPlugin('willChange', [['will-change', ['will-change']]])
export let content = createUtilityPlugin('content')
