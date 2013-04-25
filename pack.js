var through = require('through')
var path = require('path')

//turn a json bundle into a javascript bundle.
//these bundles will will run in the browser,
//along with a loader. (npm.js)

function pretty (d) {
  return JSON.stringify(JSON.parse(d), null, 2)
}

function rel (root, deps) {
  for(var f in deps) {
    if(deps[f])
    deps[f] = path.relative(root, deps[f])
  }
  return deps
}

module.exports = function () {
  return through(function (m) {
    if(/\/package\.json$/.test(m.id)) {
      if(this.package)
        return this.emit('error', new Error('package.json must come first'))

      //I probably should also add the version...
      this.queue(
          'npm.package('
        + JSON.stringify(m.source.name)
        + '{\n"package.json":'
        + pretty(m.source)
        + ',\n'
      )

      this.package = JSON.parse(m.source)
      this.dir = path.dirname(m.id)
    } else if(!this.package) {
      return this.emit('error', new Error('package.json must come first'))
    } else {
      var file = path.relative(this.dir, m.id)
      this.queue(
        JSON.stringify(file)
        +  ': function (require, module, exports) {\n'
        +  m.source
        + '},\n' //this will break some browsers. fix later.
      )
    }
  }, function () {
    this.queue('});\n\n')
  })
}

