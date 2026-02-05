import { inject, injectable } from "inversify";
import { Observable } from "rxjs";

import { SignFlowStatus } from "../../../api/model/signing/SignFlowStatus.js";
import {
  isSignPersonalMessageParams,
  SignPersonalMessageParams,
} from "../../../api/model/signing/SignPersonalMessageParams.js";
import {
  isSignRawTransactionParams,
  type SignRawTransactionParams,
} from "../../../api/model/signing/SignRawTransactionParams.js";
import {
  isSignTransactionParams,
  type SignTransactionParams,
} from "../../../api/model/signing/SignTransactionParams.js";
import {
  isSignTypedMessageParams,
  type SignTypedMessageParams,
} from "../../../api/model/signing/SignTypedMessageParams.js";
import { SignPersonalMessage } from "../../../internal/device/use-case/SignPersonalMessage.js";
import { SignRawTransaction } from "../../../internal/device/use-case/SignRawTransaction.js";
import { deviceModuleTypes } from "../../device/deviceModuleTypes.js";
import { SignTransaction } from "../../device/use-case/SignTransaction.js";
import { SignTypedData } from "../../device/use-case/SignTypedData.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { TransactionService } from "./TransactionService.js";

@injectable()
export class DefaultTransactionService implements TransactionService {
  private _pendingParams?:
    | SignTransactionParams
    | SignRawTransactionParams
    | SignTypedMessageParams
    | SignPersonalMessageParams;
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(deviceModuleTypes.SignTransactionUseCase)
    private readonly signTransactionUseCase: SignTransaction,
    @inject(deviceModuleTypes.SignRawTransactionUseCase)
    private readonly signRawTransactionUseCase: SignRawTransaction,
    @inject(deviceModuleTypes.SignTypedDataUseCase)
    private readonly signTypedDataUseCase: SignTypedData,
    @inject(deviceModuleTypes.SignPersonalMessageUseCase)
    private readonly signPersonalMessageUseCase: SignPersonalMessage,
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: (prefix: string) => LoggerPublisher,
  ) {
    this.logger = loggerFactory("[DefaultTransactionService]");
  }

  sign(
    params:
      | SignRawTransactionParams
      | SignTypedMessageParams
      | SignTransactionParams
      | SignPersonalMessageParams,
  ): Observable<SignFlowStatus> {
    this._pendingParams = params;

    this.logger.debug("[Sign] Signing intent received", { params });

    let useCase: Observable<SignFlowStatus>;
    switch (true) {
      case isSignTransactionParams(params):
        this.logger.debug("[Sign] Signing transaction");
        useCase = this.signTransactionUseCase.execute(params);
        break;
      case isSignTypedMessageParams(params):
        this.logger.debug("[Sign] Signing typed data");
        useCase = this.signTypedDataUseCase.execute(params);
        break;
      case isSignPersonalMessageParams(params):
        this.logger.debug("[Sign] Signing personal message");
        useCase = this.signPersonalMessageUseCase.execute(params);
        break;
      case isSignRawTransactionParams(params):
      default:
        this.logger.debug("[Sign] Signing raw transaction");
        useCase = this.signRawTransactionUseCase.execute(params);
        break;
    }

    return useCase;
  }

  getPendingTransaction():
    | SignTransactionParams
    | SignRawTransactionParams
    | SignTypedMessageParams
    | SignPersonalMessageParams
    | undefined {
    return this._pendingParams;
  }

  setPendingTransaction(
    params?:
      | SignTransactionParams
      | SignRawTransactionParams
      | SignTypedMessageParams
      | SignPersonalMessageParams,
  ): void {
    this._pendingParams = params;
  }

  reset(): void {
    this._pendingParams = undefined;
  }
}
