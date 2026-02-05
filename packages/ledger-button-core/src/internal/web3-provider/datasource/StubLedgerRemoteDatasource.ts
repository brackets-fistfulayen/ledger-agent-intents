import { injectable } from "inversify";
import { Right } from "purify-ts";

import {
  CommonEIP1193ErrorCode,
  JSONRPCRequest,
} from "../../../api/model/eip/EIPTypes.js";
import { LedgerRemoteDatasource } from "./LedgerRemoteDatasource.js";

@injectable()
export class StubLedgerRemoteDatasource extends LedgerRemoteDatasource {
  override async JSONRPCRequest(args: JSONRPCRequest) {
    return Promise.resolve(
      Right({
        jsonrpc: "2.0",
        id: args.id,
        result: undefined,
        error: {
          code: CommonEIP1193ErrorCode.UnsupportedMethod,
          message: `Method ${args.method} is not supported, { method: ${args.method}, params: ${JSON.stringify(args.params)} }`,
        },
      }),
    );
  }
}
