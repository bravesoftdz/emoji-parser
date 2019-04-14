const fitzpatrick_scale_modifiers = ["🏻", "🏼", "🏽", "🏾", "🏿"];

class EmojiParser {
    constructor (emojis) {
        // The emoji db
        this.emojis = emojis;

        // Regular Expressions to find emoji short codes
        this.regex = {
            generic: /:[^\s]+:/g,
            skintone: /:[^\s]+::[^\s]+:/g,
            typing: /:[^(\s|:)]+$/g,

            // Find emoji in string
            emoji: /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g
        };

        // Object that defines the namescheme of the images
        this.image = {
            class: 'emoji',
            directory: './bower_components/noto-emoji/svg',
            format: 'svg',
            nameScheme: {
                prefix: 'emoji_u',
                hexJoin: '_',
                suffix: ''
            }
        };

        this.maxReturn = 20;


        // Function to extract the skintone value
        this.skintoneVal = str => {
            let split = str.split(':');
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

        // Function to extract emoji name
        this.emojiVal = str => str.split(':')[1];

        this.shortCodeTemplate = str=>`:${str}:`;

        this.skintoneTemplate = str=>{
            switch (str) {
                case fitzpatrick_scale_modifiers[0]:
                    return ':skintone_2:';
                
                case fitzpatrick_scale_modifiers[1]:
                    return ':skintone_3:';

                case fitzpatrick_scale_modifiers[2]:
                    return ':skintone_4:';

                case fitzpatrick_scale_modifiers[3]:
                    return ':skintone_5:';

                case fitzpatrick_scale_modifiers[4]:
                    return ':skintone_6:';
            }
        };
    }

    getMatching (word) {
        // Put all objects matching into an array
        let newArr = [];
        for (const emoji in this.emojis) {
            if (emoji.indexOf(word) > -1) {
                newArr.push({
                    code: emoji,
                    icon: this.emojis[emoji].char,
                    fitzpatrick_scale: this.emojis[emoji].fitzpatrick_scale,
                    category: this.emojis[emoji].category
                })
            } else if (this.emojis[emoji].keywords.indexOf(word) > -1) {
                newArr.push({
                    code: emoji,
                    icon: this.emojis[emoji].char,
                    fitzpatrick_scale: this.emojis[emoji].fitzpatrick_scale,
                    category: this.emojis[emoji].category
                })
            }

            if (newArr.length >= this.maxReturn) break;
        }
        return newArr;
    }

    parseToEmoji (string) {
        return string
            // Parse emojis with skintone modifier
            .replace(this.regex.skintone, code => {
                const emoji = this.emojiVal(code);
                if (this.emojis.hasOwnProperty(emoji)) {
                    if (this.emojis[emoji].fitzpatrick_scale) 
                        return this.emojis[emoji].char + this.skintoneVal(code)
                    else 
                        return this.emojis[emoji].char;
                } else {
                    return emoji;
                }
            })
            // Parse normal non skintone emojis
            .replace(this.regex.generic, code => {
                const emoji = this.emojiVal(code); // Remove the : from the string
                if (this.emojis.hasOwnProperty(emoji)) {
                    return this.emojis[emoji].char;
                } else {
                    return emoji;
                }
            })
    }

    getImageURL (emoji) {
        let chars = emoji.split('\u200d'); // Split at the binding character ZWT
        let hex = [];

        chars.forEach(element => {
            let hexString = []
            for (let char = 0; char < element.length; char += 2) {
                hexString.push(element.codePointAt(char).toString(16));

            }
            hex.push(hexString.join(this.image.nameScheme.hexJoin));
        });

        let code = hex.join(`${this.image.nameScheme.hexJoin}200d${this.image.nameScheme.hexJoin}`);

        // Form the URL
        return `${this.image.directory}/${this.image.nameScheme.prefix}${code}${this.image.nameScheme.suffix}.${this.image.format}`;
    }

    currentlyTypingCode (string = '') {
        const matches = string.match(this.regex.typing);
        
        let match;

        if (matches) match = matches.pop();
        
        if (match)
            // Check if the last match is at the end of the string
            if (string.lastIndexOf(match) === string.length - match.length) {
                return match;
            } 

        return false;
    }

    fillCurrentCode (string, code) {
        const split = string.split(this.regex.typing);
        split.pop();
        split.push(code);
        return split.join('');
    }

    parseToImg(emojiStr) {
        return emojiStr.replace(this.regex.emoji, emoji=> `<img class="${this.image.class}" alt="${emoji}" src="${this.getImageURL(emoji)}" />` )
    }

    parseToShorcode(emojiStr) {
        // Replace the skintone modifiers
        let half = emojiStr;

        fitzpatrick_scale_modifiers.forEach(element => {
            half = half.replace(new RegExp(element, 'g'), modifier=>this.skintoneTemplate(modifier))
        });

        return half
            .replace(this.regex.emoji, emoji=>{
                for (const code in this.emojis) {
                    if(this.emojis[code].char === emoji){
                        return this.shortCodeTemplate(code);
                    }
                }
            });
    }
}