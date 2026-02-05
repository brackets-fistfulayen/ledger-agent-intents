import { lastValueFrom, of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SignFlowStatus } from "../../../api/model/signing/SignFlowStatus.js";
import type { SignPersonalMessageParams } from "../../../api/model/signing/SignPersonalMessageParams.js";
import type { SignRawTransactionParams } from "../../../api/model/signing/SignRawTransactionParams.js";
import type { SignTransactionParams } from "../../../api/model/signing/SignTransactionParams.js";
import type { SignTypedMessageParams } from "../../../api/model/signing/SignTypedMessageParams.js";
import type { SignPersonalMessage } from "../../device/use-case/SignPersonalMessage.js";
import type { SignRawTransaction } from "../../device/use-case/SignRawTransaction.js";
import type { SignTransaction } from "../../device/use-case/SignTransaction.js";
import type { SignTypedData } from "../../device/use-case/SignTypedData.js";
import { DefaultTransactionService } from "./DefaultTransactionService.js";

describe("DefaultTransactionService", () => {
  let service: DefaultTransactionService;
  let mockSignTransactionUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockSignRawTransactionUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockSignTypedDataUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockSignPersonalMessageUseCase: {
    execute: ReturnType<typeof vi.fn>;
  };
  let mockLogger: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    fatal: ReturnType<typeof vi.fn>;
  };
  let mockLoggerFactory: ReturnType<typeof vi.fn>;

  const mockSignTransactionParams: SignTransactionParams = {
    transaction: {
      chainId: 1,
      data: "0x",
      to: "0x1234567890abcdef1234567890abcdef12345678",
      value: "0x0",
      from: "0xabcdef1234567890abcdef1234567890abcdef12",
      gas: "0x5208",
      nonce: "0x0",
    },
    method: "eth_signTransaction",
    broadcast: false,
  };

  const mockSignRawTransactionParams: SignRawTransactionParams = {
    transaction: "0x02f8...",
    method: "eth_signRawTransaction",
    broadcast: false,
  };

  const mockSignPersonalMessageParams: SignPersonalMessageParams = [
    "0x1234567890abcdef1234567890abcdef12345678",
    "Hello, Ledger!",
    "personal_sign",
  ];

  const mockSignTypedMessageParams: SignTypedMessageParams = [
    "0x1234567890abcdef1234567890abcdef12345678",
    {
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" },
        ],
      },
      primaryType: "Person",
      domain: {
        name: "Test App",
        version: "1",
      },
      message: {
        name: "John Doe",
        wallet: "0x1234567890abcdef1234567890abcdef12345678",
      },
    },
    "eth_signTypedData_v4",
  ];

  const mockSignFlowStatus: SignFlowStatus = {
    signType: "transaction",
    status: "success",
    data: {
      rawTransaction: new Uint8Array([1, 2, 3]),
      signedRawTransaction: "0xabc123",
    },
  };

  beforeEach(() => {
    mockSignTransactionUseCase = {
      execute: vi.fn(),
    };

    mockSignRawTransactionUseCase = {
      execute: vi.fn(),
    };

    mockSignTypedDataUseCase = {
      execute: vi.fn(),
    };

    mockSignPersonalMessageUseCase = {
      execute: vi.fn(),
    };

    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    };

    mockLoggerFactory = vi.fn().mockReturnValue(mockLogger);

    vi.clearAllMocks();

    service = new DefaultTransactionService(
      mockSignTransactionUseCase as unknown as SignTransaction,
      mockSignRawTransactionUseCase as unknown as SignRawTransaction,
      mockSignTypedDataUseCase as unknown as SignTypedData,
      mockSignPersonalMessageUseCase as unknown as SignPersonalMessage,
      mockLoggerFactory,
    );
  });

  describe("sign", () => {
    describe.each([
      [
        "transaction",
        mockSignTransactionParams,
        () => mockSignTransactionUseCase,
      ],
      [
        "raw transaction",
        mockSignRawTransactionParams,
        () => mockSignRawTransactionUseCase,
      ],
      [
        "personal message",
        mockSignPersonalMessageParams,
        () => mockSignPersonalMessageUseCase,
      ],
      [
        "typed data",
        mockSignTypedMessageParams,
        () => mockSignTypedDataUseCase,
      ],
    ])("when signing a %s", (_, params, getUseCase) => {
      let useCase: {
        execute: ReturnType<typeof vi.fn>;
      };
      beforeEach(() => {
        useCase = getUseCase();
        useCase.execute.mockReturnValue(of(mockSignFlowStatus));
        service.sign(params);
      });
      it("should call %s use case with params", () => {
        expect(useCase.execute).toHaveBeenCalledWith(params);
        expect(useCase.execute).toHaveBeenCalledTimes(1);
      });

      it("should set pending params", () => {
        expect(service.getPendingTransaction()).toEqual(params);
      });
      it("should return observable from signTransactionUseCase", async () => {
        const result$ = service.sign(params);

        const status = await lastValueFrom(result$);
        expect(status).toEqual(mockSignFlowStatus);
      });
    });
  });

  describe("getPendingTransaction", () => {
    it("should return undefined initially", () => {
      expect(service.getPendingTransaction()).toBeUndefined();
    });

    it("should return the most recent pending params", () => {
      service.setPendingTransaction(mockSignTransactionParams);
      expect(service.getPendingTransaction()).toEqual(
        mockSignTransactionParams,
      );
    });
  });

  describe("setPendingTransaction", () => {
    it("should set pending params", () => {
      service.setPendingTransaction(mockSignTransactionParams);

      expect(service.getPendingTransaction()).toEqual(
        mockSignTransactionParams,
      );
    });
  });

  describe("reset", () => {
    beforeEach(() => {
      service.setPendingTransaction(mockSignTransactionParams);
    });
    it("should clear pending params", () => {
      service.reset();
      expect(service.getPendingTransaction()).toBeUndefined();
    });
  });
});
