import { crosscheck, run, html, css } from '../util/run'

crosscheck(() => {
  test('font-family utilities can be defined as a string', () => {
    let config = {
      content: [{ raw: html`<div class="font-sans"></div>` }],
      theme: {
        fontFamily: {
          sans: 'Helvetica, Arial, sans-serif',
        },
      },
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .font-sans {
          font-family: Helvetica, Arial, sans-serif;
        }
      `)
    })
  })

  test('font-family utilities can be defined as an array', () => {
    let config = {
      content: [{ raw: html`<div class="font-sans"></div>` }],
      theme: {
        fontFamily: {
          sans: ['Helvetica', 'Arial', 'sans-serif'],
        },
      },
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .font-sans {
          font-family: Helvetica, Arial, sans-serif;
        }
      `)
    })
  })

  test('font-family values are not automatically escaped', () => {
    let config = {
      content: [{ raw: html`<div class="font-sans"></div>` }],
      theme: {
        fontFamily: {
          sans: ["'Exo 2'", 'sans-serif'],
        },
      },
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .font-sans {
          font-family: 'Exo 2', sans-serif;
        }
      `)
    })
  })

  test('font-feature-settings can be provided when families are defined as a string', () => {
    let config = {
      content: [{ raw: html`<div class="font-sans"></div>` }],
      theme: {
        fontFamily: {
          sans: ['Helvetica, Arial, sans-serif', { fontFeatureSettings: '"cv11", "ss01"' }],
        },
      },
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .font-sans {
          font-feature-settings: 'cv11', 'ss01';
          font-family: Helvetica, Arial, sans-serif;
        }
      `)
    })
  })

  test('font-feature-settings can be provided when families are defined as an array', () => {
    let config = {
      content: [{ raw: html`<div class="font-sans"></div>` }],
      theme: {
        fontFamily: {
          sans: [['Helvetica', 'Arial', 'sans-serif'], { fontFeatureSettings: '"cv11", "ss01"' }],
        },
      },
    }

    return run('@tailwind utilities', config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        .font-sans {
          font-feature-settings: 'cv11', 'ss01';
          font-family: Helvetica, Arial, sans-serif;
        }
      `)
    })
  })
})
