/*
 * MultiDrop: Enhances the select input field into a multiple option drop down list
 * By Hassan Hibbert <http://hassanhibbert.com/>
 * Copyright 2016 Hassan Hibbert, under the MIT License
 * <https://opensource.org/licenses/mit-license.php/>
 */

(function (global) {

  // Private variables
  var currentPosition = 0, instanceQueue = {};

  function MultiDrop(elementList, options) {

    // Array of dom elements
    elementList = getElementList(elementList);

    // Get element from array based on the `currentPosition` index
    this.selectElement = elementList[currentPosition];

    this.multiSelectElement = null;
    this.listeners = {};

    // default options
    var defaults = {
      placeholder: 'select options',
      csvDisplayCount: 2,
      csvDelimiter: ', ',
      onChangeHandler: null
    };

    this.options = extend(defaults, options);

    // Build and initialize widget
    buildDropDownMenu.call(this, true);
    setPreselectedOptions.call(this, this.selectElement);
    initializeEvents.call(this);
    this.selectElement.style.display = 'none';

    // Increment the `currentPosition` to check the next dom element in `elementList` array
    currentPosition++;

    if (elementList[currentPosition]) {

      // Recursively create instances
      var elementName = elementList[currentPosition].name;
      instanceQueue[elementName] = new MultiDrop(elementList, this.options);
    } else {

      // Reset `currentPosition` if there are no more dom elements in `elementList`
      currentPosition = 0;
    }

  }

  MultiDrop.prototype = {
    getSelected: function getSelected(selectElement) {

      selectElement = (instanceQueue[selectElement])
        ? instanceQueue[selectElement].selectElement
        : this.selectElement;

      return getSelectedOptions(selectElement).map(function (item) {
        return item.selectValue;
      });
    },

    destroyEvents: function () {

      var selectBox = this.multiSelectElement.querySelector('.selectMenu'),
          queueKeys = Object.keys(instanceQueue),
          currentSelectBox,
          _this;

      selectBox.removeEventListener('click', this.listeners.selectBoxClickHandler, false);
      this.multiSelectElement.removeEventListener('blur', this.listeners.multiBlurHandler, false);

      // Remove events for private instances
      if (queueKeys.length > 0) {
        for (var i = 0, length = queueKeys.length; i < length; i++) {

          _this = instanceQueue[queueKeys[i]];
          currentSelectBox = _this.multiSelectElement.querySelector('.selectMenu');

          if (this.selectElement.className === _this.selectElement.className) {
            currentSelectBox.removeEventListener('click', _this.listeners.selectBoxClickHandler, false);
            _this.multiSelectElement.removeEventListener('blur', _this.listeners.multiBlurHandler, false);
          }
        }
      }
    },
    rebuild: function rebuild() {
      var rebuiltSelectMenu = buildDropDownMenu.call(this, false),
          currentMenu = getElementList('.multiSelect-' + this.selectElement.name)[0];
      currentMenu.parentNode.replaceChild(rebuiltSelectMenu, currentMenu);
      setPreselectedOptions.call(this, this.selectElement);
      initializeEvents.call(this);
    }
  };

  // Expose globally
  global.MultiDrop = MultiDrop;

  function initializeEvents() {
    var dropdownMenu = this.multiSelectElement.querySelector('ul'),
        multiSelectElement = this.multiSelectElement,
        selectBox = this.multiSelectElement.querySelector('.selectMenu');

    // Set references to event listener functions
    this.listeners.selectBoxClickHandler = selectBoxClickHandler.bind(this);
    this.listeners.dropdownClickHandler = dropdownClickHandler.bind(this);
    this.listeners.multiBlurHandler = multiBlurHandler.bind(this);

    // Set listeners
    selectBox.addEventListener('click', this.listeners.selectBoxClickHandler, false);
    multiSelectElement.addEventListener('blur', this.listeners.multiBlurHandler, false);

    updatePlaceholderText.call(this);

    function multiBlurHandler() {
      removeClass(multiSelectElement, 'open');
      dropdownMenu.removeEventListener('click', this.listeners.dropdownClickHandler, false);
    }

    function selectBoxClickHandler() {
      if (hasClass(multiSelectElement, 'open')) {
        removeClass(multiSelectElement, 'open');
        dropdownMenu.removeEventListener('click', this.listeners.dropdownClickHandler, false);
      } else {
        addClass(multiSelectElement, 'open');
        dropdownMenu.addEventListener('click', this.listeners.dropdownClickHandler, false);
      }
    }

    function dropdownClickHandler(event) {
      var listItem = closestWithTag(event.target, 'li'),
          checkbox = listItem.querySelector('i');

      toggleClass(checkbox, 'selected');
      toggleSelectedOptions.call(this, this.selectElement);
      updatePlaceholderText.call(this);

      if (!this.selectElement.hasAttribute('multiple')) {
        removeClass(multiSelectElement, 'open');
        toggleClass(checkbox, 'selected');
        dropdownMenu.removeEventListener('click', this.listeners.dropdownClickHandler, false);
      }
    }

    function toggleClass(element, className) {
      hasClass(element, className) ? removeClass(element, className) : addClass(element, className);
    }

    function updatePlaceholderText() {
      var textArea = selectBox.querySelector('.text'),
          selectedOptions = getSelectedOptions(this.selectElement).map(function (item) {
            return item.content;
          });

      if (selectedOptions.length === 0) {
        textArea.innerHTML = this.options.placeholder;
        addClass(textArea, 'grey-text');
      } else if (this.options.csvDisplayCount === 0) {
        textArea.innerHTML = selectedOptions.join(this.options.csvDelimiter);
        removeClass(textArea, 'grey-text');
      } else if (selectedOptions.length <= this.options.csvDisplayCount) {
        textArea.innerHTML = selectedOptions.join(this.options.csvDelimiter);
        removeClass(textArea, 'grey-text');
      } else  if (selectedOptions.length >= this.options.csvDisplayCount) {
        textArea.innerHTML = selectedOptions.length + ' selected';
      }
    }
  }

  function setPreselectedOptions(element) {
    var optionValue,
        elementList = this.multiSelectElement.querySelectorAll('ul li'),
        selectedOptions = getSelectedOptions(element).map(function (item) {
          return item.content;
        });

    for (var i = 0, length = element.length; i < length; i++) {
      optionValue = elementList[i].querySelector('span').innerHTML;
      if (selectedOptions.indexOf(optionValue) >= 0) {
        addClass(elementList[i].querySelector('.checkbox'), 'selected');
      }
    }
  }

  function toggleSelectedOptions(element) {
    var selectedValuesHtml = getSelectedFromHtml.call(this), selected;

    for (var i = 0, length = element.length; i < length; i++) {
      selected = selectedValuesHtml.indexOf(element[i].innerHTML) >= 0;
      element[i].selected = selected;

      if (selected) {
        element[i].setAttribute('selected', 'selected');
      } else {
        element[i].removeAttribute('selected');
      }
    }

    if (isFunction(this.options.onChangeHandler)) {
      this.options.onChangeHandler(this.getSelected());
    }
  }

  function getSelectedFromHtml() {
    var elementList = this.multiSelectElement.querySelectorAll('ul li'),
        selectedValues = [];

    for (var i = 0, length = elementList.length; i < length; i++) {
      if (hasClass(elementList[i].querySelector('.checkbox'), 'selected')) {
        selectedValues.push(elementList[i].querySelector('span').innerHTML);
      }
    }
    return selectedValues;
  }

  function getSelectedOptions(element) {
    var selectedOptions = [];
    for (var i = 0, length = element.length; i < length; i++) {
      if (element[i].selected) {
        selectedOptions.push({
          content: element[i].innerHTML,
          selectValue: element[i].value
        });
      }
    }
    return selectedOptions;
  }

  function buildDropDownMenu(appendToDom) {
    var multiSelectContainer, selectMenu, textBox,
        caret, optionsUL, optionsLI, checkbox, textWrapper;

    // create main container
    multiSelectContainer = document.createElement('div');
    multiSelectContainer.className = 'multiSelect multiSelect-' + this.selectElement.name;
    multiSelectContainer.setAttribute('tabindex', 0);

    this.multiSelectElement = multiSelectContainer;

    // create menu container
    selectMenu = document.createElement('div');
    selectMenu.className = 'selectMenu clearfix';

    // create wrapper for text
    textBox = document.createElement('span');
    textBox.className = 'text';

    // create caret element
    caret = document.createElement('i');
    caret.className = 'arrow';

    // append textbox & caret to select area
    selectMenu.appendChild(textBox);
    selectMenu.appendChild(caret);

    // create UL
    optionsUL = document.createElement('ul');
    optionsUL.className = 'menulist-' + this.selectElement.name + ' menulist';

    for (var i = 0, length = this.selectElement.length; i < length; i++) {

      // insert content into LI tags
      optionsLI = document.createElement('li');
      checkbox = document.createElement('i');
      checkbox.className = this.selectElement.hasAttribute('multiple') ? 'checkbox' : 'checkbox hide-checkbox';
      textWrapper = document.createElement('span');
      textWrapper.innerHTML = this.selectElement[i].innerHTML;

      // append list items to UL
      optionsLI.appendChild(checkbox);
      optionsLI.appendChild(textWrapper);
      optionsUL.appendChild(optionsLI);
    }

    // append list & select area to multi select container
    multiSelectContainer.appendChild(selectMenu);
    multiSelectContainer.appendChild(optionsUL);


    if (appendToDom) {

      // append multi select container to DOM
      this.selectElement.parentElement.insertBefore(multiSelectContainer, this.selectElement);
      multiSelectContainer.appendChild(this.selectElement);

    } else {
      multiSelectContainer.appendChild(this.selectElement);
      return multiSelectContainer;
    }


  }

  function hasClass(element, className) {
    return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
  }

  function closestWithTag(element, tagName) {
    tagName = tagName.toUpperCase();
    while (element !== document.body) {
      if (element.tagName === tagName) return element;
      element = element.parentNode;
      if (element.tagName === tagName) return element;
    }
    return null;
  }

  function parentWithClass(element, className) {
    var htmlTag = document.getElementsByTagName("HTML")[0];
      while (element !== htmlTag) {
        if (element) {
        element = element.parentNode;
        if (hasClass(element, className)) return element;
      }
    }
    return null;
  }

  function addClass(element, className) {
    if (element.className.indexOf(className) === -1) {
      if (element.className != '') {
        className = ' ' + className;
      }
      element.className += className;
    }
  }

  function removeClass(element, className) {
    if (element.className.indexOf(className) != -1) {
      var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
      element.className = element.className.replace(rxp, ' ').trim();
    }
  }

  function isFunction(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  }

  function getElementList(elements) {
    if (typeof elements === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(elements));
    } else if (typeof elements === 'undefined' || elements instanceof Array) {
      return elements;
    } else {
      return [elements];
    }
  }

  function extend(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

})(window);