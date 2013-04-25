
var npm = require('../package')
var test = require('tape')

//Here we check that the dynamic linker
//works correctly. these are the various ways
//modules can be required.
//there is probably something I've missed,
//but this is most of it.


function foo (r) {
  return {
    "package.json": {name: 'foo', version:"1.0.0"},
    "index.js": function (req, module, exports) {
      module.exports = r
    }
  }
}

function bar (r) {
  return {
    "package.json":{
      "name": "bar",
      "version": "1.2.5",
      "main": "bar.js"
    },
    "bar.js": function (require, module, exports) {
        module.exports = require('./lib/bar')
    },
    "lib/bar.js": function (require, module, exports) {
      module.exports = r
    },
  }
}

function baz (r) {
  return {
    "package.json": {
      "name": "baz",
      "version": "1.2.5",
      "main": "lib/baz.js"
    },
    "utils.js": function (require, module, exports) {
      module.exports = r
    },
    "lib/baz.js": function (require, module, exports) {
      module.exports = require('../utils')
    }
  }
}


test('a single file', function (t) {
  var r = Math.random()
  var m = npm().package('foo', foo(r))

  t.equal(m.require('./'), r)

  //should be the same export if required again
  t.equal(m.require('./'), r)

  t.end()
})

test('relative', function (t) {
  var r = Math.random()
  var m = npm().package('bar', bar(r));

  t.equal(m.require('./'), r)
  t.equal(m.require('./'), r)
  t.equal(m.require('./bar'), r)
  t.equal(m.require('./lib/bar'), r)
  t.end()
})


test('relative -- parent', function (t) {
  var r = Date.now()
  var m = npm().package('baz', baz(r))
  t.equal(m.require('./lib/baz'), r)
  t.equal(m.require('./utils'), r)
  t.end()
})

function blerg() {
  return {
    "package.json":{
      "name": "blerg",
      "version": "1.2.5"
    },
    "index.js": function (require, module, exports) {
        module.exports = require('bar')
    }
  }
}


test('load a module', function (t) {
  var r = Math.random()
  var p = npm().package('blerg', blerg())
  p.package('bar', bar(r))
  //install bar inside blerg,
  //and then load it from blerg.
  t.equals(p.require('./'), r)
  t.equals(p.require('bar'), r)
  t.end()
})

test('load a module', function (t) {
  var a = Math.random(), b = Date.now()
  var p = npm().package('foo', foo(a))
  var q = p.package('bar', bar(b))
  var r = q.package('blerg', blerg())
  //install bar inside blerg,
  //and then load it from blerg.
  t.equals(p.require('./'), a)
  t.equals(r.require('bar'), b)
  t.equals(p.require('bar'), b)
  t.end()
})


