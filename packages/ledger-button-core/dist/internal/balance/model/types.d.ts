export type AccountBalance = {
    nativeBalance: NativeBalance;
    tokenBalances: TokenBalance[];
};
export type NativeBalance = {
    readonly balance: bigint;
};
export type TransactionInfo = {
    from: string;
    to: string;
    value: string;
    data: string;
    chainId: string;
};
export type GasFeeEstimation = {
    gasLimit: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
};
export declare class TokenBalance {
    readonly ledgerId: string;
    readonly decimals: number;
    readonly balance: bigint;
    readonly name: string;
    readonly ticker: string;
    constructor(ledgerId: string, decimals: number, balance: bigint, name: string, ticker: string);
    get balanceFormatted(): string;
}
//# sourceMappingURL=types.d.ts.map