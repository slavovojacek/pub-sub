export type SubscriptionFn<MessageType, State> = (
  nextState: State,
  messageType?: MessageType,
) => void

export interface Message<Type, State> {
  type: Type
  state: State
}

export interface InternalState<State> {
  updatedAt: string
  value: State
}

export interface SubscriptionItem<MessageType, State> {
  id: string
  fn: SubscriptionFn<MessageType, State>
  onMessageType: Set<MessageType>
}
