import postcss from 'postcss'
import plugin from '../src/lib/substituteResponsiveAtRules'
import config from '../stubs/defaultConfig.stub.js'

function run(input, opts = config) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

test('it can generate responsive variants', () => {
  const input = `
    @responsive {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:banana { color: yellow; }
        .sm\\:chocolate { color: brown; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .md\\:banana { color: yellow; }
        .md\\:chocolate { color: brown; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:banana { color: yellow; }
        .lg\\:chocolate { color: brown; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate responsive variants with a custom separator', () => {
  const input = `
    @responsive {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana { color: yellow; }
      .chocolate { color: brown; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .sm__banana { color: yellow; }
        .sm__chocolate { color: brown; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .md__banana { color: yellow; }
        .md__chocolate { color: brown; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .lg__banana { color: yellow; }
        .lg__chocolate { color: brown; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: '__',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate responsive variants when classes have non-standard characters', () => {
  const input = `
    @responsive {
      .hover\\:banana { color: yellow; }
      .chocolate-2\\.5 { color: brown; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .hover\\:banana { color: yellow; }
      .chocolate-2\\.5 { color: brown; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:hover\\:banana { color: yellow; }
        .sm\\:chocolate-2\\.5 { color: brown; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .md\\:hover\\:banana { color: yellow; }
        .md\\:chocolate-2\\.5 { color: brown; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:hover\\:banana { color: yellow; }
        .lg\\:chocolate-2\\.5 { color: brown; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('responsive variants are grouped', () => {
  const input = `
    @responsive {
      .banana { color: yellow; }
    }

    .apple { color: red; }

    @responsive {
      .chocolate { color: brown; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana { color: yellow; }
    }
    .apple { color: red; }
    @layer utilities {
      .chocolate { color: brown; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:banana { color: yellow; }
      }
      @layer utilities {
        .sm\\:chocolate { color: brown; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .md\\:banana { color: yellow; }
      }
      @layer utilities {
        .md\\:chocolate { color: brown; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:banana { color: yellow; }
      }
      @layer utilities {
        .lg\\:chocolate { color: brown; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate responsive variants for nested at-rules', () => {
  const input = `
    @responsive {
      .banana { color: yellow; }

      @supports(display: grid) {
        .grid\\:banana { color: blue; }
      }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana {
        color: yellow;
      }

      @supports(display: grid) {
        .grid\\:banana {
          color: blue;
        }
      }
    }

    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:banana {
          color: yellow;
        }

        @supports(display: grid) {
          .sm\\:grid\\:banana {
            color: blue;
          }
        }
      }
    }

    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:banana {
          color: yellow;
        }

        @supports(display: grid) {
          .lg\\:grid\\:banana {
            color: blue;
          }
        }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('it can generate responsive variants for deeply nested at-rules', () => {
  const input = `
    @responsive {
      .banana { color: yellow; }

      @supports(display: grid) {
        @supports(display: flex) {
          .flex-grid\\:banana { color: blue; }
        }
      }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana {
        color: yellow;
      }

      @supports(display: grid) {
        @supports(display: flex) {
          .flex-grid\\:banana {
            color: blue;
          }
        }
      }
    }

    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:banana {
          color: yellow;
        }

        @supports(display: grid) {
          @supports(display: flex) {
            .sm\\:flex-grid\\:banana {
              color: blue;
            }
          }
        }
      }
    }

    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:banana {
          color: yellow;
        }

        @supports(display: grid) {
          @supports(display: flex) {
            .lg\\:flex-grid\\:banana {
              color: blue;
            }
          }
        }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('screen prefix is only applied to the last class in a selector', () => {
  const input = `
    @responsive {
      .banana li * .sandwich #foo > div { color: yellow; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .banana li * .sandwich #foo > div { color: yellow; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .banana li * .sm\\:sandwich #foo > div { color: yellow; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .banana li * .md\\:sandwich #foo > div { color: yellow; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .banana li * .lg\\:sandwich #foo > div { color: yellow; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('responsive variants are generated for all selectors in a rule', () => {
  const input = `
    @responsive {
      .foo, .bar { color: yellow; }
    }

    @tailwind screens;
  `

  const output = `
    @layer utilities {
      .foo, .bar { color: yellow; }
    }
    @media (min-width: 500px) {
      @layer utilities {
        .sm\\:foo, .sm\\:bar { color: yellow; }
      }
    }
    @media (min-width: 750px) {
      @layer utilities {
        .md\\:foo, .md\\:bar { color: yellow; }
      }
    }
    @media (min-width: 1000px) {
      @layer utilities {
        .lg\\:foo, .lg\\:bar { color: yellow; }
      }
    }
  `

  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).then(result => {
    expect(result.css).toMatchCss(output)
    expect(result.warnings().length).toBe(0)
  })
})

test('selectors with no classes cannot be made responsive', () => {
  const input = `
    @responsive {
      div { color: yellow; }
    }

    @tailwind screens;
  `
  expect.assertions(1)
  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})

test('all selectors in a rule must contain classes', () => {
  const input = `
    @responsive {
      .foo, div { color: yellow; }
    }

    @tailwind screens;
  `
  expect.assertions(1)
  return run(input, {
    theme: {
      screens: {
        sm: '500px',
        md: '750px',
        lg: '1000px',
      },
    },
    separator: ':',
  }).catch(e => {
    expect(e).toMatchObject({ name: 'CssSyntaxError' })
  })
})
