import { Err, is_ok, Ok, Result } from "@usefultools/monads"
import {
  generateId,
  isEqual,
  isFunction,
  isMissing,
  isNonEmptyArray,
  isNonEmptyString,
  isNonNegativeInteger,
} from "@usefultools/utils"
import { InternalState, SubscriptionFn, SubscriptionItem } from "./types"

class PubSub<MessageType, State> {
  private state: InternalState<State>
  private subscriptions: Array<SubscriptionItem<MessageType, State>>

  constructor(initialValue: State) {
    this.subscriptions = []
    this.state = { updatedAt: new Date().toISOString(), value: initialValue }
  }

  subscribe = (
    messageType: MessageType | Array<MessageType> | null,
    fn: SubscriptionFn<MessageType, State>,
  ): string => {
    const existingSubscriptionId = this.getSubscriptionId(fn)

    if (is_ok(existingSubscriptionId)) {
      return existingSubscriptionId.unwrap()
    } else {
      const newId = generateId()

      let onMessageType: Set<MessageType>

      if (isNonEmptyArray(messageType)) {
        onMessageType = new Set(messageType)
      } else if (isNonEmptyString(messageType)) {
        onMessageType = new Set([messageType])
      } else {
        onMessageType = new Set()
      }

      this.subscriptions.push({ id: newId, fn, onMessageType })

      return newId
    }
  }

  unsubscribe = (id: string): Result<string, string> => {
    const index = this.subscriptions.findIndex((subscriptionItem) =>
      isEqual(subscriptionItem.id, id),
    )

    if (isNonNegativeInteger(index)) {
      this.subscriptions.splice(index, 1)
      return Ok("Unsubscribed")
    } else {
      return Err(`Subscription ${id} not found`)
    }
  }

  getSubscriptionCount = (): number => {
    return this.subscriptions.length
  }

  protected publish = (
    type: MessageType,
    next: State | ((prev: State) => State),
  ): number => {
    this.state = {
      ...this.state,
      updatedAt: new Date().toISOString(),
      value: isFunction(next) ? next(this.state.value) : next,
    }

    this.subscriptions.forEach(({ fn, onMessageType }) => {
      if (onMessageType.size > 0) {
        for (const messageType of onMessageType) {
          if (isEqual(messageType, type)) {
            fn(this.state.value, type)
          }
        }
      } else {
        fn(this.state.value, type)
      }
    })

    return this.subscriptions.length
  }

  protected getLatestState = (): State => {
    return this.state.value
  }

  private getSubscriptionId = (
    fn: SubscriptionFn<MessageType, State>,
  ): Result<string, string> => {
    const item = this.subscriptions.find((subscriptionItem) =>
      isEqual(subscriptionItem.fn, fn),
    )
    return isMissing(item) ? Err("Subscription not found") : Ok(item.id)
  }
}

export default PubSub
