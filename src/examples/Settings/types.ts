export enum Message {
  SetTheme = "SetTheme",
  SetFont = "SetFont",
}

export enum Font {
  Monospaced = "Monospaced",
  Serif = "Serif",
}

export enum Theme {
  Light = "Light",
  Dark = "Dark",
}

export interface State {
  font: Font
  theme: Theme
}
