import { Account } from "../../../internal/account/service/AccountService.js";

export type AccountDbModel = {
  address: string;
  currencyId: string;
  derivationMode: string;
  index: number;
};

export function mapToAccountDbModel(account: Account): AccountDbModel {
  return {
    address: account.freshAddress,
    currencyId: account.currencyId,
    derivationMode: account.derivationMode,
    index: account.index,
  };
}
