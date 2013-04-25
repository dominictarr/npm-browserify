
var require('./package')

module.exports = {
  package: function (name, files) {
    //load a set of files, and store in local storage.
    
    return this
  },
  install: function (modules, cb) {
    //retrive bundles from the server,
    //passing them to package when done.
    //once all the modules are loaded,
    //start the first package, with run.
    return this
  },
  run: function (name, argv) {
    //run a module.
  }
}
