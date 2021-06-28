/**
 * A simple ImageSelector like a standard HTML DropDown Selector but
 * with support of using Images/Icons.
 *
 * @link https://github.com/DenisHannig
 * @author Denis Hannig
 * @version 1.0.0
 * @name ImageSelector
 * @since  06-23-2021
 */

/**
 * @type {{
       onSelectListeners: {},
       init: ImageSelector.init,
       setSelectedIndex: ImageSelector.setSelectedIndex,
       setSelectedOptionById: ImageSelector.setSelectedOptionById,
       setSelectedOption: ImageSelector.setSelectedOption,
       setOnSelectListener: ImageSelector.setOnSelectListener,
       getItemCount: (function(HTMLElement|{}): number),
       getCurrentSelected: (function(HTMLElement|{}): HTMLElement | string),
       getCurrentSelectedIndex: (function(HTMLElement|{}): number),
       getIndexOf: (function(HTMLElement): number),
       setupEventListeners: ImageSelector.setupEventListeners,
       collapseAllImageSelectors: ImageSelector.collapseAllImageSelectors,
       template: (function(string | HTMLElement): string | HTMLElement),
       createOption: (function(string, string, string): string | HTMLElement),
       createOptionBeforeInit: (function(string, string, string): string | HTMLElement),
       addOptionItems: ImageSelector.addOptionItems
  }}
 */
