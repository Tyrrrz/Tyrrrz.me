---
title: WPF frontend using AmmyUI
date: 2017-11-18
---

Quite a long time ago I've stumbled upon a very interesting open source project called [AmmyUI](https://github.com/AmmyUI/AmmyUI). Its main goal is to make designing XAML apps a lot more fluid by... removing XAML and replacing it with a custom JSON-like layout language with additional features. I've never been a big fan of XAML, so it got me interested and I decided to use it for one of my projects, [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter).

## Installation

To use AmmyUI, you will need to add its NuGet package -- `Ammy.WPF` or `Ammy.UWP` or `Ammy.XamarinForms`.

Although technically not required, you will definitely want to also install the [Visual Studio extension](https://marketplace.visualstudio.com/items?itemName=ionoy.Ammy) as it provides syntax highlighting, Intellisense support and other things.

## Syntax

Ammy works by letting you define your views in its custom language, and then converting them to XAML at build time. The syntax looks a lot like JSON but with some nuances and shortcuts, as you can see here:

```js
Window "MainWindow" {
  Width: 200
  Height: 100
  TextBlock {
    Text: "Hello, World!"
  }
}
```

In the above statement, we declare a window, set its name and size, and add a textblock child to it.

Although on its own this already looks cleaner than an equivalent snippet in XAML, Ammy's true power lies in its extended set of features.

### Names and resource keys

Names and keys have a high level treatment and can be defined really quickly using shortcuts:

```js
// Grid with a name
Grid "MyGrid" {
}

// Grid with a resource key
Grid Key="MyGrid" {
}
```

### Using statements

Instead of defining aliases for XML namespaces, Ammy is using an approach identical to C# -- `using` directives. This means you can import an entire CLR namespace without the need to prefix nodes with an alias.

For example, if you are using [MaterialDesignInXamlToolkit](https://github.com/ButchersBoy/MaterialDesignInXamlToolkit) and want to use a `Card` control in your layout, you can simply do this:

```js
using MaterialDesignThemes.Wpf

Window "DiscordChatExporter.Views.MainWindow" {
  Title: "DiscordChatExporter"
  Width: 600
  Height: 550

  // MaterialDesignThemes.Wpf.Card
  Card {
    Padding: 8
    Margin: [6, 0, 6, 0]

    TextBlock {
      Text: "Hello, World!"
    }
  }
}
```

### Binding shortcuts

Ammy also provides lots of shortcuts for declaring bindings. A very basic binding can be set up like this:

```js
TextBlock {
  Text: bind Text
}
```

You can also specify binding source using a special `from` keyword. Here's how you can easily bind to a property of a different control:

```js
TextBlock "OtherTextBlock" {
  Text: "Hello, World!"
}

TextBlock {
  Text: bind Text from "OtherTextBlock"
}
```

There are many other things you can put after `from` -- `$this`, `$template`, `$ancestor<TextBlock>(3)`, `$previous`, `SomeType.StaticProperty`, `$resource SomeResource` -- each of them replace a normally rather lengthy binding declaration in XAML.

### Resource shortcuts

Similar to bindings, Ammy has a few shortcuts for referencing resources as well:

```js
TextBlock {
  Foreground: resource "ForegroundBrush"     // static
  Foreground: dyn resource "ForegroundBrush" // dynamic
}
```

### Inline binding converters

This is easily my most favorite feature, something that lets you forget about `BoolToVisibilityConverter`, `InvertBoolToVisibilityConverter` and the likes. In Ammy you can specify a converter right inside your binding declaration:

```js
TextBlock {
  Visibility: bind IsTextAvailable
              convert (bool b) => b ? Visibility.Visible : Visibility.Collapsed
}
```

You can write most C# code inside a converter, invoke your own methods, use your own classes, etc.

### Variables

This framework also offers some features to help you keep your code DRY. For example, you can declare variables and use them in a variety of ways:

```js
$primaryColor = "#343838"
$propertyName = "Text"

TextBlock {
  Foreground: SolidColorBrush { Color: $primaryColor }
  Text: bind $propertyName
}
```

### Mixins

You can also define a re-usable set of properties to be included in some controls, called mixin:

```js
mixin Centered() for TextBlock {
  TextAlignment: Center
}

TextBlock {
  #Centered()
}
```

Mixins can also take any number of parameters, some of which can be optional:

```js
mixin Cell (row = none, column = none, rowSpan = none, columnSpan = none) for FrameworkElement {
  Grid.Row: $row
  Grid.Column: $column
  Grid.RowSpan: $rowSpan
  Grid.ColumnSpan: $columnSpan
}

TextBlock {
  // Row 0, Col 2, RowSpan 0, ColSpan 0
  #Cell(0, 2)
}
```

The AmmyUI NuGet package also comes with quite a few pre-defined mixins that you can quickly start using in your code.

### Aliases

Alias is sort of similar to a mixin, except that it's used to create re-usable elements rather than a set of properties.

```js
alias BigCenteredTextBlock(text) {
  TextBlock {
    HorizontalAlignment: Center
    FontSize: 24
    Text: $text
  }
}

Grid {
  @BigCenteredTextBlock("Hello, World!") {
    Foreground: Red
  }
}
```

## My experience

Overall I was very pleased working with AmmyUI to develop one of my apps, however I don't feel confident using it for anything relatively large scale. My main issues included rather poor Intellisense support, lack of automatic formatting and refactoring, and lackluster Visual Studio integration. I've also encountered some bugs, most of which I was able to work around though.

I made sure to report all [the issues I've found on GitHub](https://github.com/AmmyUI/AmmyUI/issues?utf8=%E2%9C%93&q=is%3Aissue%20author%3ATyrrrz) so hopefully eventually either the author, me or someone else will get them fixed.
