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
<image-selector id="any_id">
  <image-option id="id1" title="Option 1" image="filename/or/url/" />
  <image-option id="id2" title="Option 2" image="filename/or/url/" />
  ...
</image-selector>
```

3. It will be automatically initialized by the image-selector.lib.js Library.
