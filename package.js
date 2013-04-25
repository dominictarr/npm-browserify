var path = require('path')
var extensions = ['js', 'json']

function nonRelative(req) {
  return req[0] !== '/' && req[0] !== '.'
}

function resolve(files, name, from, pkg) {
  var dir = path.dirname(from)
  console.log('resolve', name, Object.keys(files))

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

function package (files, parent) {
  var node_modules = {}
  var cache = {}
  if(!files)
    files = {}

  var pkg = files['package.json']

  function makeRequire(file) {
    return function (name) {
      console.log('REQ', name, Object.keys(node_modules))
      if(nonRelative(name)) {
        var s = name.split('/')
        var mn = s.shift()
        var rest = './' + s.join('/')
        console.log('REQUIRE', mn, rest)
        console.log('node_modules', node_modules)
        if(node_modules[mn])
          return node_modules[mn].require(rest)
        else
          return parent.require(name)
      }
      
      var fname = resolve(files, name, file, pkg)
      console.log('-->', fname)
      if(fname)
        return cache[fname] = makeFile(files[fname], fname)

      if(!parent)
        throw new Error('cannot find module: ' 
                       + JSON.stringify(name))

//      parent.require(name)
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


 /*function (name) {
      if(name == './' || !name)
        name = pkg.main || 'index'
      var load = resolve(files, name, './package.json')

      if(!load) {
        if(!parent)
          throw new Error('cannot find module:'+name)
        return parent.require(name)
      }

      if(cache[load])
        return cache[load]
      
      return cache[name] = makeFile(files[load], load)
    }*/
  }
}

if('undefined' !== typeof module) {
  return module.exports = package
}

