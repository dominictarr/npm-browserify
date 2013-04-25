// browserify a single module.

//bundle a single module into one file.

var mdeps = require('module-deps')
var streamify = require('streamify')
var fs = require('fs')
var path = require('path')

var deps = function (index, dir) {

  return mdeps(index, {
    filter: function (id) {
      //filter out non-relative requires...
      return id[0] === '.' || id[0] === '/' 
    }
  })

}

var mod = function (dir) {
  var s = streamify()
  var pkgFile = path.resolve(dir, 'package.json')
  var pkg = fs.readFile(pkgFile, 'utf-8',
  function (err, data) {
    var pkg = JSON.parse(data)
    s.package = pkg
    s.emit('data', {id: pkgFile, source: data, deps: {}})
    s.resolve(deps(path.join(dir, pkg.main || 'index.js'), dir))
  })

  return s
}

var pack = function () {

}

if(!module.parent) {
 mod(process.argv[2])
//  .pipe(require('JSONStream').stringify())
  .pipe(require('./pack')())
  .pipe(process.stdout) 
}
