import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import tailwind from '../src/index'
import config from '../defaultConfig.js'

it('generates the right CSS', () => {
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([tailwind()])
    .process(input, { from: inputPath })
    .then(result => {
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('generates the right CSS when "important" is enabled', () => {
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([tailwind({ ...config, options: { ...config.options, important: true }})])
    .process(input, { from: inputPath })
    .then(result => {
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-important.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('does not add any CSS if no Tailwind features are used', () => {
  return postcss([tailwind()])
    .process('.foo { color: blue; }', { from: undefined })
    .then(result => {
      expect(result.css).toMatchCss('.foo { color: blue; }')
    })
})

it('generates the right CSS with implicit screen utilities', () => {
  const inputPath = path.resolve(
    `${__dirname}/fixtures/tailwind-input-with-explicit-screen-utilities.css`
  )
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([tailwind()])
    .process(input, { from: inputPath })
    .then(result => {
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-with-explicit-screen-utilities.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})
