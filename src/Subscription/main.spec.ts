import { is_err, is_ok } from "@usefultools/monads"

import Subscription from "./main"
import { SubscriptionFn } from "./types"

describe("Subscription", () => {
  enum Message {
    ChangeFoo = "changeFoo",
    ChangeBar = "changeBar",
  }
  interface State {
    foo: string
    bar: string
  }

  class TestSubscription extends Subscription<Message, State> {
    notify = (type: Message, nextState: State) => {
      return this.publish(type, nextState)
    }

    notifyUsingCb = (type: Message, nextState: Partial<State>) => {
      return this.publish(type, (prevState) => ({ ...prevState, ...nextState }))
    }

    getLatestValue = (): State => {
      return this.getLatestState()
    }
  }

  const self: {
    state: State
    handleMsg: SubscriptionFn<Message, State>
  } = {
    state: null!,
    handleMsg: null!,
  }

  beforeEach(() => {
    self.state = { foo: "foo_value", bar: "bar_value" }
    self.handleMsg = jest.fn()
  })

  afterEach(() => {
    self.state = null!
    self.handleMsg = null!
  })

  describe("subscribe", () => {
    it("only notifies the handlers with specified messageType", () => {
      const subject = new TestSubscription(self.state)

      subject.subscribe(Message.ChangeFoo, self.handleMsg)

      const nextState = { foo: "new_foo", bar: "bar_value" }

      subject.notify(Message.ChangeFoo, nextState)
      subject.notify(Message.ChangeBar, nextState)

      expect(self.handleMsg).toHaveBeenCalledTimes(1)
      expect(self.handleMsg).toHaveBeenCalledWith(nextState, Message.ChangeFoo)
    })

    it("notifies all handlers with specified messageTypes", () => {
      const subject = new TestSubscription(self.state)

      subject.subscribe([Message.ChangeFoo, Message.ChangeBar], self.handleMsg)

      subject.notify(Message.ChangeFoo, { foo: "new_foo", bar: "bar_value" })
      subject.notifyUsingCb(Message.ChangeBar, { bar: "new_bar" })

      expect(self.handleMsg).toHaveBeenCalledTimes(2)
      const [firstCall, secondCall] = (self.handleMsg as any).mock.calls
      expect(firstCall).toEqual([{ foo: "new_foo", bar: "bar_value" }, Message.ChangeFoo])
      expect(secondCall).toEqual([{ foo: "new_foo", bar: "new_bar" }, Message.ChangeBar])
    })

    it("notifies all handlers if no messageType specified", () => {
      const subject = new TestSubscription(self.state)

      subject.subscribe(null, self.handleMsg)

      const nextState = { foo: "new_foo", bar: "bar_value" }

      subject.notify(Message.ChangeFoo, nextState)
      subject.notify(Message.ChangeBar, nextState)

      expect(self.handleMsg).toHaveBeenCalledTimes(2)
    })

    it("returns the id of an existing subscription if already present on the instance", () => {
      const subject = new TestSubscription(self.state)

      const id = subject.subscribe(Message.ChangeFoo, self.handleMsg)
      const newId = subject.subscribe(Message.ChangeFoo, self.handleMsg)

      expect(newId).toEqual(id)
      expect(subject.getSubscriptionCount()).toEqual(1)
    })
  })

  describe("unsubscribe", () => {
    it("removes a subscription if present", () => {
      const subject = new TestSubscription(self.state)

      const id = subject.subscribe(null, self.handleMsg)

      expect(subject.getSubscriptionCount()).toEqual(1)

      const res = subject.unsubscribe(id)

      expect(subject.getSubscriptionCount()).toEqual(0)
      expect(is_ok(res)).toEqual(true)
    })

    it("returns Err if subscription id not found", () => {
      const subject = new TestSubscription(self.state)

      subject.subscribe(null, self.handleMsg)

      expect(subject.getSubscriptionCount()).toEqual(1)

      const res = subject.unsubscribe("someId")

      expect(subject.getSubscriptionCount()).toEqual(1)
      expect(is_err(res)).toEqual(true)
    })
  })

  describe("getSubscriptionCount", () => {
    it("retrieves the active subscription count", () => {
      const subject = new TestSubscription(self.state)

      subject.subscribe(null, self.handleMsg)

      expect(subject.getSubscriptionCount()).toEqual(1)
    })
  })

  describe("getLatestState", () => {
    it("retrieves the latest state / value", () => {
      const subject = new TestSubscription(self.state)

      subject.notifyUsingCb(Message.ChangeBar, { foo: "new_foo" })

      expect(subject.getLatestValue()).toEqual({
        ...self.state,
        foo: "new_foo",
      })
    })
  })
})
