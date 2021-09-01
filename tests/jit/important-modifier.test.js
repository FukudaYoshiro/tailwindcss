import postcss from 'postcss'
import fs from 'fs'
import path from 'path'
import tailwind from '../../src'

function run(input, config = {}) {
  return postcss(tailwind(config)).process(input, {
    from: path.resolve(__filename),
  })
}

test('important modifier', () => {
  let config = {
    important: false,
    darkMode: 'class',
    content: [path.resolve(__dirname, './important-modifier.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [],
  }

  let css = `
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
  `

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './important-modifier.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchFormattedCss(expected)
  })
})
