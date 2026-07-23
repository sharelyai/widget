// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { customEvents } from "./customEvents";

describe("customEvents", () => {
  it("publishes and receives events via subscribe", () => {
    const handler = vi.fn();
    customEvents.subscribe("test-event", handler);
    customEvents.publish("test-event", { foo: "bar" });
    expect(handler).toHaveBeenCalledTimes(1);
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toEqual({
      foo: "bar",
    });
    customEvents.unsubscribe("test-event", handler);
  });

  it("unsubscribe stops receiving events", () => {
    const handler = vi.fn();
    customEvents.subscribe("test-unsub", handler);
    customEvents.unsubscribe("test-unsub", handler);
    customEvents.publish("test-unsub", {});
    expect(handler).not.toHaveBeenCalled();
  });

  it("multiple subscribers each receive the event", () => {
    const h1 = vi.fn();
    const h2 = vi.fn();
    customEvents.subscribe("multi", h1);
    customEvents.subscribe("multi", h2);
    customEvents.publish("multi", "data");
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
    customEvents.unsubscribe("multi", h1);
    customEvents.unsubscribe("multi", h2);
  });
});
