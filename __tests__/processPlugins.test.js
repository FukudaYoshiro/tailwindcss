import _ from 'lodash'
import postcss from 'postcss'
import processPlugins from '../src/util/processPlugins'

function css(nodes) {
  return postcss.root({ nodes }).toString()
}

function objectFitPlugin(variants = []) {
  return function ({ rule, addUtilities }) {
    addUtilities([
      rule('.object-fill', {
        'object-fit': 'fill',
      }),
      rule('.object-contain', {
        'object-fit': 'contain',
      }),
      rule('.object-cover', {
        'object-fit': 'cover',
      }),
    ], variants)
  }
}

function buttonPlugin() {
  return function ({ rule, atRule, addComponents }) {
    addComponents([
      rule('.btn-blue', {
        'background-color': 'blue',
        'color': 'white',
        'padding': '.5rem 1rem',
        'border-radius': '.25rem',
      }),
      rule('.btn-blue:hover', {
        'background-color': 'darkblue',
      }),
    ])
  }
}

function containerPlugin() {
  return function ({ rule, atRule, addComponents }) {
    addComponents([
      rule('.container', {
        'width': '100%',
      }),
      atRule('@media (min-width: 100px)', [
        rule('.container', {
          'max-width': '100px',
        }),
      ]),
      atRule('@media (min-width: 200px)', [
        rule('.container', {
          'max-width': '200px',
        }),
      ]),
      atRule('@media (min-width: 300px)', [
        rule('.container', {
          'max-width': '300px',
        }),
      ])
    ])
  }
}

test('plugins can create utilities', () => {
  const config = {
    plugins: [
      objectFitPlugin()
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @variants {
      .object-fill {
        object-fit: fill
      }
      .object-contain {
        object-fit: contain
      }
      .object-cover {
        object-fit: cover
      }
    }
  `)
})

test('plugins can create utilities with variants', () => {
  const config = {
    plugins: [
      objectFitPlugin(['responsive', 'hover', 'group-hover', 'focus'])
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @variants responsive, hover, group-hover, focus {
      .object-fill {
        object-fit: fill
      }
      .object-contain {
        object-fit: contain
      }
      .object-cover {
        object-fit: cover
      }
    }
  `)
})

test('plugins can create components', () => {
  const config = {
    plugins: [
      buttonPlugin()
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    .btn-blue {
      background-color: blue;
      color: white;
      padding: .5rem 1rem;
      border-radius: .25rem
    }
    .btn-blue:hover {
      background-color: darkblue
    }
  `)
})

test('plugins can create components with media queries', () => {
  const config = {
    plugins: [
      containerPlugin()
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    .container {
      width: 100%
    }
    @media (min-width: 100px) {
      .container {
        max-width: 100px
      }
    }
    @media (min-width: 200px) {
      .container {
        max-width: 200px
      }
    }
    @media (min-width: 300px) {
      .container {
        max-width: 300px
      }
    }
  `)
})

test('plugins can create rules with escaped selectors', () => {
  const config = {
    plugins: [
      function ({ e, rule, addUtilities }) {
        addUtilities([
          rule(`.${e('top-1/4')}`, {
            top: '25%',
          })
        ], [])
      }
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(components.length).toBe(0)
  expect(css(utilities)).toMatchCss(`
    @variants {
      .top-1\\/4 {
        top: 25%
      }
    }
  `)
})

test('plugins can access the current config', () => {
  const config = {
    screens: {
      'sm': '576px',
      'md': '768px',
      'lg': '992px',
      'xl': '1200px',
    },
    plugins: [
      function ({ rule, atRule, addComponents, config }) {
        const containerClasses = [
          rule('.container', {
            'width': '100%',
          })
        ]

        _.forEach(config.screens, (breakpoint) => {
          const mediaQuery = atRule(`@media (min-width: ${breakpoint})`, [
            rule('.container', { 'max-width': breakpoint })
          ])
          containerClasses.push(mediaQuery)
        })

        addComponents(containerClasses)
      }
    ]
  }

  const [components, utilities] = processPlugins(config)

  expect(utilities.length).toBe(0)
  expect(css(components)).toMatchCss(`
    .container {
      width: 100%
    }
    @media (min-width: 576px) {
      .container {
        max-width: 576px
      }
    }
    @media (min-width: 768px) {
      .container {
        max-width: 768px
      }
    }
    @media (min-width: 992px) {
      .container {
        max-width: 992px
      }
    }
    @media (min-width: 1200px) {
      .container {
        max-width: 1200px
      }
    }
  `)
})
