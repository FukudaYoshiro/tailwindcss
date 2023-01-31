import { crosscheck, run, html, css, defaults } from './util/run'

crosscheck(({ stable, oxide }) => {
  oxide.test.todo('prefix')
  stable.test('prefix', () => {
    let config = {
      prefix: 'tw-',
      darkMode: 'class',
      content: [
        {
          raw: html`
            <div class="tw--ml-4"></div>
            <div class="md:tw--ml-5"></div>
            <div class="md:hover:tw--ml-6"></div>
            <div class="tw-container"></div>
            <div class="btn-no-prefix"></div>
            <div class="tw-btn-prefix"></div>
            <div class="tw-custom-util-prefix"></div>
            <div class="custom-util-no-prefix"></div>
            <div class="custom-component"></div>
            <div class="tw-custom-component-prefix"></div>
            <div class="custom-component-no-prefix"></div>
            <div class="tw-font-bold"></div>
            <div class="md:hover:tw-text-right"></div>
            <div class="motion-safe:hover:tw-text-center"></div>
            <div class="dark:focus:tw-text-left"></div>
            <div class="dark:tw-bg-[rgb(255,0,0)]"></div>
            <div class="group-hover:focus-within:tw-text-left"></div>
            <div class="rtl:active:tw-text-center"></div>
            <div class="tw-animate-ping"></div>
            <div class="tw-animate-spin"></div>
          `,
        },
      ],
      corePlugins: { preflight: false },
      theme: {
        animation: {
          spin: 'spin 1s linear infinite',
          ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        },
        keyframes: {
          spin: { to: { transform: 'rotate(360deg)' } },
        },
      },
      plugins: [
        function ({ addComponents, addUtilities }) {
          addComponents({
            '.btn-prefix': {
              button: 'yes',
            },
          })
          addComponents(
            {
              '.btn-no-prefix': {
                button: 'yes',
              },
            },
            { respectPrefix: false }
          )
          addUtilities({
            '.custom-util-prefix': {
              button: 'no',
            },
          })
          addUtilities(
            {
              '.custom-util-no-prefix': {
                button: 'no',
              },
            },
            { respectPrefix: false }
          )
        },
      ],
    }

    let input = css`
      @tailwind base;
      @tailwind components;
      @layer components {
        .custom-component {
          @apply tw-font-bold dark:group-hover:tw-font-normal;
        }
      }
      @tailwind utilities;
      @layer utilities {
        .custom-utility {
          foo: bar;
        }
      }
    `

    return run(input, config).then((result) => {
      expect(result.css).toMatchFormattedCss(css`
        ${defaults}
        .tw-container {
          width: 100%;
        }
        @media (min-width: 640px) {
          .tw-container {
            max-width: 640px;
          }
        }
        @media (min-width: 768px) {
          .tw-container {
            max-width: 768px;
          }
        }
        @media (min-width: 1024px) {
          .tw-container {
            max-width: 1024px;
          }
        }
        @media (min-width: 1280px) {
          .tw-container {
            max-width: 1280px;
          }
        }
        @media (min-width: 1536px) {
          .tw-container {
            max-width: 1536px;
          }
        }
        .tw-btn-prefix,
        .btn-no-prefix {
          button: yes;
        }
        .custom-component {
          font-weight: 700;
        }
        .tw-dark .tw-group:hover .custom-component {
          font-weight: 400;
        }
        .tw--ml-4 {
          margin-left: -1rem;
        }
        .tw-animate-ping {
          animation: 1s cubic-bezier(0, 0, 0.2, 1) infinite ping;
        }
        @keyframes tw-spin {
          to {
            transform: rotate(360deg);
          }
        }
        .tw-animate-spin {
          animation: 1s linear infinite tw-spin;
        }
        .tw-font-bold {
          font-weight: 700;
        }
        .tw-custom-util-prefix,
        .custom-util-no-prefix {
          button: no;
        }
        .tw-group:hover .group-hover\:focus-within\:tw-text-left:focus-within {
          text-align: left;
        }
        [dir='rtl'] .rtl\:active\:tw-text-center:active {
          text-align: center;
        }
        @media (prefers-reduced-motion: no-preference) {
          .motion-safe\:hover\:tw-text-center:hover {
            text-align: center;
          }
        }
        .tw-dark .dark\:tw-bg-\[rgb\(255\,0\,0\)\] {
          --tw-bg-opacity: 1;
          background-color: rgb(255 0 0 / var(--tw-bg-opacity));
        }
        .tw-dark .dark\:focus\:tw-text-left:focus {
          text-align: left;
        }
        @media (min-width: 768px) {
          .md\:tw--ml-5 {
            margin-left: -1.25rem;
          }
          .md\:hover\:tw--ml-6:hover {
            margin-left: -1.5rem;
          }
          .md\:hover\:tw-text-right:hover {
            text-align: right;
          }
        }
      `)
    })
  })

  oxide.test.todo('negative values: marker before prefix')
  stable.test('negative values: marker before prefix', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`<div class="-tw-top-1"></div>` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .-tw-top-1 {
        top: -0.25rem;
      }
    `)
  })

  oxide.test.todo('negative values: marker after prefix')
  stable.test('negative values: marker after prefix', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`<div class="tw--top-1"></div>` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .tw--top-1 {
        top: -0.25rem;
      }
    `)
  })

  oxide.test.todo('negative values: marker before prefix and arbitrary value')
  stable.test('negative values: marker before prefix and arbitrary value', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`<div class="-tw-top-[1px]"></div>` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .-tw-top-\[1px\] {
        top: -1px;
      }
    `)
  })

  oxide.test.todo('negative values: marker after prefix and arbitrary value')
  stable.test('negative values: marker after prefix and arbitrary value', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`<div class="tw--top-[1px]"></div>` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .tw--top-\[1px\] {
        top: -1px;
      }
    `)
  })

  oxide.test.todo('negative values: no marker and arbitrary value')
  stable.test('negative values: no marker and arbitrary value', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`<div class="tw-top-[-1px]"></div>` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .tw-top-\[-1px\] {
        top: -1px;
      }
    `)
  })

  oxide.test.todo('negative values: variant versions')
  stable.test('negative values: variant versions', async () => {
    let config = {
      prefix: 'tw-',
      content: [
        {
          raw: html`
            <div class="hover:-tw-top-1 hover:tw--top-1"></div>
            <div class="hover:-tw-top-[1px] hover:tw--top-[1px]"></div>
            <div class="hover:tw-top-[-1px]"></div>

            <!-- this one should not generate anything -->
            <div class="-hover:tw-top-1"></div>
          `,
        },
      ],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .hover\:-tw-top-1:hover {
        top: -0.25rem;
      }
      .hover\:-tw-top-\[1px\]:hover {
        top: -1px;
      }
      .hover\:tw--top-1:hover {
        top: -0.25rem;
      }
      .hover\:tw--top-\[1px\]:hover,
      .hover\:tw-top-\[-1px\]:hover {
        top: -1px;
      }
    `)
  })

  oxide.test.todo('negative values: prefix and apply')
  stable.test('negative values: prefix and apply', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;

      .a {
        @apply hover:tw--top-1;
      }
      .b {
        @apply hover:-tw-top-1;
      }
      .c {
        @apply hover:-tw-top-[1px];
      }
      .d {
        @apply hover:tw--top-[1px];
      }
      .e {
        @apply hover:tw-top-[-1px];
      }
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .a:hover,
      .b:hover {
        top: -0.25rem;
      }
      .c:hover,
      .d:hover,
      .e:hover {
        top: -1px;
      }
    `)
  })

  oxide.test.todo('negative values: prefix in the safelist')
  stable.test('negative values: prefix in the safelist', async () => {
    let config = {
      prefix: 'tw-',
      safelist: [{ pattern: /-tw-top-1/g }, { pattern: /tw--top-1/g }],
      theme: {
        inset: {
          1: '0.25rem',
        },
      },
      content: [{ raw: html`` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .-tw-top-1,
      .tw--top-1 {
        top: -0.25rem;
      }
    `)
  })

  oxide.test.todo('prefix with negative values and variants in the safelist')
  stable.test('prefix with negative values and variants in the safelist', async () => {
    let config = {
      prefix: 'tw-',
      safelist: [
        { pattern: /-tw-top-1/, variants: ['hover', 'sm:hover'] },
        { pattern: /tw--top-1/, variants: ['hover', 'sm:hover'] },
      ],
      theme: {
        inset: {
          1: '0.25rem',
        },
      },
      content: [{ raw: html`` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    await run(input, config)

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .-tw-top-1,
      .tw--top-1,
      .hover\:-tw-top-1:hover,
      .hover\:tw--top-1:hover {
        top: -0.25rem;
      }
      @media (min-width: 640px) {
        .sm\:hover\:-tw-top-1:hover,
        .sm\:hover\:tw--top-1:hover {
          top: -0.25rem;
        }
      }
    `)
  })

  oxide.test.todo('prefix does not detect and generate unnecessary classes')
  stable.test('prefix does not detect and generate unnecessary classes', async () => {
    let config = {
      prefix: 'tw-_',
      content: [{ raw: html`-aaa-filter aaaa-table aaaa-hidden` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
    `

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css``)
  })

  oxide.test.todo('supports prefixed utilities using arbitrary values')
  stable.test('supports prefixed utilities using arbitrary values', async () => {
    let config = {
      prefix: 'tw-',
      content: [{ raw: html`foo` }],
      corePlugins: { preflight: false },
    }

    let input = css`
      .foo {
        @apply tw-text-[color:rgb(var(--button-background,var(--primary-button-background)))];
        @apply tw-ease-[cubic-bezier(0.77,0,0.175,1)];
        @apply tw-rounded-[min(4px,var(--input-border-radius))];
      }
    `

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .foo {
        color: rgb(var(--button-background, var(--primary-button-background)));
        border-radius: min(4px, var(--input-border-radius));
        transition-timing-function: cubic-bezier(0.77, 0, 0.175, 1);
      }
    `)
  })

  oxide.test.todo('supports non-word prefixes (1)')
  stable.test('supports non-word prefixes (1)', async () => {
    let config = {
      prefix: '@',
      content: [
        {
          raw: html`
            <div class="@underline"></div>
            <div class="@bg-black"></div>
            <div class="@[color:red]"></div>
            <div class="hover:before:@content-['Hovering']"></div>
            <div class="my-utility"></div>
            <div class="foo"></div>

            <!-- these won't be detected -->
            <div class="overline"></div>
          `,
        },
      ],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
      @layer utilities {
        .my-utility {
          color: orange;
        }
      }
      .foo {
        @apply @text-white;
        @apply [background-color:red];
      }
    `

    const result = await run(input, config)

    expect(result.css).toMatchFormattedCss(css`
      .\@bg-black {
        --tw-bg-opacity: 1;
        background-color: rgb(0 0 0 / var(--tw-bg-opacity));
      }
      .\@underline {
        text-decoration-line: underline;
      }
      .my-utility {
        color: orange;
      }
      .foo {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
        background-color: red;
      }
      .hover\:before\:\@content-\[\'Hovering\'\]:hover:before {
        --tw-content: 'Hovering';
        content: var(--tw-content);
      }
    `)
  })

  oxide.test.todo('supports non-word prefixes (2)')
  stable.test('supports non-word prefixes (2)', async () => {
    let config = {
      prefix: '@]$',
      content: [
        {
          raw: html`
            <div class="@]$underline"></div>
            <div class="@]$bg-black"></div>
            <div class="@]$[color:red]"></div>
            <div class="hover:before:@]$content-['Hovering']"></div>
            <div class="my-utility"></div>
            <div class="foo"></div>

            <!-- these won't be detected -->
            <div class="overline"></div>
          `,
        },
      ],
      corePlugins: { preflight: false },
    }

    let input = css`
      @tailwind utilities;
      @layer utilities {
        .my-utility {
          color: orange;
        }
      }
      .foo {
        @apply @]$text-white;
        @apply [background-color:red];
      }
    `

    const result = await run(input, config)

    // TODO: The class `.hover\:before\:\@\]\$content-\[\'Hovering\'\]:hover::before` is not generated
    // This happens because of the parenthesis/brace/bracket clipping performed on candidates

    expect(result.css).toMatchFormattedCss(css`
      .\@\]\$bg-black {
        --tw-bg-opacity: 1;
        background-color: rgb(0 0 0 / var(--tw-bg-opacity));
      }
      .\@\]\$underline {
        text-decoration-line: underline;
      }
      .my-utility {
        color: orange;
      }
      .foo {
        --tw-text-opacity: 1;
        color: rgb(255 255 255 / var(--tw-text-opacity));
        background-color: red;
      }
    `)
  })
})