var ImageSelector = {

    onSelectListeners: {},

    /**
     * Initialize one or multiple selectors.
     *
     * @param selectors { HTMLElement | [HTMLElement] | {} }
     */
    init: function (selectors) {
        imageSelectorHelper.each(selectors, function (index, selector) {
            var allOptions = imageSelectorHelper.findAllOptions(selector);
            var options = "";
            imageSelectorHelper.each(allOptions, function (index, child) {
                var id = child.id || "";
                var title = child.hasAttribute("title") ? child.getAttribute("title") : "";
                var image = child.hasAttribute("image") ? child.getAttribute("image") : null;
                var option = ImageSelector.createOption(id, title, image);
                options += option;
            });

            var template = ImageSelector.template(options);
            imageSelectorHelper.html(selector, template);

            if (!selector.getAttribute("id")) {
                selector.setAttribute("id", "image-selector-" + index);
            }
            if (ImageSelector.getItemCount(selector) > 0) {
                selector.systemCall = true;
                ImageSelector.setSelectedIndex(selector, 0);
            }

            ImageSelector.setupEventListeners(selector);

        });
    },

    /**
     * Set the selected option by a given selector parent and a given index number.
     *
     * @param selector { HTMLElement | {} }
     * @param index { number }
     */
    setSelectedIndex: function (selector, index) {
        var options = imageSelectorHelper.findAllOptions(selector);
        if (options && options.length > 0 && index <= options.length) {
            options[index].systemCall = selector.systemCall === true;
            ImageSelector.setSelectedOption(options[index]);
            selector.systemCall = undefined;
        } else {
            throw new Error('Options index out of range for index [' + index + ']. (Available items [imageSelectorHelper{options.length}]');
        }
    },

    /**
     * Set the selected option by a given selector parent and a given option.
     *
     * @param selector { HTMLElement | {} }
     * @param id { string }
     */
    setSelectedOptionById: function (selector, id) {
        selector.systemCall = selector.systemCall !== undefined;

        var option = imageSelectorHelper.findOptionById(selector, id);
        if (option) {
            option.systemCall = selector.systemCall;
            ImageSelector.setSelectedOption(option);
        }
    },

    /**
     * Set the selected option by a given option (automatically uses the parent selector).
     *
     * @param option { HTMLElement | {} }
     */
    setSelectedOption: function (option) {
        option.systemCall = option.systemCall !== undefined;

        var selector = imageSelectorHelper.findClosestSelector(option);
        var selectorId = selector.getAttribute("id");
        var selectorSelection = imageSelectorHelper.findCurrentSelection(selector);
        var selectedOption = document.createElement("span");
        selectedOption.classList.add("image-selector-selection");
        selectedOption.innerHTML = option.innerHTML;
        selectedOption.id = option.getAttribute("id");
        var valueToSet = selector.hasAttribute("idAsSelectedText") ? selectedOption.id.toUpperCase() : selectedOption.title;
        imageSelectorHelper.text(selectedOption.querySelector(".image-selector-option-text"), valueToSet);
        selectorSelection.outerHTML = selectedOption.outerHTML;

        if (this.onSelectListeners[selectorId] && option.systemCall !== true) {
            var index = ImageSelector.getIndexOf(option);
            this.onSelectListeners[selectorId](index, option);
        }
        option.systemCall = undefined;
    },

    /**
     * Set the OnSelectListener.
     *
     * @param selector { HTMLElement | {} }
     * @param eventListener { Function }
     * @param replace { boolean | null }
     */
    setOnSelectListener: function (selector, eventListener, replace) {
        if (imageSelectorHelper.isFunction(eventListener)) {
            var selectorId = selector.getAttribute("id");
            if (ImageSelector.onSelectListeners[selectorId]) {
                if (replace === true) {
                    ImageSelector.onSelectListeners[selectorId] = eventListener;
                }
            } else {
                ImageSelector.onSelectListeners[selectorId] = eventListener;
            }
        }
    },

    /**
     * Get the number of options for a given selector parent.
     *
     * @param selector { HTMLElement | {} }
     * @return { number }
     */
    getItemCount: function (selector) {
        if (!selector) return -1;

        var allOptions = imageSelectorHelper.findAllOptions(selector);
        return allOptions.length;
    },

    /**
     * Get the current selected selector option.
     *
     * @param selector { HTMLElement | {} }
     * @return { HTMLElement | {} | null }
     */
    getCurrentSelected: function (selector) {
        var currentSelected = imageSelectorHelper.findCurrentSelection(selector);
        if (currentSelected) {
            var currentSelectedId = currentSelected.getAttribute("id");
            return imageSelectorHelper.findOptionsList(selector).querySelector('.image-selector-option[id="' + currentSelectedId + '"]');
        }
        return null;
    },

    /**
     * Get the index of the current selected selector option.
     *
     * @param selector { HTMLElement | {} }
     * @return { number }
     */
    getCurrentSelectedIndex: function (selector) {
        var currentSelectedOption = ImageSelector.getCurrentSelected(selector);
        if (currentSelectedOption) {
            return ImageSelector.getIndexOf(currentSelectedOption);
        }
        return -1;
    },

    /**
     * Get the index of a given options Item.
     *
     * @param option { HTMLElement }
     * @return { number }
     */
    getIndexOf: function (option) {
        var index = -1;
        var selector = imageSelectorHelper.findClosestSelector(option);
        if (option && selector) {
            var allOptions = imageSelectorHelper.findAllOptions(selector);
            imageSelectorHelper.each(allOptions, function (idx, opt) {
                if (option.id === opt.id) {
                    index = idx;
                }
            });
            return index;
        }
    },

    /**
     * Setup default event listeners.
     *
     * @param imageSelectors { HTMLElement | [HTMLElement] | {} }
     */
    setupEventListeners: function (imageSelector) {
        var optionsList = imageSelectorHelper.findOptionsList(imageSelector);

        imageSelectorHelper.offOn("mouseup", imageSelector.querySelector(".image-selector"), function (event) {
            event.stopPropagation();
            imageSelectorHelper.toggleClass(imageSelector, "expanded", !ImageSelector.isExpanded(imageSelector));

            if (optionsList) {
                var out = imageSelectorHelper.isOutOfViewport(optionsList, true);
                if (out.top === true) {
                    optionsList.style.top = 0;
                }
                if (out.right === true) {
                    optionsList.style.right = 0;
                }
                if (out.bottom === true) {
                    optionsList.style.bottom = 0;
                }
                if (out.left === true) {
                    optionsList.style.left = 0;
                }
            }
        });

        var optionsList = imageSelectorHelper.findOptionsList(imageSelector);

        imageSelectorHelper.offOn("mouseleave", imageSelector, function (event) {
            if (!ImageSelector.isExpanded(imageSelector)) return;
            event.stopPropagation();
            ImageSelector.collapseAllImageSelectors();
            if (optionsList) {
                var out = imageSelectorHelper.isOutOfViewport(optionsList, true);
            }
        });

        imageSelectorHelper.offOn("mouseup", imageSelectorHelper.findAllOptions(imageSelector), function (event) {
            event.stopPropagation();
            ImageSelector.setSelectedOption(this);
            ImageSelector.collapseAllImageSelectors();
        });
    },

    /**
     *
     * @param imageSelector { HTMLElement }
     * @return boolean
     */
    isExpanded: function (imageSelector) {
        return imageSelector.classList.contains("expanded");
    },

    /**
     * Collapsing all existing ImageSelector items.
     */
    collapseAllImageSelectors: function () {
        var imageSelectors = imageSelectorHelper.findAllImageSelectors();
        imageSelectorHelper.toggleClass(imageSelectors, "expanded", false);
    },

    /**
     * ImageSelector HTML Template.
     *
     * @template image-selector
     * @param options {string | HTMLElement}
     * @return { string | HTMLElement }
     */
    template: function (options) {
        return '<style>' +
            '   image-selector {' +
            '	   display: block;' +
            '	   margin: auto;' +
            '	   font-size: 12px;' +
            '   }' +
            '   .image-selector {' +
            '	   min-width: 40px;' +
            '	   height: auto;' +
            '	   background-color: #f0f0f0;' +
            '	   border-radius: 4px;' +
            '	   display: flex;' +
            '	   flex-direction: row;' +
            '	   border: 1px solid #c5c5c5;' +
            '   }' +
            '   .image-selector:hover {' +
            '	   cursor: pointer;' +
            '   }' +
            '   .image-selector.disabled:hover {' +
            '	   cursor: default;' +
            '   }' +
            '   .image-selector-selection-image {' +
            '	   width: 18px;' +
            '	   height: 18px;' +
            '	   flex: none;' +
            '   }' +
            '   .image-selector-selection-text {' +
            '	   text-overflow: ellipsis;' +
            '	   overflow: hidden;' +
            '	   margin: auto;' +
            '	   min-height: 18px;' +
            '   }' +
            '   .image-selector-selection {' +
            '	   width: auto;' +
            '	   min-width: 40px;' +
            '	   height: auto;' +
            '	   display: flex;' +
            '	   flex: auto;' +
            '	   margin: auto;' +
            '	   padding: 4px 10px;' +
            '	   line-height: normal;' +
            '	   white-space: nowrap;' +
            '	   overflow: hidden;' +
            '	   text-overflow: ellipsis;' +
            '	   user-select: none;' +
            '   }' +
            '   .image-selector-arrow {' +
            '	   width: 18px;' +
            '	   height: 18px;' +
            '	   margin: auto;' +
            '	   flex: none;' +
            '	   border-left: 1px solid #c5c5c5;' +
            '	   background-size: 50% auto;' +
            '	   background-position: center;' +
            '	   background-repeat: no-repeat;' +
            '   }' +
            '	' +
            '   image-selector:not(.expanded):hover .image-selector-arrow {' +
            '	   background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiM4MDgwODAiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDEwMCwwIDUwLDUwIj48L3BvbHlnb24+PC9zdmc+");' +
            '   }' +
            '   image-selector:not(.expanded) .image-selector-arrow {' +
            '	   background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiUyMzgwODA4MCI+PHBvbHlnb24gcG9pbnRzPSIwLDAgMTAwLDAgNTAsNTAiPjwvcG9seWdvbj48L3N2Zz4=");' +
            '   }' +
            '	' +
            '   image-selector.expanded:hover .image-selector-arrow {' +
            '	   background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nNTAnIGZpbGw9JyM4MDgwODAnPjxwb2x5Z29uIHBvaW50cz0nNTAsMCAxMDAsNTAgMCw1MCcvPjwvc3ZnPg==");' +
            '   }' +
            '   image-selector.expanded .image-selector-arrow {' +
            '	   background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAnIGhlaWdodD0nNTAnIGZpbGw9JyM1MDUwNTAnPjxwb2x5Z29uIHBvaW50cz0nNTAsMCAxMDAsNTAgMCw1MCcvPjwvc3ZnPg==");' +
            '   }' +
            '   /* LIST */' +
            '   .image-selector-options-list {' +
            '	   position: fixed;' +
            '	   z-index: 599;' +
            '	   height: auto;' +
            '	   max-height: 300px;' +
            '	   margin-top: -1px;' +
            '	   background-color: #f8f8f8;' +
            '	   border: 1px solid #c5c5c5;' +
            '	   border-radius: 4px;' +
            '	   display: none;' +
            '	   overflow: auto;' +
            '   }' +
            '   image-selector.expanded .image-selector-options-list {' +
            '	   display: block;' +
            '   }' +
            '   .image-selector-option {' +
            '	   width: auto;' +
            '	   min-width: 40px;' +
            '	   height: auto;' +
            '	   display: flex;' +
            '	   flex: auto;' +
            '	   margin: auto;' +
            '	   padding: 4px 10px;' +
            '	   line-height: normal;' +
            '	   white-space: nowrap;' +
            '	   user-select: none;' +
            '	   cursor: pointer;' +
            '   }' +
            '   .image-selector-option:hover {' +
            '	   background-color: #f0f0f0;' +
            '   }' +
            '   .image-selector-option-image {' +
            '	   width: 18px;' +
            '	   height: 18px;' +
            '	   flex: none;' +
            '	   margin-top: auto;' +
            '	   margin-bottom: auto;' +
            '   }' +
            '   .image-selector-option-text {' +
            '	   margin: auto auto auto 0;' +
            '	   line-height: 18px;' +
            '   }' +
            '   .image-selector-css-hidden {' +
            '       display: none !important;' +
            '   }' +
            '   .image-selector-css-mr-10 {' +
            '       margin-right: 10px;' +
            '   }' +
            '</style>' +
            '<div class="image-selector">' +
            '   <span class="image-selector-selection">' +
            '	   <div class="image-selector-option-image"></div>' +
            '	   <span class="image-selector-selection-text"></span>' +
            '   </span>' +
            '   <div class="image-selector-arrow"></div>' +
            '</div>' +
            '<span class="image-selector-options-list">' +
            '	 ' + options +
            '</span>';
    },

    /**
     * Create a single Option Item which can be used for ImageSelectors after initialization.
     *
     * @param id { string }
     * @param title { string | null }
     * @param image { string | null }
     * @return { HTMLElement | string }
     */
    createOption: function (id, title, image) {
        return '<div class="image-selector-option" id="' + id + (title ? ('" title="' + title) : '') + (image ? ('" image="' + image) : '') + '">' +
            (image ? ('    <img class="image-selector-option-image ' + (title ? 'image-selector-css-mr-10' : '') + '" src="' + image + '" alt="' + id.toUpperCase() + '" onerror="this.style.opacity=\'0\'"/>') : '') +
            '    <span class="image-selector-option-text ' + (title ? '' : 'image-selector-css-hidden ') + '">' + title + '</span>' +
            '</div>';
    },

    /**
     * Create a single Option Item which can be used for ImageSelectors befor initialization.
     *
     * @param id { string }
     * @param title { string | null }
     * @param image { string | null }
     * @return { HTMLElement | string }
     */
    createOptionBeforeInit: function (id, title, image) {
        return '<image-option id="' + id + (title ? ('" title="' + title) : '') + (image ? ('" image="' + image) : '') + '"></image-option>';
    },

    /**
     * Add given options to a given selector parent.
     * This should contain a string which contain all options to provide.
     *
     * @param selector { HTMLElement | {} }
     * @param options { [HTMLElement] | string }
     */
    addOptionItems: function (selector, options) {
        imageSelectorHelper.html(selector, options);
        ImageSelector.init([selector]);
    },
};

