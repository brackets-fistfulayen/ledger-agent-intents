import { LOG_LEVELS } from "../model/constant.js";
import { DefaultLoggerPublisher } from "./DefaultLoggerPublisher.js";
import { LoggerPublisher } from "./LoggerPublisher.js";
import { LoggerSubscriber } from "./LoggerSubscriber.js";

let publisher: LoggerPublisher;
let subscriber: LoggerSubscriber;
describe("DefaultLoggerPublisher", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-24T16:05:37.110Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when no subscribers are provided", () => {
    beforeEach(() => {
      publisher = new DefaultLoggerPublisher([], "test");
      subscriber = {
        log: vi.fn(),
      };
    });

    it("should not log messages", () => {
      publisher.info("test");
      publisher.error("test");
      publisher.warn("test");
      publisher.debug("test");
      publisher.fatal("test");
      expect(subscriber.log).not.toHaveBeenCalled();
    });
  });

  describe("when subscribers are provided", () => {
    beforeEach(() => {
      publisher = new DefaultLoggerPublisher([subscriber], "test");
    });

    describe("info", () => {
      it("should log messages", () => {
        publisher.info("test", {
          test: "yolo",
        });

        expect(subscriber.log).toHaveBeenCalledWith(
          LOG_LEVELS.info,
          "test",
          expect.objectContaining({
            timestamp: "2025-06-24T16:05:37.110Z",
            tag: "test",
            data: {
              test: "yolo",
            },
          }),
        );
      });
    });

    describe("error", () => {
      it("should log messages", () => {
        publisher.error("test", {
          test: "yolo",
        });

        expect(subscriber.log).toHaveBeenCalledWith(
          LOG_LEVELS.error,
          "test",
          expect.objectContaining({
            timestamp: "2025-06-24T16:05:37.110Z",
            tag: "test",
            data: {
              test: "yolo",
            },
          }),
        );
      });
    });

    describe("warn", () => {
      it("should log messages", () => {
        publisher.warn("test", {
          test: "yolo",
        });

        expect(subscriber.log).toHaveBeenCalledWith(
          LOG_LEVELS.warn,
          "test",
          expect.objectContaining({
            timestamp: "2025-06-24T16:05:37.110Z",
            tag: "test",
            data: {
              test: "yolo",
            },
          }),
        );
      });
    });

    describe("debug", () => {
      it("should log messages", () => {
        publisher.debug("test", {
          test: "yolo",
        });

        expect(subscriber.log).toHaveBeenCalledWith(
          LOG_LEVELS.debug,
          "test",
          expect.objectContaining({
            timestamp: "2025-06-24T16:05:37.110Z",
            tag: "test",
            data: {
              test: "yolo",
            },
          }),
        );
      });
    });

    describe("fatal", () => {
      it("should log messages", () => {
        publisher.fatal("test", {
          test: "yolo",
        });

        expect(subscriber.log).toHaveBeenCalledWith(
          LOG_LEVELS.fatal,
          "test",
          expect.objectContaining({
            timestamp: "2025-06-24T16:05:37.110Z",
            tag: "test",
            data: {
              test: "yolo",
            },
          }),
        );
      });
    });
  });
});
