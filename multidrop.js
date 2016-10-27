(function (global) {

  function MultiDrop(selector, options) {
    this.selectElement = document.querySelector(selector);
    this.selectElement.style.display = 'none';
    this.multiSelectElement = null;
    this.menuFlag = null;
    this.listeners = {};
    var defaults = {
      placeholder: 'select options',
      csvDisplayCount: 2,
      csvDelimiter: ', ',
      selectBoxWidth: 160,
      menuWidth: 200
    };

    this.options = extend(defaults, options);

    buildDropDownMenu.call(this);
    setPreselectedOptions.call(this, this.selectElement);
    initializeEvents.call(this);
  }

  MultiDrop.prototype = {
    getSelected: function getSelected() {
      return getSelectedOptions(this.selectElement).map(function (item) {
        return item.selectValue;
      });
    },
    destroyEvents: function destroyEvents() {
      var selectBox = this.multiSelectElement.querySelector('.selectMenu');
      selectBox.removeEventListener('click', this.listeners.selectBoxClickHandler, false);
    }
  };

  function initializeEvents() {
    var dropdownMenu = this.multiSelectElement.querySelector('ul'),
        multiSelectElement = this.multiSelectElement,
        selectBox = this.multiSelectElement.querySelector('.selectMenu');

    this.listeners.selectBoxClickHandler = selectBoxClickHandler.bind(this);
    this.listeners.dropdownClickHandler = dropdownClickHandler.bind(this);
    this.listeners.documentClickHandler = documentClickHandler.bind(this);

    selectBox.addEventListener('click', this.listeners.selectBoxClickHandler, false);
    updatePlaceholderText.call(this);

    function selectBoxClickHandler() {
      if (hasClass(multiSelectElement, 'open')) {
        removeClass(multiSelectElement, 'open');
        dropdownMenu.removeEventListener('click', this.listeners.dropdownClickHandler, false);
        document.removeEventListener('click', this.listeners.documentClickHandler, false);
        this.menuFlag = false;
      } else {
        addClass(multiSelectElement, 'open');
        dropdownMenu.addEventListener('click', this.listeners.dropdownClickHandler, false);
        document.addEventListener('click', this.listeners.documentClickHandler, false);
        this.menuFlag = false;
      }
    }

    function documentClickHandler(event) {
      if (this.menuFlag) {
        if (parentWithClass(event.target, 'menulist-' + this.selectElement.name) === null) {
          removeClass(multiSelectElement, 'open');
          dropdownMenu.removeEventListener('click', this.listeners.dropdownClickHandler, false);
          document.removeEventListener('click', this.listeners.documentClickHandler, false);
        }
      }
      this.menuFlag = true;
    }

    function dropdownClickHandler(event) {
      var listItem = closestWithTag(event.target, 'li'),
          checkbox = listItem.querySelector('i');
      hasClass(checkbox, 'selected') ? removeClass(checkbox, 'selected') : addClass(checkbox, 'selected');
      toggleSelectedOptions.call(this, this.selectElement);
      updatePlaceholderText.call(this);
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
    var selectedValuesHtml = getSelectedFromHtml.call(this);
    for (var i = 0, length = element.length; i < length; i++) {
      element[i].selected = selectedValuesHtml.indexOf(element[i].innerHTML) >= 0;
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

  function buildDropDownMenu() {
    var multiSelectContainer, selectMenu, textBox,
        caret, optionsUL, optionsLI, checkbox, textWrapper;

    // create main container
    multiSelectContainer = document.createElement('div');
    multiSelectContainer.className = 'multiSelect multiSelect-' + this.selectElement.name;
    multiSelectContainer.setAttribute('tabindex', 0);
    multiSelectContainer.style.width = this.options.selectBoxWidth + 'px';

    this.multiSelectElement = multiSelectContainer;

    // create menu container
    selectMenu = document.createElement('div');
    selectMenu.className = 'selectMenu';
    selectMenu.style.width = this.options.selectBoxWidth + 'px';

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
    optionsUL.className = 'menulist-' + this.selectElement.name;
    optionsUL.style.width = this.options.menuWidth + 'px';

    for (var i = 0, length = this.selectElement.length; i < length; i++) {

      // insert content into LI tags
      optionsLI = document.createElement('li');
      checkbox = document.createElement('i');
      checkbox.className = 'checkbox';
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

    // append multi select container to DOM
    this.selectElement.parentElement.insertBefore(multiSelectContainer, this.selectElement);
    multiSelectContainer.appendChild(this.selectElement);
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

  function extend(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  }

  global.MultiDrop = MultiDrop;

})(window);