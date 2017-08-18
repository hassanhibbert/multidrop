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
    removeClass(element, className) {
      if (element.className.indexOf(className) != -1) {
        var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(rxp, ' ').trim();
      }
    },
    addClass(element, className) {
      if (element.className.indexOf(className) === -1) {
        if (element.className != '') className = ` ${className}`;
        element.className += className;
      }
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

  var UserInterface = Extend(Helpers, {});

  var BuildMultiDropMenu = Extend();

  var MultiDrop = Extend(BuildMultiDropMenu, {});

  function setupMultiDrop(elements = null, options = {}) {
    var context = Object.create(MultiDrop);

    var defaults = {
      placeholder: 'select options',
      csvDisplayCount: 2,
      csvDelimiter: ', ',
      onChangeHandler: null
    };

    context.options = ObjectAssign(defaults, options);
    context.elements = context.getElementList(elements);

    return context;
  }
})();