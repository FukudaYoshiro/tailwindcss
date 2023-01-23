const prettier = require('prettier')
const { diff } = require('jest-diff')
const lightningcss = require('lightningcss')

function formatPrettier(input) {
  return prettier.format(input, {
    parser: 'css',
    printWidth: 100,
  })
}

function format(input) {
  try {
    return lightningcss
      .transform({
        filename: 'input.css',
        code: Buffer.from(input),
        minify: false,
        targets: { chrome: 106 << 16 },
        drafts: {
          nesting: true,
          customMedia: true,
        },
      })
      .code.toString('utf8')
  } catch (err) {
    try {
      // Lightning CSS is pretty strict, so it will fail for `@media screen(md) {}` for example,
      // in that case we can fallback to prettier since it doesn't really care. However if an
      // actual syntax error is made, then we still want to show the proper error.
      return formatPrettier(input.replace(/\n/g, ''))
    } catch {
      let lines = err.source.split('\n')
      let e = new Error(
        [
          'Error formatting using Lightning CSS:',
          '',
          ...[
            '```css',
            ...lines.slice(Math.max(err.loc.line - 3, 0), err.loc.line),
            ' '.repeat(err.loc.column - 1) + '^-- ' + err.toString(),
            ...lines.slice(err.loc.line, err.loc.line + 2),
            '```',
          ],
        ].join('\n')
      )
      if (Error.captureStackTrace) {
        Error.captureStackTrace(e, toMatchFormattedCss)
      }
      throw e
    }
  }
}

function toMatchFormattedCss(received = '', argument = '') {
  let options = {
    comment: 'formatCSS(received) === formatCSS(argument)',
    isNot: this.isNot,
    promise: this.promise,
  }

  let formattedReceived = format(received)
  let formattedArgument = format(argument)

  let pass = formattedReceived === formattedArgument

  let message = pass
    ? () => {
        return (
          this.utils.matcherHint('toMatchFormattedCss', undefined, undefined, options) +
          '\n\n' +
          `Expected: not ${this.utils.printExpected(formattedReceived)}\n` +
          `Received: ${this.utils.printReceived(formattedArgument)}`
        )
      }
    : () => {
        let actual = formatPrettier(formattedReceived)
        let expected = formatPrettier(formattedArgument)

        let diffString = diff(expected, actual, {
          expand: this.expand,
        })

        return (
          this.utils.matcherHint('toMatchFormattedCss', undefined, undefined, options) +
          '\n\n' +
          (diffString && diffString.includes('- Expect')
            ? `Difference:\n\n${diffString}`
            : `Expected: ${this.utils.printExpected(expected)}\n` +
              `Received: ${this.utils.printReceived(actual)}`)
        )
      }

  return { actual: received, message, pass }
}

expect.extend({
  // Compare two CSS strings with all whitespace removed
  // This is probably naive but it's fast and works well enough.
  toMatchCss: toMatchFormattedCss,
  toMatchFormattedCss: toMatchFormattedCss,
  toIncludeCss(received, argument) {
    let options = {
      comment: 'stripped(received).includes(stripped(argument))',
      isNot: this.isNot,
      promise: this.promise,
    }

    let pass = format(received).includes(format(argument))

    let message = pass
      ? () => {
          return (
            this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
            '\n\n' +
            `Expected: not ${this.utils.printExpected(formatPrettier(received))}\n` +
            `Received: ${this.utils.printReceived(formatPrettier(argument))}`
          )
        }
      : () => {
          let actual = formatPrettier(received)
          let expected = formatPrettier(argument)

          let diffString = diff(expected, actual, {
            expand: this.expand,
          })

          return (
            this.utils.matcherHint('toIncludeCss', undefined, undefined, options) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(expected)}\n` +
                `Received: ${this.utils.printReceived(actual)}`)
          )
        }

    return { actual: received, message, pass }
  },
})
