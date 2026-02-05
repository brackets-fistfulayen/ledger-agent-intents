import type { Factory } from "inversify";
import { inject, injectable } from "inversify";
import { Either, Left, Right } from "purify-ts";

import { loggerModuleTypes } from "../../logger/loggerModuleTypes.js";
import type { LoggerPublisher } from "../../logger/service/LoggerPublisher.js";
import type { TransactionHistoryDataSource } from "../datasource/TransactionHistoryDataSource.js";
import { TransactionHistoryError } from "../model/TransactionHistoryError.js";
import {
  ExplorerResponse,
  ExplorerTransaction,
  TransactionHistoryItem,
  TransactionHistoryOptions,
  TransactionHistoryResult,
  TransactionType,
} from "../model/transactionHistoryTypes.js";
import { transactionHistoryModuleTypes } from "../transactionHistoryModuleTypes.js";

@injectable()
export class FetchTransactionHistoryUseCase {
  private readonly logger: LoggerPublisher;

  constructor(
    @inject(loggerModuleTypes.LoggerPublisher)
    loggerFactory: Factory<LoggerPublisher>,
    @inject(transactionHistoryModuleTypes.TransactionHistoryDataSource)
    private readonly dataSource: TransactionHistoryDataSource,
  ) {
    this.logger = loggerFactory("[FetchTransactionHistoryUseCase]");
  }

  async execute(
    blockchain: string,
    address: string,
    options?: TransactionHistoryOptions,
  ): Promise<Either<TransactionHistoryError, TransactionHistoryResult>> {
    this.logger.debug("Fetching transaction history", {
      blockchain,
      address,
      options,
    });

    const result = await this.dataSource.getTransactions(
      blockchain,
      address,
      options,
    );

    return result.caseOf({
      Left: (error) => {
        this.logger.error("Failed to fetch transaction history", { error });
        return Left(error);
      },
      Right: (explorerResponse) => {
        const transformedResult = this.transformResponse(
          explorerResponse,
          address.toLowerCase(),
        );

        this.logger.debug("Transaction history fetched successfully", {
          transactionCount: transformedResult.transactions.length,
          hasNextPage: !!transformedResult.nextPageToken,
        });

        return Right(transformedResult);
      },
    });
  }

  private transformResponse(
    response: ExplorerResponse,
    normalizedAddress: string,
  ): TransactionHistoryResult {
    const transactions = response.data.map((tx) =>
      this.transformTransaction(tx, normalizedAddress),
    );

    return {
      transactions,
      nextPageToken: response.token ?? undefined,
    };
  }

  private transformTransaction(
    tx: ExplorerTransaction,
    normalizedAddress: string,
  ): TransactionHistoryItem {
    const type = this.determineTransactionType(tx, normalizedAddress);
    const value = this.calculateTransactionValue(tx, normalizedAddress, type);
    const timestamp = this.extractTimestamp(tx);

    return {
      hash: tx.hash,
      type,
      value,
      timestamp,
    };
  }

  private determineTransactionType(
    tx: ExplorerTransaction,
    normalizedAddress: string,
  ): TransactionType {
    const isSender = tx.from.toLowerCase() === normalizedAddress;

    const isRecipientInTransfer = tx.transfer_events.some(
      (event) => event.to.toLowerCase() === normalizedAddress,
    );

    if (isSender && !isRecipientInTransfer) {
      return "sent";
    }

    return isRecipientInTransfer || tx.to.toLowerCase() === normalizedAddress
      ? "received"
      : "sent";
  }

  private calculateTransactionValue(
    tx: ExplorerTransaction,
    normalizedAddress: string,
    type: TransactionType,
  ): string {
    const tokenTransferValue = this.getTokenTransferValue(
      tx,
      normalizedAddress,
      type,
    );
    if (tokenTransferValue !== "0") {
      return tokenTransferValue;
    }

    return this.getNativeValue(tx, normalizedAddress, type);
  }

  private getTokenTransferValue(
    tx: ExplorerTransaction,
    normalizedAddress: string,
    type: TransactionType,
  ): string {
    const relevantTransfers = tx.transfer_events.filter((event) => {
      if (type === "received") {
        return event.to.toLowerCase() === normalizedAddress;
      }
      return event.from.toLowerCase() === normalizedAddress;
    });

    if (relevantTransfers.length === 0) {
      return "0";
    }

    // Sum up all relevant transfer values
    const totalValue = relevantTransfers.reduce(
      (sum, transfer) => sum + BigInt(transfer.count),
      BigInt(0),
    );

    return totalValue.toString();
  }

  private getNativeValue(
    tx: ExplorerTransaction,
    normalizedAddress: string,
    type: TransactionType,
  ): string {
    const relevantActions = tx.actions.filter((action) => {
      if (type === "received") {
        return action.to.toLowerCase() === normalizedAddress;
      }
      return action.from.toLowerCase() === normalizedAddress;
    });

    if (relevantActions.length > 0) {
      const totalValue = relevantActions.reduce(
        (sum, action) => sum + BigInt(action.value),
        BigInt(0),
      );
      return totalValue.toString();
    }

    if (
      type === "received" &&
      tx.to.toLowerCase() === normalizedAddress &&
      tx.value !== "0"
    ) {
      return tx.value;
    }

    if (type === "sent" && tx.from.toLowerCase() === normalizedAddress) {
      return tx.value;
    }

    return "0";
  }

  private extractTimestamp(tx: ExplorerTransaction): string {
    return tx.block?.time ?? tx.received_at;
  }
}