document.addEventListener("DOMContentLoaded", function (event) {
    /**
     * Initial call to setup all <image-selector /> tags.
     */
    (function () {
        ImageSelector.init(imageSelectorHelper.findAllImageSelectors());
    })();
});

/**
 * Helper
 *
 * @type {{
        isOutOfViewport: (function(HTMLElement, boolean): {}),
        isFunction: (function(*)),
        each: _ImageSelectorHelper.each,
        eventsHandler: _ImageSelectorHelper.eventsHandler,
        off: _ImageSelectorHelper.off,
        on: _ImageSelectorHelper.on,
        offOn: _ImageSelectorHelper.offOn,
        toggleClass: _ImageSelectorHelper.toggleClass,
        html: ((function(HTMLElement, string): (string|null))|*),
        text: ((function(HTMLElement, string): (string|null))|*),
        findAllImageSelectors: (function(): NodeListOf<HTMLElement>),
        findAllOptions: (function(HTMLElement): NodeListOf<Element>|NodeListOf<Element>|null),
        findOptionById: (function(HTMLElement, string): NodeListOf<Element>|Element|null),
        findClosestSelector: ((function(HTMLElement): HTMLElement)|*),
        findOptionsList: (function(HTMLElement): Element|null),
        findCurrentSelection: (function(HTMLElement): HTMLElement)
    }}
 * @private
 */
