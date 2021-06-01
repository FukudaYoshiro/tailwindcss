#!/usr/bin/env node

/* eslint-disable */

// import autoprefixer from 'autoprefixer'
import chokidar from 'chokidar'
import postcss from 'postcss'
import chalk from 'chalk'
import path from 'path'
import arg from 'arg'
import fs from 'fs'
import tailwindJit from './jit/processTailwindFeatures'
import tailwindAot from './processTailwindFeatures'
import resolveConfigInternal from '../resolveConfig'
import fastGlob from 'fast-glob'
import getModuleDependencies from './lib/getModuleDependencies'
import packageJson from '../package.json'

let env = {
  DEBUG: process.env.DEBUG !== undefined,
}

// ---

function indentRecursive(node, indent = 0) {
  node.each &&
    node.each((child, i) => {
      if (!child.raws.before || !child.raws.before.trim() || child.raws.before.includes('\n')) {
        child.raws.before = `\n${node.type !== 'rule' && i > 0 ? '\n' : ''}${'  '.repeat(indent)}`
      }
      child.raws.after = `\n${'  '.repeat(indent)}`
      indentRecursive(child, indent + 1)
    })
}

function formatNodes(root) {
  indentRecursive(root)
  if (root.first) {
    root.first.raws.before = ''
  }
}

function help({ message, usage, commands, options }) {
  // Render header
  console.log()
  console.log('  ', packageJson.name, packageJson.version)

  // Render message
  if (message) {
    console.log()
    console.log('  ', message)
  }

  // Render usage
  if (usage && usage.length > 0) {
    console.log()
    console.log('  ', 'Usage:')
    for (let example of usage) {
      console.log('  ', '  ', example)
    }
  }

  // Render commands
  if (commands && commands.length > 0) {
    console.log()
    console.log('  ', 'Commands:')
    for (let command of commands) {
      console.log('  ', '  ', command)
    }
  }

  // Render options
  if (options) {
    let groupedOptions = {}
    for (let [key, value] of Object.entries(options)) {
      if (typeof value === 'object') {
        groupedOptions[key] = { ...value, flags: [key] }
      } else {
        groupedOptions[value].flags.push(key)
      }
    }

    console.log()
    console.log('  ', 'Options:')
    for (let { flags, description } of Object.values(groupedOptions)) {
      console.log('  ', '  ', flags.slice().reverse().join(', ').padEnd(15, ' '), description)
    }
  }
}

// ---

/*
  TODOs:
  - [x] Reduce getModuleDependencies calls (make configDeps global?)
  - [x] Detect new files
  - [x] Support raw content in purge config
  - [x] Scaffold tailwind.config.js file (with postcss.config.js)
  - [x] Support passing globs from command line
  - [x] Make config file optional
  - [ ] Support AOT mode
  - [ ] Prebundle peer-dependencies
  - [ ] Make minification work
  - [x] --help option
  - [x] conditional flags based on arguments
          init -f, --full
          build -f, --files
  - [ ] --jit

  Future:
  - Detect project type, add sensible purge defaults
*/
let commands = {
  init: {
    run: init,
    args: {
      '--jit': { type: Boolean, description: 'Enable `JIT` mode' },
      '--full': { type: Boolean, description: 'Generate a full tailwind.config.js file' },
      '--postcss': { type: Boolean, description: 'Generate a PostCSS file' },
      '-f': '--full',
      '-p': '--postcss',
    },
  },
  build: {
    run: build,
    args: {
      '--jit': { type: Boolean, description: 'Build using `JIT` mode' },
      '--files': { type: String, description: 'Use a glob as files to use' },
      '--config': {
        type: String,
        description: 'Provide a custom config file, default: ./tailwind.config.js',
      },
      '--input': { type: String, description: 'The input css file' },
      '--output': { type: String, description: 'The output css file' },
      '--minify': { type: Boolean, description: 'Whether or not the result should be minified' },
      '--watch': { type: Boolean, description: 'Start watching for changes' },
      '-f': '--files',
      '-c': '--config',
      '-i': '--input',
      '-o': '--output',
      '-m': '--minify',
      '-w': '--watch',
    },
  },
}

let sharedFlags = {
  '--help': { type: Boolean, description: 'Prints this help message' },
  '-h': '--help',
}
let command = process.argv.slice(2).find((arg) => !arg.startsWith('-')) || 'build'

if (commands[command] === undefined) {
  help({
    message: `Invalid command: ${command}`,
    usage: ['tailwind <command> [options]'],
    commands: ['init [file]', 'build <file> [options]'],
    options: sharedFlags,
  })
  process.exit(1)
}

