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
        var children = $(selectors.find("image-option"));
        var options = "";
        $.each(children, function (index, child) {
            var id = child.id || "";
            var title = child.getAttribute("title") || "";
            var image = child.getAttribute("image") || "";
            var option = ImageSelector.createOption(id, title, image);
            options += option;
        });
        selectors.html(ImageSelector.template(options));


        $.each(selectors, function (index, imageSelector) {
            if (!imageSelector.getAttribute("id")) {
                imageSelector.setAttribute("id", "image-selector-" + index);
            }
            if (ImageSelector.getItemCount(imageSelector) > 0) {
                imageSelector.systemCall = true;
                ImageSelector.setSelectedIndex(imageSelector, 0);
            }
        });

        ImageSelector.setupEventListeners(selectors);
    },

    /**
     * Set the selected option by a given selector parent and a given index number.
     *
     * @param selector { HTMLElement | {} }
     * @param index { number }
     */
    setSelectedIndex: function (selector, index) {
        var options = $(selector).find(".image-selector-options-list").find(".image-selector-option");
        if (options && options.length > 0 && index <= options.length) {
            options[index].systemCall = selector.systemCall === true;
            ImageSelector.setSelectedOption(options[index]);
            selector.systemCall = undefined;
        } else {
            throw new Error('Options index out of range for index [' + index + ']. (Available items [${options.length}]');
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

        var option = $(selector).find(".image-selector-options-list").find('.image-selector-option[id="' + id + '"]');
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
        if (option.length <= 0) return;

        option.systemCall = option.systemCall !== undefined;

        var selector = $($(option).closest("image-selector"));
        var selectorSelection = selector.find(".image-selector-selection");
        var selectedOption = document.createElement("span");
        selectedOption.classList.add("image-selector-selection");
        selectedOption.innerHTML = $(option)[0].innerHTML;
        selectedOption.id = $(option)[0].getAttribute("id");
        $(selectedOption).find(".image-selector-option-text").text(selectedOption.id.toUpperCase());
        selectorSelection[0].outerHTML = selectedOption.outerHTML;

        if (this.onSelectListeners[selector] && option.systemCall !== true) {
            var index = ImageSelector.getIndexOf(option);
            this.onSelectListeners[selector](index, option);
            option.systemCall = undefined;
        }
    },

    /**
     * Set the OnSelectListener.
     *
     * @param selector { HTMLElement | {} }
     * @param eventListener { Function }
     * @param replace { boolean? }
     */
    setOnSelectListener: function (selector, eventListener, replace) {
        if ($.isFunction(eventListener)) {
            if (ImageSelector.onSelectListeners[selector]) {
                if (replace === true) {
                    ImageSelector.onSelectListeners[selector] = eventListener;
                }
            } else {
                ImageSelector.onSelectListeners[selector] = eventListener;
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
        var itemCount = $(selector).find(".image-selector-options-list").find(".image-selector-option").length;
        return itemCount + 0;
    },

    /**
     * Get the current selected selector option.
     *
     * @param selector { HTMLElement | {} }
     * @return { HTMLElement | {} }
     */
    getCurrentSelected: function (selector) {
        var currentSelected = $(selector).find(".image-selector-selection");
        var currentSelectedId = currentSelected.attr("id");
        return $(selector).find(".image-selector-options-list").find('.image-selector-option[id="' + currentSelectedId + '"]');
    },

    /**
     * Get the index of the current selected selector option.
     *
     * @param selector { HTMLElement | {} }
     * @return { number }
     */
    getCurrentSelectedIndex: function (selector) {
        var currentSelectedOption = ImageSelector.getCurrentSelected(selector);
        return ImageSelector.getIndexOf(currentSelectedOption);
    },

    /**
     * Get the index of a given options Item.
     *
     * @param option { HTMLElement }
     * @return { number }
     */
    getIndexOf: function (option) {
        var option = $(option);
        var selector = $($(option).closest("image-selector"));
        if (option && option.length > 0 && selector && selector.length > 0)
            return $(option).index();
    },

    /**
     * Setup default event listeners.
     *
     * @param imageSelectors { HTMLElement | [HTMLElement] | {} }
     */
    setupEventListeners: function (imageSelectors) {
        $(imageSelectors).offOn("click", function (event) {
            event.stopPropagation();
            if (this.classList.contains("expanded")) {
                this.classList.remove("expanded");
            } else {
                this.classList.add("expanded");
            }

            var optionsList = $($(imageSelectors).find(".image-selector-options-list"));
            if (optionsList && optionsList.length > 0) {
                var out = ImageSelectorHelperIsOutOfViewport(optionsList[0]);
                optionsList.css("top", "");
                optionsList.css("right", "");
                optionsList.css("bottom", "");
                optionsList.css("left", "");
                if (out.top === true) {
                    optionsList.css("top", 0);
                }
                if (out.right === true) {
                    optionsList.css("right", 0);
                }
                if (out.bottom === true) {
                    optionsList.css("bottom", 0);
                }
                if (out.left === true) {
                    optionsList.css("left", 0);
                }
            }
        });

        $(imageSelectors.find(".image-selector-options-list")).offOn("mouseleave", function (event) {
            event.stopPropagation();
            ImageSelector.collapseAllImageSelectors();
        });

        $(imageSelectors.find(".image-selector-option")).offOn("mouseup", function (event) {
            event.stopPropagation();
            ImageSelector.setSelectedOption($(this));
            ImageSelector.collapseAllImageSelectors();
        });
    },

    /**
     * Collapsing all existing ImageSelector items.
     */
    collapseAllImageSelectors: function () {
        $("image-selector").toggleClass("expanded", false);
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
            '	   margin: auto;' +
            '	   font-size: 12px;' +
            '   }' +
            '   .image-selector {' +
            '	   min-width: 40px;' +
            '	   height: auto;' +
            '	   min-height: 18px;' +
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
            '   }' +
            '   .image-selector-selection {' +
            '	   width: auto;' +
            '	   min-width: 40px;' +
            '	   height: auto;' +
            '	   display: flex;' +
            '	   flex: auto;' +
            '	   margin: auto;' +
            '	   padding: 2px 12px;' +
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
            '	   padding: 2px 12px;' +
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
            '	   margin-right: 10px;' +
            '   }' +
            '   .image-selector-option-text {' +
            '	   margin: auto auto auto 0;' +
            '   }' +
            '</style>' +
            '<div class="image-selector">' +
            '   <span class="image-selector-selection">' +
            '	   <div class="image-selector-option-image" />' +
            '	   <span class="image-selector-selection-text"></span>' +
            '   </span>' +
            '   <div class="image-selector-arrow"></div>' +
            '</div>' +
            '<div class="image-selector-options-list">' +
            '	 ' + options +
            '</div>';
    },

    /**
     * Create a single Option Item which can be used for ImageSelectors after initialization.
     *
     * @param id { string }
     * @param title { string }
     * @param image { string }
     * @return { HTMLElement | string }
     */
    createOption: function (id, title, image) {
        return '<span class="image-selector-option" id="' + id + '" image="' + image + '" title="' + title + '">' +
            '    <img class="image-selector-option-image" src="' + image + '" alt="' + id.toUpperCase() + '"/>' +
            '    <span class="image-selector-option-text">' + title + '</span>' +
            '</span>';
    },

    createOptionBeforeInit: function (id, title, image) {
        return '<image-option id="' + id + '" title="' + title + '" image="' + image + '"></image-option>';
    },

    /**
     * Add given options to a given selector parent.
     * This should contain a string which contain all options to provide.
     *
     * @param selector { HTMLElement | {} }
     * @param options { [HTMLElement] | string }
     */
    addOptionItems: function (selector, options) {
        $(selector).html(options);
        ImageSelector.init(selector);
    },
};

/* ******* *
 * Helper  *
 * ******* */

/**
 * Check whether an Element hits the browser viewport bound.
 *
 * @param element
 * @return { {} }
 */
var ImageSelectorHelperIsOutOfViewport = function (element) {
    var bounding = element.getBoundingClientRect();
    var out = {};
    out.top = bounding.top < 0;
    out.left = bounding.left < 0;
    out.bottom = bounding.bottom > (window.innerHeight || document.documentElement.clientHeight);
    out.right = bounding.right > (window.innerWidth || document.documentElement.clientWidth);
    out.any = out.top || out.left || out.bottom || out.right;
    out.all = out.top && out.left && out.bottom && out.right;
    return out;
};

/**
 * Initial call to setup all <image-selector /> tags.
 */
(function () {
    var imageSelectors = $(document.getElementsByTagName("image-selector"));
    ImageSelector.init(imageSelectors);
})();