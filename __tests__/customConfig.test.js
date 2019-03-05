import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import postcss from 'postcss'
import tailwind from '../src/index'

function inTempDirectory(callback) {
  return new Promise(resolve => {
    rimraf.sync('./__tmp')
    fs.mkdirSync(path.resolve('./__tmp'))
    process.chdir(path.resolve('./__tmp'))
    callback().then(() => {
      process.chdir(path.resolve('../'))
      rimraf('./__tmp', resolve)
    })
  })
}

test('it uses the values from the custom config file', () => {
  return postcss([tailwind(path.resolve(`${__dirname}/fixtures/custom-config.js`))])
    .process(
      `
        @responsive {
          .foo {
            color: blue;
          }
        }
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .foo {
          color: blue;
        }
        @media (min-width: 400px) {
          .mobile\\:foo {
            color: blue;
          }
        }
      `
      expect(result.css).toMatchCss(expected)
    })
})

test('custom config can be passed as an object', () => {
  return postcss([
    tailwind({
      theme: {
        screens: {
          mobile: '400px',
        },
      },
    }),
  ])
    .process(
      `
        @responsive {
          .foo {
            color: blue;
          }
        }
      `,
      { from: undefined }
    )
    .then(result => {
      const expected = `
        .foo {
          color: blue;
        }
        @media (min-width: 400px) {
          .mobile\\:foo {
            color: blue;
          }
        }
      `

      expect(result.css).toMatchCss(expected)
    })
})

test('tailwind.config.js is picked up by default', () => {
  return inTempDirectory(() => {
    fs.writeFileSync(
      path.resolve('./tailwind.config.js'),
      `module.exports = {
        theme: {
          screens: {
            mobile: '400px',
          },
        },
      }`
    )

    return postcss([tailwind])
      .process(
        `
          @responsive {
            .foo {
              color: blue;
            }
          }
        `,
        { from: undefined }
      )
      .then(result => {
        expect(result.css).toMatchCss(`
          .foo {
            color: blue;
          }
          @media (min-width: 400px) {
            .mobile\\:foo {
              color: blue;
            }
          }
        `)
      })
  })
})
