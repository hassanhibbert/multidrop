(function () {

  // Export module
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = setupValidateManager;
    }
    exports.MultiDrop = setupMultiDrop;
  } else if (typeof window !== 'undefined') {
    window.MultiDrop = setupMultiDrop;
  }

  // Shortcut variables
  var ObjectAssign = Object.assign;
  var ObjectKeys = Object.keys;
  var objProto = Object.prototype;
  var toString = objProto.toString;
  var hasOwn = objProto.hasOwnProperty;
  var doc = document;

  var Extend = (source, object) => ObjectAssign(source, Object.create(object));

  var Helpers = {
    isFunction(obj) {
      return toString.call(obj) === '[object Function]';
    },
    getElementList(elements) {
      if (typeof elements === 'string') {
        return [...elements];
      } else if (typeof elements === 'undefined' || elements instanceof Array) {
        return elements;
      } else {
        return [elements];
      }
    }
  };

  var UserInterface = Extend();

  function setupMultiDrop() {}
})();