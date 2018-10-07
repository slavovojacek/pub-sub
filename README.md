[![CircleCI](https://circleci.com/gh/litchi-io/pub-sub.svg?style=svg)](https://circleci.com/gh/litchi-io/pub-sub)
[![codecov](https://codecov.io/gh/litchi-io/pub-sub/branch/master/graph/badge.svg)](https://codecov.io/gh/litchi-io/pub-sub)
[![npm version](https://img.shields.io/npm/v/@usefultools/pub-sub.svg)](https://www.npmjs.com/package/@usefultools/pub-sub)
[![GuardRails badge](https://badges.production.guardrails.io/litchi-io/pub-sub.svg)](https://www.guardrails.io)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/litchi-io/pub-sub/blob/master/SECURITY.md)

# Publish-Subscribe

A simple, comprehensive and extensible pub-sub implementation.

## Prereqs & Install

* Node >=9.10.0
* npm >=6.1.0

Please note that the **TypeScript target is ES6**.

```sh
npm install @usefultools/pub-sub
```


## Usage

To ensure we subscribe to the right events when a state change occurs,
we need to define the possible message types. This can be updated later.

```typescript
enum Message {
  SetTheme = "SetTheme",
  SetFont = "SetFont",
}

```

We know that we will be working with `Font`s and `Theme`s,
so let's define these.

```typescript
enum Font {
  Monospaced = "Monospaced",
  Serif = "Serif",
}

enum Theme {
  Light = "Light",
  Dark = "Dark",
}

```

Lastly, we need to store these values somewhere so let's describe the `state`.

```typescript
interface State {
  font: Font
  theme: Theme
}

```

We can now create the pub-sub service itself.

```typescript
class Settings extends PubSub<MessageType, State> {
  setLightTheme = () => { /* do something */ }
  setDarkTheme = () => { /* do something */ }
  setMonospacedFont = () => { /* do something */ }
  setSerifFont = () => { /* do something */ }
}

const initialState: State = {
  font: Font.Serif,
  theme: Theme.Dark,
}

```

We need to be able to notify all our subscriptions of when state changes occur.
To keep things simple, let's focus on the `setLightTheme` implementation.

```typescript
class Settings extends PubSub<MessageType, State> {
  setLightTheme = () => {
    return this.publish(MessageType.SetTheme, prevState => ({
      ...prevState,
      theme: ThemeType.Light,
    }))
  }
  
  setDarkTheme = () => { /* do something */ }
  setMonospacedFont = () => { /* do something */ }
  setSerifFont = () => { /* do something */ }
}

```

`this.publish` will, as its name suggests, publish a message to every
subscription. Each active subscription receives the new state/value
as well as the message type that triggered this change.

The subscriptions have the following type definition:

```typescript
function onChange(nextState: State, messageType?: Message) {
  // do something with nextState and/or messageType
}

```

You can subscribe in 3 different ways as per examples below.

```typescript
// We initiate the settings pub-sub service
const settings = new Settings(initialState)

// This is one of our subscriptions
function onThemeChanged({ theme }: State, _messageType: Message) {
    console.log(`Theme is now ${theme}`)
}

// Only publish to onThemeChanged when message type is SetTheme
settings.subscribe(Message.SetTheme, onThemeChanged)

// Run onThemeChanged when message type is SetTheme or SetFont
settings.subscribe([Message.SetTheme, Message.SetFont], onThemeChanged)

// Run onStateChanged regardless of message type, in this
// case it makes sense to use the second argument
function onStateChanged(nextState: State, messageType: MessageType) {
  console.log(messageType, nextState)
}

settings.subscribe(null, onStateChanged)

```

Now when we call `settings.setLightTheme()`, both `onThemeChanged` (called
twice) and `onStateChanged` (called once) will be called with:

```typescript
({ font: FontType.Serif, theme: ThemeType.Light, }, MessageType.SetTheme)

```

### React Example

@TODO

## Contributing

If you have comments, complaints, or ideas for improvements, feel free to open an issue or a pull request! See [Contributing guide](./CONTRIBUTING.md) for details about project setup, testing, etc.

If you make or are considering making an app using WatermelonDB, please let us know!

## Author and license

This library was created by [@LITCHI.IO](https://github.com/litchi-io). Main author and maintainer is [Slavo Vojacek](https://github.com/slavovojacek).

Contributors: [Slavo Vojacek](https://github.com/slavovojacek)

`@usefultools/pub-sub` is available under the ISC license. See the [LICENSE file](./LICENSE.txt) for more info.