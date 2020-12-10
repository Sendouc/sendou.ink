# Translation

In this folder you will find all the files for localization.

## How to translate?

Translation are fetched from [JSON](https://en.wikipedia.org/wiki/JSON) formatted files. If you aren't familiar with Git you can copy-paste the JSON file you are translating to your preferred text editor and work from there.

### game.json

This file is automatically translated so no action is needed.

### messages.json

For example let's look at the file: https://github.com/Sendouc/sendou.ink/blob/main/locale/de/messages.json. This file contains texts that need to be translated:

```json
"Calendar": "Kalender",
```

The key (one on the left) is the English text to be translated that you should never change. The value to translate is on the right.

So that particular line is already done.

```json
"Home": "",
```

To translate this line simply think what is the best equivalent to "Home" in your language. If you aren't sure about the context you can take a look at the site or ask me.

## Special cases

Normally translating is just thinking what the key is in your own language but there a few special cases to keep in mind as well.

### Templates

```json
"Markdown is supported - <0>https://sendou.ink/markdown</0>": "",
```

Your translated text has to include the `<0>https://sendou.ink/markdown</0>` as well. Sometimes you might need to translate what is inside the `<0></0>` as well. There can also be `<1></1>`, `<2></2>` etc.

So the example line translated to Finnish might look like this:

```json
"Markdown is supported - <0>https://sendou.ink/markdown</0>": "Markdown-kieltä tuetaan - <0>https://sendou.ink/markdown</0>",
```

### Variables

```json
"Enemy has reached the {pointMark} point mark": "",
```

Value inside the curly brackets (`{}`) shouldn't be translated. It corresponds to a variable (can be a number or some fixed text for example that is set in the code).

So translating to Finnish it might look like this:

```json
"Enemy has reached the {pointMark} point mark": "Vihollinen on saavuttanut {pointMark} pisteen merkin",
```

### Plural

```json
"{otherBuildCount, plural, one {Show # more build by {username}} other {Show # more builds by {username}}}": "",
```

With plural you are translating `{Show # more build by {username}}` and `{Show # more builds by {username}}`. Leave everything else intact.

So translating to Finnish it might look like this:

```json
"{otherBuildCount, plural, one {Show # more build by {username}} other {Show # more builds by {username}}}": "{otherBuildCount, plural, one {Näytä # 1 asu käyttäjältä {username} lisää} other {Näytä # asua käyttäjältä {username} lisää}}}",
```

## Encoding

In the previous version it seemed to be necessary to use encoding (looks like this: `"\uD83D\uDE10"`) but this shouldn't be necessary this time around. Just write the translated text as you would normally.

## How to submit translations?

Preferred way to submit translations is via a pull request on GitHub. If that doesn't mean anything to you alternatively you can send me the translated file on Discord.
