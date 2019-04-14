# A Simple Emoji Parsing Library

A Client-side emoji parsing library which can be used for auto complete and prediction.

View the demo by cloning and running demo.html from server!

# Installation
 - Install dependencies with bower
```
bower install
```

# Setup

This library only works if the browser has access to these files:
1.  The emoji image directory ( default is ```/bower_components/noto-emoji/png``` ) 
2. ```/bower_components/emojilib/emojis.json```

Make sure that the server allows access to these files, you can move these files but you will need to change some properties of the ```EmojiParser``` component. Read the __Usage__ section for details on how to do this.

For testing you need to use a local server. I recommend Live Server on VS Code.

# Usage
Almost everything is customizable in this library, but the defaults should suit most developer's needs.

## Initialization
Creating the emoji parsing object
You need to supply it with the emojis.json data. You can move it anywhere the client can access it.
```
let emojiparser;
fetch('./bower_components/emojilib/emojis.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        emojiparser = new EmojiParser(data);
    });
```

## Predictions
Predicting emojis from a string using the method ```getMatching(word)```:
```
const matches = emojiparser.getMatching('smile')
```
This method will return an array of all the emojis that the library predicts is the correct one as an object with the following properies:
```
{
    category: "people"
    code: "grinning"
    fitzpatrick_scale: false
    icon: "😀"
}
```
The length of the array is capped by default to 20 objects for performance reasons, but can be set manually via the property ```maxReturn``` which excepts any integer value
```
emojiparser.maxReturn = 50
```
The ```getMatching(word)``` method only works with single word strings so to get any incomplete emoji shortcodes use the method ```currentlyTypingCode(string)```
```
emojiparser.currentlyTypingCode('I :heart: this library :smi');
// Returns ":smi"
```
The method returns the incomplete shortcode at the end of the string.

You can extract the emoji code only without the delimiter (default ```:``` ) using ```emojiVal(str)```
```
emojiparser.emojiVal(':smi');
// Returns smi
```

