import { Account } from "./service/AccountService.js";

const DERIVATION_MODE: Record<
  string,
  {
    skipFirst: boolean;
    derivationPath: string;
  }
> = {
  ethM: {
    derivationPath: "44'/60'/0'/<account>",
    skipFirst: false,
  },
  // MetaMask style
  ethMM: {
    derivationPath: "44'/60'/0'/0/<account>",
    skipFirst: true,
  },
  // MEW legacy derivation for eth
  etcM: {
    derivationPath: "44'/60'/160720'/0'/<account>",
    skipFirst: false,
  },
};

export function getDerivationPath(account: Account) {
  const index = account.index;
  if (DERIVATION_MODE[account.derivationMode]) {
    return DERIVATION_MODE[account.derivationMode].derivationPath.replace(
      "<account>",
      index.toString(),
    );
  }

  //Default Ledger Live derivation path mode
  return `44'/60'/${index}'/0/0`;
}
