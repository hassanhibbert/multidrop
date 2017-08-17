(function () {

  // Shortcuts
  var ObjectAssign = Object.assign;

  var Extend = (source, object) => ObjectAssign(source, Object.create(object));

  var Helpers = {
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
})();