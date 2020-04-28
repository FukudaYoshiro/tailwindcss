import fs from 'fs'
import path from 'path'
import postcss from 'postcss'
import tailwind from '../src/index'
import config from '../stubs/defaultConfig.stub.js'

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

  return postcss([tailwind({ ...config, important: true })])
    .process(input, { from: inputPath })
    .then(result => {
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-important.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('generates the right CSS when using @import instead of @tailwind', () => {
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input-import.css`)
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

it('generates the right CSS when "important" is enabled', () => {
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([tailwind({ ...config, important: true })])
    .process(input, { from: inputPath })
    .then(result => {
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-important.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('purges unused classes', () => {
  const OLD_NODE_ENV = process.env.NODE_ENV
  process.env.NODE_ENV = 'production'
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([
    tailwind({
      ...config,
      theme: {
        extend: {
          colors: {
            'black!': '#000',
          },
          spacing: {
            '(1/2+8)': 'calc(50% + 2rem)',
          },
          minHeight: {
            '(screen-100)': 'calc(100vh - 1rem)',
          },
          fontFamily: {
            '%#$@': 'Comic Sans',
          },
        },
      },
      purge: [path.resolve(`${__dirname}/fixtures/**/*.html`)],
    }),
  ])
    .process(input, { from: inputPath })
    .then(result => {
      process.env.NODE_ENV = OLD_NODE_ENV
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-purged.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('does not purge except in production', () => {
  const OLD_NODE_ENV = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([
    tailwind({
      ...config,
      purge: [path.resolve(`${__dirname}/fixtures/**/*.html`)],
    }),
  ])
    .process(input, { from: inputPath })
    .then(result => {
      process.env.NODE_ENV = OLD_NODE_ENV
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})

it('purges outside of production if explicitly enabled', () => {
  const OLD_NODE_ENV = process.env.NODE_ENV
  process.env.NODE_ENV = 'development'
  const inputPath = path.resolve(`${__dirname}/fixtures/tailwind-input.css`)
  const input = fs.readFileSync(inputPath, 'utf8')

  return postcss([
    tailwind({
      ...config,
      theme: {
        extend: {
          colors: {
            'black!': '#000',
          },
          spacing: {
            '(1/2+8)': 'calc(50% + 2rem)',
          },
          minHeight: {
            '(screen-100)': 'calc(100vh - 1rem)',
          },
          fontFamily: {
            '%#$@': 'Comic Sans',
          },
        },
      },
      purge: { enabled: true, paths: [path.resolve(`${__dirname}/fixtures/**/*.html`)] },
    }),
  ])
    .process(input, { from: inputPath })
    .then(result => {
      process.env.NODE_ENV = OLD_NODE_ENV
      const expected = fs.readFileSync(
        path.resolve(`${__dirname}/fixtures/tailwind-output-purged.css`),
        'utf8'
      )

      expect(result.css).toBe(expected)
    })
})
