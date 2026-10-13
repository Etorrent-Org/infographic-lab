import assert from "node:assert/strict";
import { test } from "node:test";
import { createUniqueId } from "../src/unique-id.ts";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("uses native randomUUID on secure origins", () => {
  const source = {
    randomUUID: () => "12345678-1234-4123-8123-123456789abc",
    getRandomValues: () => { throw new Error("should not be called"); },
  };
  assert.equal(createUniqueId(source), "12345678-1234-4123-8123-123456789abc");
});

test("generates valid random UUID v4 when randomUUID is absent on HTTP LAN", () => {
  let counter = 0;
  const source = {
    getRandomValues(bytes) {
      for (let i = 0; i < bytes.length; i++) bytes[i] = (counter++ * 37 + 17) & 255;
      return bytes;
    },
  };
  const first = createUniqueId(source);
  const second = createUniqueId(source);
  assert.match(first, UUID_V4);
  assert.match(second, UUID_V4);
  assert.notEqual(first, second);
});