Now you can use all three these functions to create a predictive text engine that returns an array of predictions
```
function predictEmoji(string) {
    const currentCode = emojiparser.currentlyTypingCode(string);
    if (currentCode) {predictEmoji();
        return emojiparspredictEmoji();er.getMatching(emojiparser.emojiVal(currentCode));predictEmoji();
    }predictEmoji();
}predictEmoji();
predictEmoji();
predictEmoji(`I :heart: predictEmoji();this library :smi');
/* 
Returns array [
  {
    "code": "smiley",
    "icon": "😃",
    "fitzpatrick_scale": false,
    "category": "people"
  },
  {
    "code": "smile",
    "icon": "😄",
    "fitzpatrick_scale": false,
    "category": "people"
  } ... etc ...
] 
*/
```

Filling string with the predictions is also easy using the method ```fillCurrentCode (string, code)``` where ```string``` is the string with all the text and ```code``` is the shortcode to replace the incomplete shorcode at the end of ```string```
```
emojiparser.fillCurrentCode('I :heart: this library :smi', ':smiley:');
// Returns "I :heart: this library :smiley:"
```

## Parsing shortcodes to emojis
It is dead simple to parse shortcodes to emojis simply call the method ```parseToEmoji(string)``` where string is the string including the shortcodes. The method returns a string with the emojis filled in.

```
emojiparser.parseToEmoji("I :heart: this library :smiley:");
// Returns "I ❤️ this library 😃"
```

## Parsing emojis to images
Why parse to images? Parsing to images allows for greater crossplatform support and uniformity. 

The library provides multiple methods for parsing emojis to images. You need to supply the emoji files by yourself. I recommend using noto-emoji which gets installed automatically with bower. Just make sure to add all the person emojis as only gendered ones are included!

To set the naming scheme of the emoji files are easy. By default it will be set up to use the noto-emoji format, but you can manually set it to for example use twemoji.

The naming scheme is held in a property called ```image``` and is defined by default as
```
this.image = {
    class: 'emoji',
    directory: './bower_components/noto-emoji/png/128',
    format: 'png',
    nameScheme: {
        prefix: 'emoji_u',
        hexJoin: '_',
        suffix: ''
    }
};
```

Lets as an example set the parser to use twemoji instead
```
emojiparser.image.directory = 'https://twemoji.maxcdn.com/2/72x72'
emojiparser.image.nameScheme = {
    prefix: '',
    hexJoin: '-',
    suffix: ''
}
```

### To parse a single emoji character use the method ```getImageURL(emoji)```
```
emojiparser.getImageURL('👌🏾');
// Returns "https://twemoji.maxcdn.com/2/72x72/1f44c-1f3fe.png"
```

### To parse a whole string to image elements using the method ```parseToImg(emojiStr)```
```
emojiparser.parseToImg('A very simple demo of the library 🙀! Type something ... 👌🏾');
// Returns "A very simple demo of the library <img class=\"emoji\" alt=\"🙀\" src=\"https://twemoji.maxcdn.com/2/72x72//1f640.png\" />! Type something ... <img class=\"emoji\" alt=\"👌🏾\" src=\"https://twemoji.maxcdn.com/2/72x72//1f44c-1f3fe.png\" />"
```

## Custom shortcode delimiters
It is quite simple to set your own shortcode delimiters or formats by changing the regular expressions and extraction methods of the object

Here are all the steps with an example

1. Replace the regular expressions that define a shorcode
    - There are 4 expressions, 3 recommended to change 
        1. ```generic```, used for normal emojis
        2. ```skintone```, used for emojis with ```fitzpatrick_scale_modifiers``` or skintone
        3. ```typing```, used to define an incomplete emoji shortcode
        4. ```emoji```, used to find the emojis and replace with image, not recommended to change.
    - Here is an example where the shortcode delimiters are changed to ```| |``` and skintone to ```! !```
    ```
    emojiparser.regex.generic = /\|[^\s]+\|/g;
    emojiparser.regex.skintone = /\|[^\s]+\|![^\s]+!/g;
    emojiparser.regex.typing = /|[^(\s|\|)]+$/g;
    ```
2. Lastly the methods of code extraction has to be changed aswell
    - There are 2 methods ```emojiVal(str)``` and ```skintoneVal(str)```
        - ```emojiVal(str)``` return the code value of the emoji and ```skintoneVal(str)``` the unicode character for the fitzpatrick scale modifiers
        - The fitzpatrick scale modifiers are stored in ```const fitzpatrick_scale_modifiers = ["🏻", "🏼", "🏽", "🏾", "🏿"];``` accessible in the ```skintoneVal(str)``` method
    - Folowing the example of step one
    ```
    emojiparser.emojiVal = str => str.split('|')[1];

    emojiparser.skintoneVal = str => {
        let split = str.split('!');
        split.pop();
        switch (split.pop()) {
            case 'skintone_2':
                return fitzpatrick_scale_modifiers[0];

            case 'skintone_3':
                return fitzpatrick_scale_modifiers[1];

            case 'skintone_4':
                return fitzpatrick_scale_modifiers[2];

            case 'skintone_5':
                return fitzpatrick_scale_modifiers[3];

            case 'skintone_6':
                return fitzpatrick_scale_modifiers[4];

            default:
                return '';
        }
    }
    ```

Now when calling in the example ```emojiparser.parseToEmoji('Test: |ok_woman|[skintone_2]')``` it will return the same result as the default ```emojiparser.parseToEmoji('Test: :ok_woman::skintone_2:')```

# Minimizing the installation
If required you can delete all unused files from the dependencies listed below
- Everything in ```/bower_components/noto-emoji``` except ```/png/``` directory
- Everything in ```/bower_components/emojilib``` except ```/emojis.json``` file

# TODO 
[X] Add method to replace emojis with img elements