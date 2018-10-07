import { Subscription } from "../../Subscription"

import { Font, Message, State, Theme } from "./types"

class Settings extends Subscription<Message, State> {
  setLightTheme = () => {
    return this.publish(Message.SetTheme, (prevState) => ({
      ...prevState,
      theme: Theme.Light,
    }))
  }

  setMonospacedFont = () => {
    return this.publish(Message.SetFont, (prevState) => ({
      ...prevState,
      font: Font.Monospaced,
    }))
  }
}

const settings = new Settings({
  font: Font.Serif,
  theme: Theme.Dark,
})

function onThemeChanged({ theme }: State): void {
  // tslint:disable-next-line
  console.log(`Theme is now ${theme}`)
}

const subscription = settings.subscribe(Message.SetTheme, onThemeChanged)

settings.setLightTheme()

settings.unsubscribe(subscription)