// Execute command
let { args: flags, run } = commands[command]
let args = (() => {
  try {
    return arg(
      Object.fromEntries(
        Object.entries({ ...flags, ...sharedFlags }).map(([key, value]) => [
          key,
          typeof value === 'object' ? value.type : value,
        ])
      )
    )
  } catch (err) {
    if (err.code === 'ARG_UNKNOWN_OPTION') {
      help({
        message: err.message,
        usage: ['tailwind <command> [options]'],
        options: sharedFlags,
      })
      process.exit(1)
    }
    throw err
  }
})()

if (args['--help']) {
  help({
    options: { ...flags, ...sharedFlags },
    usage: [`tailwind ${command} [options]`],
  })
  process.exit(0)
}

run()

function init() {
  let tailwindConfigLocation = path.resolve('./tailwind.config.js')
  if (fs.existsSync(tailwindConfigLocation)) {
    console.log('tailwind.config.js already exists.')
  } else {
    let stubFile = fs.readFileSync(
      args['--full']
        ? path.resolve(__dirname, '../stubs/defaultConfig.stub.js')
        : path.resolve(__dirname, '../stubs/simpleConfig.stub.js'),
      'utf8'
    )

    // Change colors import
    stubFile = stubFile.replace('../colors', 'tailwindcss/colors')

    // --jit mode
    if (args['--jit']) {
      // Add jit mode
      stubFile = stubFile.replace('module.exports = {', "module.exports = {\n  mode: 'jit',")

      // Deleting variants
      stubFile = stubFile.replace(/variants: {(.*)},\n  /gs, '')
    }

    fs.writeFileSync(tailwindConfigLocation, stubFile, 'utf8')

    console.log('Created Tailwind config file:', 'tailwind.config.js')
  }

  if (args['--postcss']) {
    let postcssConfigLocation = path.resolve('./postcss.config.js')
    if (fs.existsSync(postcssConfigLocation)) {
      console.log('postcss.config.js already exists.')
    } else {
      let stubFile = fs.readFileSync(
        path.resolve(__dirname, '../stubs/defaultPostCssConfig.stub.js'),
        'utf8'
      )

      fs.writeFileSync(postcssConfigLocation, stubFile, 'utf8')

      console.log('Created PostCSS config file:', 'tailwind.config.js')
    }
  }
}

