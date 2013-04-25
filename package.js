var path = require('path')
var extensions = ['js']

function nonRelative(req) {
  return req[0] !== '/' && req[0] !== '.'
}

function resolve(files, name, from, pkg) {
  var dir = path.dirname(from)

  if(files[name]) return name

  var main = path.normalize(path.join(dir, name))

  if(main == './')
    return pkg.main || 'index.js'

  for (var i in extensions) {
    var n = path.normalize(
      path.join(dir, name + '.'+ extensions[i]))
    if(files[n]) return n
  }
  
  for (var i in extensions) {
    var n = path.normalize(
      path.join(dir, name, 'index.'+ extensions[i]))
    if(files[n]) return n
  }
}

module.exports = function package (files, parent) {
  var node_modules = {}
  var cache = {}
  if(!files)
    files = {}

  var pkg = files['package.json']

  function makeRequire(file) {
    return function (name) {

      if(nonRelative(name)) {
        var s = name.split('/')
        var mn = s.shift()
        var rest = './' + s.join('/')
        return (
            node_modules[mn]
          ? node_modules[mn].require(rest)
          : parent.require(name)
        )
      }
      
      var fname = resolve(files, name, file, pkg)

      if(fname)
        return cache[fname] = makeFile(files[fname], fname)

      if(!parent)
        throw new Error('cannot find module: ' 
                       + JSON.stringify(name))
    }
  }

  function makeFile (load, file) {
    var exports = {}
    var module = {exports: exports, parent: true}
    var require = makeRequire(file)
    load(require, module, exports)
    return module.exports
  }

  return {
    //install a package into this package.
    package: function (name, _files) {
      return node_modules[name] = package(_files, this)
    },
    //just for loading from the outside...
    require: makeRequire('./package.json')
  }
}

