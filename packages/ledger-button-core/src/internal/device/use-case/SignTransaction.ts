import { type Factory, inject, injectable } from "inversify";
import { from, Observable, switchMap } from "rxjs";

import { SignFlowStatus } from "../../../api/model/signing/SignFlowStatus.js";
import {
  SignTransactionParams,
  Transaction,
} from "../../../api/model/signing/SignTransactionParams.js";
import { getRawTransactionFromEipTransaction } from "../../../internal/transaction/utils/TransactionHelper.js";
import { balanceModuleTypes } from "../../balance/balanceModuleTypes.js";
import { type GasFeeEstimationService } from "../../balance/service/GasFeeEstimationService.js";
import { contextModuleTypes } from "../../context/contextModuleTypes.js";
import { type ContextService } from "../../context/ContextService.js";
import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import { storageModuleTypes } from "../../storage/storageModuleTypes.js";
import { type StorageService } from "../../storage/StorageService.js";
import { deviceModuleTypes } from "../deviceModuleTypes.js";
import { SignRawTransaction } from "./SignRawTransaction.js";
@injectable()
export class SignTransaction {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(balanceModuleTypes.GasFeeEstimationService)
    private readonly gasFeeEstimationService: GasFeeEstimationService,
    @inject(storageModuleTypes.StorageService)
    private readonly storageService: StorageService,
    @inject(deviceModuleTypes.SignRawTransactionUseCase)
    private readonly signRawTransaction: SignRawTransaction,
    @inject(contextModuleTypes.ContextService)
    private readonly contextService: ContextService,
  ) {
    this.logger = loggerFactory("[SignTransaction]");
  }

  execute(params: SignTransactionParams): Observable<SignFlowStatus> {
    this.logger.info("Starting transaction signing", { params });
    const { transaction, broadcast, method } = params;

    const initObservable: Observable<Transaction> = from(
      this.completeTransaction(transaction),
    );

    return initObservable.pipe(
      switchMap((transactionWithFees) => {
        const rawTransaction =
          getRawTransactionFromEipTransaction(transactionWithFees);

        this.logger.debug("Raw transaction", { rawTransaction });

        return this.signRawTransaction.execute({
          transaction: rawTransaction,
          broadcast: broadcast,
          method: method,
        });
      }),
    );
  }

  private async addFeesToTransaction(
    transaction: Transaction,
  ): Promise<Transaction> {
    try {
      const fees = await this.gasFeeEstimationService.getFeesForTransaction({
        from:
          transaction.from ||
          this.storageService.getSelectedAccount()?.extract()?.freshAddress ||
          "", //Should never happen
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        chainId: transaction.chainId.toString(),
      });

      const transactionWithFees = {
        ...transaction,
        gas: fees.gasLimit,
        maxFeePerGas: fees.maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      };

      this.logger.debug("Transaction with fees", { transactionWithFees });

      return transactionWithFees;
    } catch (error) {
      this.logger.error("Failed to add fees to transaction", { error });
      throw error;
    }
  }

  private async addNonceToTransaction(
    transaction: Transaction,
  ): Promise<Transaction> {
    try {
      const nonce = await this.gasFeeEstimationService.getNonceForTx({
        from:
          transaction.from ||
          this.storageService.getSelectedAccount()?.extract()?.freshAddress ||
          "", //Should never happen
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        chainId: transaction.chainId.toString(),
      });

      const transactionWithNonce = {
        ...transaction,
        nonce: nonce,
      };

      this.logger.debug("Transaction with nonce", { transactionWithNonce });

      return transactionWithNonce;
    } catch (error) {
      this.logger.error("Failed to add nonce to transaction", { error });
      throw error;
    }
  }

  private async completeTransaction(
    transaction: Transaction,
  ): Promise<Transaction> {
    let completedTransaction: Transaction = transaction;

    if (!completedTransaction.chainId) {
      this.logger.debug("Chain ID is not set");
      completedTransaction = {
        ...completedTransaction,
        chainId: this.contextService.getContext().chainId,
      };
    }

    if (
      !completedTransaction.gas &&
      !completedTransaction.maxFeePerGas &&
      !completedTransaction.maxPriorityFeePerGas
    ) {
      this.logger.debug(
        "Gas or max fee per gas or max priority fee per gas is not set",
      );
      completedTransaction =
        await this.addFeesToTransaction(completedTransaction);
    }

    if (!completedTransaction.nonce) {
      this.logger.debug("Nonce is not set");
      completedTransaction =
        await this.addNonceToTransaction(completedTransaction);
    }

    this.logger.debug("Transaction completed", { completedTransaction });
    return completedTransaction;
  }
}
