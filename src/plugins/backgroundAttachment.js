export default function() {
  return function({ addUtilities, config }) {
    addUtilities(
      {
        '.bg-fixed': { 'background-attachment': 'fixed' },
        '.bg-local': { 'background-attachment': 'local' },
        '.bg-scroll': { 'background-attachment': 'scroll' },
      },
      config('variants.backgroundAttachment')
    )
  }
}
