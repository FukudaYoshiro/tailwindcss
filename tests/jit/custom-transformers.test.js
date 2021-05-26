import postcss from 'postcss'
import path from 'path'

function run(input, config = {}) {
  jest.resetModules()
  const tailwind = require('../../src/jit/index.js').default
  return postcss(tailwind(config)).process(input, {
    from: path.resolve(__filename),
  })
}

function customTransformer(content) {
  return content.replace(/uppercase/g, 'lowercase')
}

const css = `
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
`

test('transform function', () => {
  let config = {
    mode: 'jit',
    purge: {
      content: [{ raw: '<div class="uppercase"></div>' }],
      transform: customTransformer,
    },
    corePlugins: { preflight: false, borderColor: false, ringWidth: false, boxShadow: false },
    theme: {},
    plugins: [],
  }

  return run(css, config).then((result) => {
    expect(result.css).toMatchFormattedCss(`
      .lowercase {
        text-transform: lowercase;
      }
    `)
  })
})

test('transform.DEFAULT', () => {
  let config = {
    mode: 'jit',
    purge: {
      content: [{ raw: '<div class="uppercase"></div>' }],
      transform: {
        DEFAULT: customTransformer,
      },
    },
    corePlugins: { preflight: false, borderColor: false, ringWidth: false, boxShadow: false },
    theme: {},
    plugins: [],
  }

  return run(css, config).then((result) => {
    expect(result.css).toMatchFormattedCss(`
      .lowercase {
        text-transform: lowercase;
      }
    `)
  })
})

test('transform.{extension}', () => {
  let config = {
    mode: 'jit',
    purge: {
      content: [
        { raw: '<div class="uppercase"></div>', extension: 'html' },
        { raw: '<div class="uppercase"></div>', extension: 'php' },
      ],
      transform: {
        html: customTransformer,
      },
    },
    corePlugins: { preflight: false, borderColor: false, ringWidth: false, boxShadow: false },
    theme: {},
    plugins: [],
  }

  return run(css, config).then((result) => {
    expect(result.css).toMatchFormattedCss(`
      .uppercase {
        text-transform: uppercase;
      }
      .lowercase {
        text-transform: lowercase;
      }
    `)
  })
})
