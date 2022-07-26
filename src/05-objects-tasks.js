/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  const r = {
    width,
    height,
    getArea() { return this.width * this.height; },
  };
  return r;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */


class CreateSelector {
  constructor() {
    this.settings = {
      element: null,
      id: null,
      class: [],
      attr: [],
      pseudoClass: [],
      pseudoElement: null,
    };

    this.positionsElements = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
    this.lastElement = '';
  }

  position(elPosition) {
    if (this.positionsElements.indexOf(elPosition) < this.positionsElements.indexOf(this.lastElement)) throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');

    if ((elPosition === 'element' || elPosition === 'id' || elPosition === 'pseudoElement') && this.positionsElements.indexOf(elPosition) === this.positionsElements.indexOf(this.lastElement)) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');

    this.lastElement = elPosition;
  }

  element(element) {
    this.position('element');
    this.settings.element = element;
    return this;
  }

  id(id) {
    this.position('id');
    this.settings.id = id;

    return this;
  }

  class(className) {
    this.position('class');
    this.settings.class.push(className);

    return this;
  }

  attr(attr) {
    this.position('attr');
    this.settings.attr.push(attr);

    return this;
  }

  pseudoClass(pseudoClass) {
    this.position('pseudoClass');
    this.settings.pseudoClass.push(pseudoClass);

    return this;
  }

  pseudoElement(pseudoElement) {
    this.position('pseudoElement');
    this.settings.pseudoElement = pseudoElement;

    return this;
  }

  stringify() {
    const d = this.settings;
    const before = ['', '#', '.', '[', ':', '::'];
    const after = ['', '', '', ']', '', ''];


    let str = '';
    for (let i = 0; i < before.length; i += 1) {
      const selec = Object.values(d)[i];
      let element = selec || [];
      if (!Array.isArray(element) && element != null) element = [element];

      str += element.reduce((prev, current) => prev + before[i] + current + after[i], '');
    }
    return str;
  }
}

function Combinator(selector1, combinator, selector2) {
  this.selectors = {
    s1: selector1,
    comb: combinator,
    s2: selector2,
  };
}

Combinator.prototype = {
  stringify() {
    return `${this.selectors.s1.stringify()} ${this.selectors.comb} ${this.selectors.s2.stringify()}`;
  },
};

const cssSelectorBuilder = {
  element(element) {
    return new CreateSelector().element(element);
  },

  id(id) {
    return new CreateSelector().id(id);
  },

  class(className) {
    return new CreateSelector().class(className);
  },

  attr(attr) {
    return new CreateSelector().attr(attr);
  },

  pseudoClass(pseudoClassName) {
    return new CreateSelector().pseudoClass(pseudoClassName);
  },

  pseudoElement(pseudoElementName) {
    return new CreateSelector().pseudoElement(pseudoElementName);
  },

  combine(selector1, combinator, selector2) {
    return new Combinator(selector1, combinator, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
