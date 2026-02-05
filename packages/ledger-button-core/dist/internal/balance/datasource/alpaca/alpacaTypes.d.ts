export interface AlpacaBalanceRequest {
    address: string;
    currencyId: string;
}
export type AlpacaBalanceDto = {
    value: string;
    asset: AssetDto;
};
export type AlpacaBalanceResponse = AlpacaBalanceDto[];
export type AssetDto = {
    type: "native" | "erc20" | "erc721" | "erc1155";
    assetReference?: string;
};
export type AlpacaBalance = {
    value: string;
    type: "native" | "erc20" | "erc721" | "erc1155";
    reference?: string;
};
export type AlpacaTransactionIntent = {
    type: string;
    sender: string;
    recipient?: string;
    amount?: string;
    asset?: {
        type: string;
        assetReference?: string;
    };
    feesStrategy?: "slow" | "medium" | "fast";
    data?: string;
};
export type AlpacaFeeEstimationRequest = {
    intent: AlpacaTransactionIntent;
};
export type AlpacaEvmFeeEstimationParameters = {
    gasPrice?: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    nextBaseFee: string;
    gasLimit: string;
    gasOptions: Record<string, unknown>;
};
export type AlpacaFeeEstimationResponse = {
    value: string;
    parameters: AlpacaEvmFeeEstimationParameters;
};
//# sourceMappingURL=alpacaTypes.d.ts.map