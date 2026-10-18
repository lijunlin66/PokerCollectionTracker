const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { createRequire } = require('node:module')
const ts = require('typescript')

// 使用项目已有的 TypeScript 编译器，在 Node 测试中隔离 Electron/磁盘接口。
module.exports = function loadTs(entry, mocks = {}) {
  const cache = new Map()
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports
    const mod = { exports: {} }
    cache.set(filename, mod)
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true
      }
    }).outputText
    const nativeRequire = createRequire(filename)
    const localRequire = (id) => {
      if (Object.hasOwn(mocks, id)) return mocks[id]
      if (id.startsWith('@shared/')) return load(path.resolve(__dirname, '../src/shared', id.slice(8) + '.ts'))
      if (id.startsWith('.')) return load(path.resolve(path.dirname(filename), id + '.ts'))
      return nativeRequire(id)
    }
    vm.runInThisContext(`(function(require, module, exports) { ${source}\n})`, { filename })(localRequire, mod, mod.exports)
    return mod.exports
  }
  return load(path.resolve(__dirname, '..', entry))
}
