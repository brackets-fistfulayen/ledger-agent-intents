import { merge } from "./merge.js";

describe("merge", () => {
  it("should merge two objects", () => {
    const target = { a: 1, b: { c: 2, d: 3 } };
    const source = { c: 4, b: { e: 5 } };
    const result = merge(target, source);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3, e: 5 }, c: 4 });
  });

  it("should merge two arrays", () => {
    const target = { a: [1, 2, 3], b: { c: 4, d: 5 } };
    const source = { a: [4, 5, 6], c: 6, b: { e: 7 } };
    const result = merge(target, source);
    expect(result).toEqual({
      a: [1, 2, 3, 4, 5, 6],
      b: { c: 4, d: 5, e: 7 },
      c: 6,
    });
  });

  it("should merge three objects", () => {
    const target = { a: 1, b: { c: 2, d: 3 } };
    const source1 = { c: 4, b: { e: 5 } };
    const source2 = { f: 6, b: { g: 7 } };
    const result = merge(target, source1, source2);
    expect(result).toEqual({ a: 1, b: { c: 2, d: 3, e: 5, g: 7 }, c: 4, f: 6 });
  });
});
