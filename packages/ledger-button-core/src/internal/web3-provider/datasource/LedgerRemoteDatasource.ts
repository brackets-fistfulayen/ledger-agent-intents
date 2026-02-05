import { type Factory, inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";

import {
  JSONRPCRequest,
  JsonRpcResponse,
} from "../../../api/model/eip/EIPTypes.js";
import { backendModuleTypes } from "../../backend/backendModuleTypes.js";
import { type BackendService } from "../../backend/BackendService.js";
import { isJsonRpcResponse } from "../../backend/types.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import { type ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";

@injectable()
export class LedgerRemoteDatasource {
  private readonly logger: LoggerPublisher;
  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    private readonly loggerFactory: Factory<LoggerPublisher>,
    @inject(backendModuleTypes.BackendService)
    private readonly backendService: BackendService,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
  ) {
    this.logger = this.loggerFactory("[LedgerRemoteDatasource]");
  }

  async JSONRPCRequest(
    args: JSONRPCRequest,
  ): Promise<Either<Error, JsonRpcResponse>> {
    try {
      const response = await this.backendService.broadcast({
        blockchain: {
          name: "ethereum",
          chainId: this.contextService.getContext().chainId.toString(),
        },
        rpc: args,
      });

      if (response.isLeft()) {
        return Left(
          new Error("Error in JSONRPCRequest", { cause: response.extract() }),
        );
      }
      if (response.isRight() && isJsonRpcResponse(response.extract())) {
        return Right(response.extract() as JsonRpcResponse);
      }
      return Left(
        new Error("Error in JSONRPCRequest", { cause: response.extract() }),
      );
    } catch (error) {
      this.logger.error("Error in JSONRPCRequest", { error });
      return Left(new Error("Error in JSONRPCRequest", { cause: error }));
    }
  }
}
