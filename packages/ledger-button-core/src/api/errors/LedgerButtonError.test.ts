import { LedgerButtonError } from "./LedgerButtonError.js";

class CustomError extends LedgerButtonError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CustomError", context);
  }
}

describe("LedgerButtonError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should be able to create a new error", () => {
    const error = new LedgerButtonError("test");
    expect(error).toBeDefined();
    expect(error.name).toBe("LedgerButtonError");
    expect(error.message).toBe("test");
    expect(error.context).toBeUndefined();
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.stack).toBeDefined();
  });

  it("should be able to serialize the error", () => {
    const error = new LedgerButtonError("test");
    const serialized = error.toJSON();
    expect(serialized).toMatchObject({
      name: "LedgerButtonError",
      message: "test",
      context: undefined,
      timestamp: expect.any(Date),
      stack: expect.any(String),
    });
  });

  describe("Custom LedgerButtonError", () => {
    it("should be able to create a new error", () => {
      const error = new CustomError("test", {
        test: "test",
      });
      expect(error).toBeDefined();
      expect(error.name).toBe("CustomError");
      expect(error.message).toBe("test");
      expect(error.context).toMatchObject({ test: "test" });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.stack).toBeDefined();
      expect(error).toBeInstanceOf(LedgerButtonError);
    });
  });
});