var _ImageSelectorHelper = new function () {
    return {
        /**
         * Check whether an Element hits the browser viewport bound.
         *
         * @param element { HTMLElement }
         * @param resetTopRightBottomLeft { boolean }
         * @return { {} }
         */
        isOutOfViewport: function (element, resetTopRightBottomLeft) {
            var bounding = element.getBoundingClientRect();
            var out = {};
            out.top = bounding.top < 0;
            out.left = bounding.left < 0;
            out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
            out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
            out.any = out.top || out.left || out.bottom || out.right;
            out.all = out.top && out.left && out.bottom && out.right;
            if (resetTopRightBottomLeft) {
                element.style.top = "";
                element.style.right = "";
                element.style.bottom = "";
                element.style.left = "";
            }
            return out;
        },
        /**
         * Check whether a given 'object' is a Function or not.
         *
         * @param obj { * }
         * @return { boolean }
         */
        isFunction: function (obj) {
            return (obj && typeof obj === 'function')
        },
        /**
         * Toggle a given Class of a given Element.
         *
         * @param elems { HTMLElement | [HTMLElement] }
         * @param clazz { string }
         * @param state { boolean }
         */
        toggleClass: function (elems, clazz, state) {
            if (elems && elems.length && elems.length > 0) {
                imageSelectorHelper.each(elems, function (index, elem) {
                    if (state) {
                        if (!elem.classList.contains(clazz))
                            elem.classList.add(clazz);
                    } else {
                        elem.classList.remove(clazz);
                    }
                });
            } else if (elems && elems.classList) {
                if (state) {
                    if (!elems.classList.contains(clazz))
                        elems.classList.add(clazz);
                } else {
                    elems.classList.remove(clazz);
                }
            }
        },
        /**
         * Loop through a given list of Elements.
         * A callback Function will be called which has an index and
         * a single Element as parameters.
         *
         * @param elems { [HTMLElement|*] }
         * @param callback { Function }
         */
        each: function (elems, callback) {
            if (elems && typeof callback === 'function') {
                for (var index = 0; index < elems.length; index++) {
                    callback(index, elems[index]);
                }
            }
        },
        /**
         * Helper function for setting and removing Event Listeners.
         *
         * @param method { * }
         * @param events { string }
         * @param elems { [HTMLElement] }
         * @param listener { function }
         */
        eventsHandler: function (method, events, elems, listener) {
            if (elems && !Array.isArray(elems) && !NodeList.prototype.isPrototypeOf(elems)) {
                var array = [];
                array.push(elems);
                elems = array;
            }
            var allEvents = events.split(' ');
            imageSelectorHelper.each(allEvents, function (index, singleEvent) {
                imageSelectorHelper.each(elems, function (index, el) {
                    if (method === "addEventListener") {
                        if (el.attachEvent) {
                            el['e' + singleEvent + listener] = listener;
                            el[singleEvent + listener] = function () {
                                el['e' + singleEvent + listener](window.event);
                            }
                            el.attachEvent('on' + singleEvent, el[singleEvent + listener]);
                        } else {
                            el.addEventListener(singleEvent, listener, false);
                        }
                    } else if (method === "removeEventListener") {
                        if (el.detachEvent) {
                            el['e' + singleEvent + listener] = listener;
                            el[singleEvent + listener] = function () {
                                el['e' + singleEvent + listener](window.event);
                            }
                            el.attachEvent('on' + singleEvent, el[singleEvent + listener]);
                        } else {
                            el.removeEventListener(singleEvent, listener, false);
                        }
                    }
                });
            });
        },
        /**
         * Remove an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        off: function (events, elem, listener) {
            this.eventsHandler("removeEventListener", events, elem, listener);
        },
        /**
         * Set an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        on: function (events, elem, listener) {
            this.eventsHandler("addEventListener", events, elem, listener);
        },
        /**
         * Reset an Event Listener for a given Element.
         *
         * @param events { string }
         * @param elem { HTMLElement | [HTMLElement] }
         * @param listener { function }
         */
        offOn: function (events, elem, listener) {
            this.off(events, elem, listener)
            this.on(events, elem, listener)
        },
        /**
         * Set or get the inner HTML value of a given Element.
         *
         * @param elem { HTMLElement }
         * @param html { string }
         * @return { string | null }
         */
        html: function (elem, html) {
            if (html)
                elem.innerHTML = html;
            else
                return elem.innerHTML;
        },
        /**
         * Set or get the inner Text value of a given Element.
         *
         * @param elem { HTMLElement }
         * @param text { string }
         * @return { string | null }
         */
        text: function (elem, text) {
            if (text)
                elem.innerText = text;
            else
                return elem.innerText;
        },
        /**
         * Find all ImageSelector Elements in the document.
         *
         * @returns { NodeListOf<HTMLElement> | [HTMLElement] }
         */
        findAllImageSelectors: function () {
            return document.querySelectorAll("image-selector");
        },
        /**
         * Find all Options of a given ImageSelector.
         *
         * @param elem { HTMLElement }
         * @returns { NodeListOf<HTMLElement>|[HTMLElement]|null }
         */
        findAllOptions: function (elem) {
            if (!elem) return null;
            var opt = elem.querySelectorAll("image-option");
            opt = ((opt && opt.length > 0) ? opt : elem.querySelectorAll(".image-selector-option"));
            return opt;
        },
        /**
         * Find an Options by the Options ID of a given ImageSelector.
         *
         * @param elem { HTMLElement }
         * @param id { string }
         * @returns { HTMLElement|null }
         */
        findOptionById: function (elem, id) {
            if (!elem) return null;
            var opt = elem.querySelectorAll('image-option[id="' + id + '"]');

            opt = ((opt && opt.length > 0) ? opt : elem.querySelector('.image-selector-option[id="' + id + '"]'));
            if (opt && opt.length > 0) {
                opt = opt[0];
            }
            return opt;
        },
        /**
         * Find the parent ImageSelector of a given Options Element.
         *
         * @param option { HTMLElement }
         * @returns { HTMLElement }
         */
        findClosestSelector: function (option) {
            if (option && option.tagName.toLowerCase() === 'image-selector') {
                return option;
            } else if (option && option.parentNode) {
                return this.findClosestSelector(option.parentNode);
            }
        },
        /**
         * Find the list of Options of a given ImageSelector.
         *
         * @param elem { HTMLElement }
         * @returns { HTMLElement | null }
         */
        findOptionsList: function (elem) {
            var o = elem.querySelectorAll('.image-selector-options-list');
            return o.length > 0 ? o[0] : null;
        },
        /**
         * Find the current Selection of a given ImageSelector.
         *
         * @param elem { HTMLElement }
         * @returns { HTMLElement }
         */
        findCurrentSelection: function (elem) {
            return elem.querySelector(".image-selector-selection");
        }
    };
};
var imageSelectorHelper = _ImageSelectorHelper;