function build() {
  let input = args['--input']
  let output = args['--output']
  let shouldWatch = args['--watch']
  let shouldMinify = args['--minify']

  if (args['--config'] && !fs.existsSync(args['--config'])) {
    console.error(`Specified config file ${args['--config']} does not exist.`)
    process.exit(9)
  }

  let configPath =
    args['--config'] ??
    ((defaultPath) => (fs.existsSync(defaultPath) ? defaultPath : null))(
      path.resolve('./tailwind.config.js')
    )

  function resolveConfig() {
    let config = require(configPath)
    let resolvedConfig = resolveConfigInternal(config)

    if (args['--files']) {
      resolvedConfig.purge = args['--files'].split(',')
    }

    if (args['--jit']) {
      resolvedConfig.mode = 'jit'
    }

    return resolvedConfig
  }

  if (!output) {
    help({
      message: 'Missing required output file: --output, -o, or first argument',
      usage: [`tailwind ${command} [options]`],
      options: { ...flags, ...sharedFlags },
    })
    process.exit(1)
  }

  function extractContent(config) {
    return Array.isArray(config.purge) ? config.purge : config.purge.content
  }

  function extractFileGlobs(config) {
    return extractContent(config).filter((file) => {
      // Strings in this case are files / globs. If it is something else,
      // like an object it's probably a raw content object. But this object
      // is not watchable, so let's remove it.
      return typeof file === 'string'
    })
  }

  function extractRawContent(config) {
    return extractContent(config).filter((file) => {
      return typeof file === 'object' && file !== null
    })
  }

  function getChangedContent(config) {
    let changedContent = []

    // Resolve globs from the purge config
    let globs = extractFileGlobs(config)
    let files = fastGlob.sync(globs)

    for (let file of files) {
      changedContent.push({
        content: fs.readFileSync(path.resolve(file), 'utf8'),
        extension: path.extname(file),
      })
    }

    // Resolve raw content in the tailwind config
    for (let { raw: content, extension = 'html' } of extractRawContent(config)) {
      changedContent.push({ content, extension })
    }

    return changedContent
  }

  function buildOnce() {
    let config = resolveConfig()
    let changedContent = getChangedContent(config)

    let tailwindPlugin =
      config.mode === 'jit'
        ? (opts = {}) => {
            return {
              postcssPlugin: 'tailwindcss',
              Once(root, { result }) {
                tailwindJit(({ createContext }) => {
                  return () => {
                    return createContext(config, changedContent)
                  }
                })(root, result)
              },
            }
          }
        : (opts = {}) => {
            return {
              postcssPlugin: 'tailwindcss',
              plugins: [tailwindAot(() => config, configPath)],
            }
          }

    tailwindPlugin.postcss = true

    let plugins = [
      // TODO: Bake in postcss-import support?
      // TODO: Bake in postcss-nested support?
      tailwindPlugin,
      // require('autoprefixer'),
      formatNodes,
    ]

    let processor = postcss(plugins)

    function processCSS(css) {
      return processor.process(css, { from: input, to: output }).then((result) => {
        fs.writeFile(output, result.css, () => true)
        if (result.map) {
          fs.writeFile(output + '.map', result.map.toString(), () => true)
        }
      })
    }

    let css = input
      ? fs.readFileSync(path.resolve(input), 'utf8')
      : '@tailwind base; @tailwind components; @tailwind utilities'
    return processCSS(css)
  }

  let context = null

  function startWatcher() {
    let changedContent = []
    let configDependencies = []
    let contextDependencies = new Set()
    let watcher = null

    function refreshConfig() {
      env.DEBUG && console.time('Module dependencies')
      for (let file of configDependencies) {
        delete require.cache[require.resolve(file)]
      }

      if (configPath) {
        configDependencies = getModuleDependencies(configPath).map(({ file }) => file)

        for (let dependency of configDependencies) {
          contextDependencies.add(dependency)
        }
      }
      env.DEBUG && console.timeEnd('Module dependencies')

      return resolveConfig()
    }

    async function rebuild(config) {
      console.log('\nRebuilding...')
      env.DEBUG && console.time('Finished in')

      let tailwindPlugin =
        config.mode === 'jit'
          ? (opts = {}) => {
              return {
                postcssPlugin: 'tailwindcss',
                Once(root, { result }) {
                  env.DEBUG && console.time('Compiling CSS')
                  tailwindJit(({ createContext }) => {
                    return () => {
                      if (context !== null) {
                        context.changedContent = changedContent.splice(0)
                        return context
                      }

                      env.DEBUG && console.time('Creating context')
                      context = createContext(config, changedContent.splice(0))
                      env.DEBUG && console.timeEnd('Creating context')
                      return context
                    }
                  })(root, result)
                  env.DEBUG && console.timeEnd('Compiling CSS')
                },
              }
            }
          : (opts = {}) => {
              return {
                postcssPlugin: 'tailwindcss',
                plugins: [tailwindAot(() => config, configPath)],
              }
            }

      tailwindPlugin.postcss = true

      let plugins = [
        // TODO: Bake in postcss-import support?
        // TODO: Bake in postcss-nested support?
        tailwindPlugin,
        // require('autoprefixer'),
        formatNodes,
      ]

      let processor = postcss(plugins)

      function processCSS(css) {
        return processor.process(css, { from: input, to: output }).then((result) => {
          for (let message of result.messages) {
            if (message.type === 'dependency') {
              contextDependencies.add(message.file)
            }
          }
          watcher.add([...contextDependencies])

          fs.writeFile(output, result.css, () => true)
          if (result.map) {
            fs.writeFile(output + '.map', result.map.toString(), () => true)
          }
        })
      }

      let css = input
        ? fs.readFileSync(path.resolve(input), 'utf8')
        : '@tailwind base; @tailwind components; @tailwind utilities'
      let result = await processCSS(css)
      env.DEBUG && console.timeEnd('Finished in')
      return result
    }

    let configPath = args['--config'] ?? path.resolve('./tailwind.config.js')
    let config = refreshConfig(configPath)

    if (input) {
      contextDependencies.add(path.resolve(input))
    }

    watcher = chokidar.watch([...contextDependencies, ...extractFileGlobs(config)], {
      ignoreInitial: true,
    })

    let chain = Promise.resolve()

    watcher.on('change', async (file) => {
      if (contextDependencies.has(file)) {
        env.DEBUG && console.time('Resolve config')
        context = null
        config = refreshConfig(configPath)
        env.DEBUG && console.timeEnd('Resolve config')

        env.DEBUG && console.time('Watch new files')
        let globs = extractFileGlobs(config)
        watcher.add(configDependencies)
        watcher.add(globs)
        env.DEBUG && console.timeEnd('Watch new files')

        chain = chain.then(async () => {
          changedContent.push(...getChangedContent(config))
          await rebuild(config)
        })
      } else {
        chain = chain.then(async () => {
          changedContent.push({
            content: fs.readFileSync(path.resolve(file), 'utf8'),
            extension: path.extname(file),
          })

          await rebuild(config)
        })
      }
    })

    watcher.on('add', async (file) => {
      chain = chain.then(async () => {
        changedContent.push({
          content: fs.readFileSync(path.resolve(file), 'utf8'),
          extension: path.extname(file),
        })

        await rebuild(config)
      })
    })

    chain = chain.then(() => {
      changedContent.push(...getChangedContent(config))
      return rebuild(config)
    })
  }

  if (shouldWatch) {
    startWatcher()
  } else {
    buildOnce()
  }
}
