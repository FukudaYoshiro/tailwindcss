import resolveConfig from '../src/util/resolveConfig'

test('prefix key overrides default prefix', () => {
  const userConfig = {
    prefix: 'tw-',
  }

  const defaultConfig = {
    prefix: '',
    important: false,
    separator: ':',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: 'tw-',
    important: false,
    separator: ':',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('important key overrides default important', () => {
  const userConfig = {
    important: true,
  }

  const defaultConfig = {
    prefix: '',
    important: false,
    separator: ':',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '',
    important: true,
    separator: ':',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('separator key overrides default separator', () => {
  const userConfig = {
    separator: '__',
  }

  const defaultConfig = {
    prefix: '',
    important: false,
    separator: ':',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '',
    important: false,
    separator: '__',
    theme: {
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('theme key is merged instead of replaced', () => {
  const userConfig = {
    theme: {
      screens: {
        mobile: '400px',
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        grey: '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
      },
      fonts: {
        sans: ['system-ui', 'BlinkMacSystemFont', '-apple-system', 'Roboto', 'sans-serif'],
        serif: ['Constantia', 'Lucida Bright', 'Georgia', 'serif'],
      },
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        grey: '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
      },
      fonts: {
        sans: ['system-ui', 'BlinkMacSystemFont', '-apple-system', 'Roboto', 'sans-serif'],
        serif: ['Constantia', 'Lucida Bright', 'Georgia', 'serif'],
      },
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('variants key is merged instead of replaced', () => {
  const userConfig = {
    variants: {
      backgroundAttachment: [],
      borderColors: ['responsive', 'hover', 'focus', 'active'],
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        grey: '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
      },
      fonts: {
        sans: ['system-ui', 'BlinkMacSystemFont', '-apple-system', 'Roboto', 'sans-serif'],
        serif: ['Constantia', 'Lucida Bright', 'Georgia', 'serif'],
      },
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    variants: {
      appearance: ['responsive'],
      backgroundAttachment: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
      borderRadius: ['responsive'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        'grey-darker': '#606f7b',
        'grey-dark': '#8795a1',
        grey: '#b8c2cc',
        'grey-light': '#dae1e7',
        'grey-lighter': '#f1f5f8',
      },
      fonts: {
        sans: ['system-ui', 'BlinkMacSystemFont', '-apple-system', 'Roboto', 'sans-serif'],
        serif: ['Constantia', 'Lucida Bright', 'Georgia', 'serif'],
      },
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    variants: {
      appearance: ['responsive'],
      backgroundAttachment: [],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus', 'active'],
      borderRadius: ['responsive'],
    },
  })
})

test('missing top level keys are pulled from the default config', () => {
  const userConfig = {}

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: { green: '#00ff00' },
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: { green: '#00ff00' },
      screens: {
        mobile: '400px',
      },
    },
    variants: {
      appearance: ['responsive'],
      borderCollapse: [],
      borderColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('functions in the default theme section are lazily evaluated', () => {
  const userConfig = {
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      backgroundColors: theme => theme('colors'),
      textColors: theme => theme('colors'),
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      textColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      backgroundColors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      textColors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      textColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('functions in the user theme section are lazily evaluated', () => {
  const userConfig = {
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      backgroundColors: theme => ({
        ...theme('colors'),
        customBackground: '#bada55',
      }),
      textColors: theme => ({
        ...theme('colors'),
        customText: '#facade',
      }),
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      backgroundColors: ({ colors }) => colors,
      textColors: ({ colors }) => colors,
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      textColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      backgroundColors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
        customBackground: '#bada55',
      },
      textColors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
        customText: '#facade',
      },
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      textColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('theme values in the extend section extend the existing theme', () => {
  const userConfig = {
    theme: {
      extend: {
        opacity: {
          '25': '25',
          '75': '.75',
        },
        backgroundColors: {
          customBackground: '#bada55',
        },
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      opacity: {
        '0': '0',
        '50': '.5',
        '100': '1',
      },
      backgroundColors: theme => theme('colors'),
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      opacity: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      opacity: {
        '0': '0',
        '50': '.5',
        '100': '1',
        '25': '25',
        '75': '.75',
      },
      backgroundColors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
        customBackground: '#bada55',
      },
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
      opacity: ['responsive', 'hover', 'focus'],
    },
  })
})

test('theme values in the extend section extend the user theme', () => {
  const userConfig = {
    theme: {
      opacity: {
        '0': '0',
        '20': '.2',
        '40': '.4',
      },
      height: theme => theme('width'),
      extend: {
        opacity: {
          '60': '.6',
          '80': '.8',
          '100': '1',
        },
        height: {
          customHeight: '500vh',
        },
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      opacity: {
        '0': '0',
        '50': '.5',
        '100': '1',
      },
      height: {
        '0': 0,
        full: '100%',
      },
      width: {
        '0': 0,
        '1': '.25rem',
        '2': '.5rem',
        '3': '.75rem',
        '4': '1rem',
      },
    },
    variants: {
      opacity: ['responsive', 'hover', 'focus'],
      height: ['responsive'],
      width: ['responsive'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      opacity: {
        '0': '0',
        '20': '.2',
        '40': '.4',
        '60': '.6',
        '80': '.8',
        '100': '1',
      },
      height: {
        '0': 0,
        '1': '.25rem',
        '2': '.5rem',
        '3': '.75rem',
        '4': '1rem',
        customHeight: '500vh',
      },
      width: {
        '0': 0,
        '1': '.25rem',
        '2': '.5rem',
        '3': '.75rem',
        '4': '1rem',
      },
    },
    variants: {
      opacity: ['responsive', 'hover', 'focus'],
      height: ['responsive'],
      width: ['responsive'],
    },
  })
})

test('theme values in the extend section can extend values that are depended on lazily', () => {
  const userConfig = {
    theme: {
      extend: {
        colors: {
          red: 'red',
          green: 'green',
          blue: 'blue',
        },
        backgroundColors: {
          customBackground: '#bada55',
        },
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      backgroundColors: theme => theme('colors'),
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      backgroundColors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
        red: 'red',
        green: 'green',
        blue: 'blue',
        customBackground: '#bada55',
      },
    },
    variants: {
      backgroundColors: ['responsive', 'hover', 'focus'],
    },
  })
})

test('theme values in the extend section are not deeply merged', () => {
  const userConfig = {
    theme: {
      extend: {
        fonts: {
          sans: ['Comic Sans'],
        },
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      fonts: {
        sans: ['system-ui', 'Helvetica Neue', 'sans-serif'],
        serif: ['Constantia', 'Georgia', 'serif'],
        mono: ['Menlo', 'Courier New', 'monospace'],
      },
    },
    variants: {
      fonts: ['responsive'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      fonts: {
        sans: ['Comic Sans'],
        serif: ['Constantia', 'Georgia', 'serif'],
        mono: ['Menlo', 'Courier New', 'monospace'],
      },
    },
    variants: {
      fonts: ['responsive'],
    },
  })
})

test('the theme function can use a default value if the key is missing', () => {
  const userConfig = {
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      borderColor: theme => ({
        default: theme('colors.gray', 'currentColor'),
        ...theme('colors'),
      }),
    },
    variants: {
      borderColor: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      borderColor: {
        default: 'currentColor',
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
    variants: {
      borderColor: ['responsive', 'hover', 'focus'],
    },
  })
})

test('theme values in the extend section are lazily evaluated', () => {
  const userConfig = {
    theme: {
      colors: {
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      extend: {
        colors: {
          orange: 'orange',
        },
        borderColor: theme => ({
          foo: theme('colors.orange'),
          bar: theme('colors.red'),
        }),
      },
    },
  }

  const defaultConfig = {
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        cyan: 'cyan',
        magenta: 'magenta',
        yellow: 'yellow',
      },
      borderColor: theme => ({
        default: theme('colors.yellow', 'currentColor'),
        ...theme('colors'),
      }),
    },
    variants: {
      borderColor: ['responsive', 'hover', 'focus'],
    },
  }

  const result = resolveConfig([userConfig, defaultConfig])

  expect(result).toEqual({
    prefix: '-',
    important: false,
    separator: ':',
    theme: {
      colors: {
        orange: 'orange',
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
      borderColor: {
        default: 'currentColor',
        foo: 'orange',
        bar: 'red',
        orange: 'orange',
        red: 'red',
        green: 'green',
        blue: 'blue',
      },
    },
    variants: {
      borderColor: ['responsive', 'hover', 'focus'],
    },
  })
})
