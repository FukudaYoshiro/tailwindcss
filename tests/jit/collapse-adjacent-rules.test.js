import postcss from 'postcss'
import fs from 'fs'
import path from 'path'
import tailwind from '../../src/jit/index.js'

function run(input, config = {}) {
  return postcss(tailwind(config)).process(input, {
    from: path.resolve(__filename),
  })
}

test('collapse adjacent rules', () => {
  let config = {
    mode: 'jit',
    purge: [path.resolve(__dirname, './collapse-adjacent-rules.test.html')],
    corePlugins: { preflight: false },
    theme: {},
    plugins: [],
  }

  let css = `
    @tailwind base;
    @font-face {
      font-family: "Inter";
      src: url("/fonts/Inter.woff2") format("woff2"),
            url("/fonts/Inter.woff") format("woff");
    }
    @font-face {
      font-family: "Gilroy";
      src: url("/fonts/Gilroy.woff2") format("woff2"),
            url("/fonts/Gilroy.woff") format("woff");
    }
    @page {
      margin: 1cm;
    }
    @tailwind components;
    @tailwind utilities;
    @layer base {
      @font-face {
        font-family: "Poppins";
        src: url("/fonts/Poppins.woff2") format("woff2"),
              url("/fonts/Poppins.woff") format("woff");
      }
      @font-face {
        font-family: "Proxima Nova";
        src: url("/fonts/ProximaNova.woff2") format("woff2"),
              url("/fonts/ProximaNova.woff") format("woff");
      }
    }
  `

  return run(css, config).then((result) => {
    let expectedPath = path.resolve(__dirname, './collapse-adjacent-rules.test.css')
    let expected = fs.readFileSync(expectedPath, 'utf8')

    expect(result.css).toMatchFormattedCss(expected)
  })
})
