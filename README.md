
# ImageDropdownSelector

![image-selector](https://user-images.githubusercontent.com/86413572/124750028-41767b80-df25-11eb-93c8-778c0ae12ee9.PNG)

![image-selector-expanded](https://user-images.githubusercontent.com/86413572/124750118-5f43e080-df25-11eb-9236-844fb1bcdd2e.PNG)



## Usage
1. Include the image-selecgtor.lib.js Library to your HTML Project:
```html
<html>
  <head>
    <script src="image-selector.lib.min.js"></script>
    ...
  </head>
  ...
</html>
```

2. Add the custom element tag <image-selector></image-selector> to your HTML document:
```html
<image-selector id="example_selector">
  <image-option id="option_1" title="Option 1" image="filename/or/url/" />
  <image-option id="option_2" title="Option 2" image="filename/or/url/" />
  ...
</image-selector>
```

3. It will be automatically initialized by the image-selector.lib.js Library.


## Get / Set selected option

1. Get current selected option
```js
// Option 1: Get Index
function getSelectedIndex() {
    var selector = document.getElementById('example_selector');
    
    var selectionIndex = ImageSelector.getCurrentSelectedIndex(selector);
    
    return selectionIndex;
}

// Option 2: Get Option-Element
function getSelectedElement() {
    var selector = document.getElementById('example_selector');
    
    var selectionElement = ImageSelector.getCurrentSelected(selector);
    
    return selectionElement;
}
```

2. Set current selected option
```js
// Option 1: Set selected option by index
function setSelectedIndex(index) {
    var selector = document.getElementById('example_selector');
    
    ImageSelector.setSelectedIndex(selector, index);
}

// Option 2: Set selected option by option id
function setSelectedById(id) {
    var selector = document.getElementById('example_selector');
    
    ImageSelector.setSelectedOptionById(selector, 'option_1');
}

// Option 3: Set selected option by option element
function setSelectedOption(option) {
    ImageSelector.setSelectedOptionById(option);
}
```

## Overview - Available functions
<table>
  <tr>
    <th>
      Function
    </th>
    <th>
      Return Type
    </th>
    <th>
      Description
    </th>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.setSelectedIndex(selector, index)</code>
    </td>
    <td>
      &lt;void&gt;
    </td>
    <td>
      Set the selected option for a selector by a specific option index
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.setSelectedOptionById(selector, optionId)</code>
    </td>
    <td>
      &lt;void&gt;
    </td>
    <td>
      Set the selected option for a selector by a specific option id
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.setSelectedOption(option)</code>
    </td>
    <td>
      &lt;void&gt;
    </td>
    <td>
      Set the selected option for a selector by a given option
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.setOnSelectListener(selector, fct, replaceExisting)</code>
    </td>
    <td>
      &lt;void&gt;
    </td>
    <td>
      Set an OnSelectListener
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.getItemCount(selector)</code>
    </td>
    <td>
      &lt;number&gt;
    </td>
    <td>
      Get the number of options for a given selector
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.getCurrentSelected(selector)</code>
    </td>
    <td>
      &lt;HTMLElement|null&gt;
    </td>
    <td>
      Get the current selected selector option
    </td>
  <tr>
    <td>
      <code>ImageSelector.getCurrentSelectedIndex(selector)</code>
    </td>
    <td>
      &lt;number&gt;
    </td>
    <td>
      Get the index of the current selected selector option
    </td>
  </tr>
  <tr>
    <td>
      <code>ImageSelector.getIndexOf(option)</code>
    </td>
    <td>
      &lt;number&gt;
    </td>
    <td>
      Get the index of a given options Item
    </td>
  </tr>
</table>
