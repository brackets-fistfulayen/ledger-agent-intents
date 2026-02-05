/*
@injectable()
export class StubAlpacaDataSource implements AlpacaDataSource {
  private readonly stubNativeBalances: Record<string, string> = {
    "0x1234567890123456789012345678901234567890": "1000000000000000000",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": "2500000000000000000",
    "0x9999999999999999999999999999999999999999": "500000000000000000",
  };

  private readonly stubTokenBalances: Record<string, TokenBalance[]> = {
    "0x1234567890123456789012345678901234567890": [
      {
        contractAddress: "0xa0b86a33e6441e6d4eed6cb6a6f8e7a7b8a2c5f1",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        balance: "1000000000",
        balanceFormatted: "1000.0",
        standard: "ERC20",
      },
      {
        contractAddress: "0xb0c96a33e6441e6d4eed6cb6a6f8e7a7b8a2c5f2",
        symbol: "DAI",
        name: "Dai Stablecoin",
        decimals: 18,
        balance: "500000000000000000000",
        balanceFormatted: "500.0",
        standard: "ERC20",
      },
    ],
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": [
      {
        contractAddress: "0xa0b86a33e6441e6d4eed6cb6a6f8e7a7b8a2c5f1",
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        balance: "2000000000",
        balanceFormatted: "2000.0",
        standard: "ERC20",
      },
    ],
    "0x9999999999999999999999999999999999999999": [],
  };

  private readonly stubTransactionHistory: Record<string, boolean> = {
    "0x1234567890123456789012345678901234567890": true,
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd": true,
    "0x9999999999999999999999999999999999999999": false,
  };

  async getNativeBalance(
    address: string,
    chainConfig: EvmChainConfig,
  ): Promise<Either<AlpacaServiceError, NativeBalance>> {
    const balance = this.stubNativeBalances[address.toLowerCase()];

    if (!balance) {
      return Right({
        symbol: chainConfig.nativeCurrency.symbol,
        balance: "0",
        balanceFormatted: "0",
      });
    }

    const balanceFormatted = this.formatBalance(
      BigInt(balance),
      chainConfig.nativeCurrency.decimals,
    );

    return Right({
      symbol: chainConfig.nativeCurrency.symbol,
      balance,
      balanceFormatted,
    });
  }

  async getTokenBalances(
    address: string,
    _chainConfig: EvmChainConfig,
  ): Promise<Either<AlpacaServiceError, TokenBalance[]>> {
    const tokens = this.stubTokenBalances[address.toLowerCase()] || [];

    return Right([...tokens]);
  }

  async getTokenBalance(
    address: string,
    contractAddress: string,
    chainConfig: EvmChainConfig,
  ): Promise<Either<AlpacaServiceError, TokenBalance>> {
    const tokens = this.stubTokenBalances[address.toLowerCase()] || [];
    const token = tokens.find(
      (t) => t.contractAddress.toLowerCase() === contractAddress.toLowerCase(),
    );

    if (!token) {
      return Left(
        AlpacaServiceErrors.tokenFetchError(
          address,
          chainConfig.name,
          new Error("Token not found in stub data"),
        ),
      );
    }

    return Right({ ...token });
  }

  async hasTransactionHistory(
    address: string,
    _chainConfig: EvmChainConfig,
  ): Promise<Either<AlpacaServiceError, boolean>> {
    const hasHistory =
      this.stubTransactionHistory[address.toLowerCase()] ?? false;

    return Right(hasHistory);
  }

  private formatBalance(balance: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;

    if (fractionalPart === BigInt(0)) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "");

    if (trimmedFractional === "") {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  }

  setNativeBalance(address: string, balance: string): void {
    this.stubNativeBalances[address.toLowerCase()] = balance;
  }

  setTokenBalances(address: string, tokens: TokenBalance[]): void {
    this.stubTokenBalances[address.toLowerCase()] = tokens;
  }

  setTransactionHistory(address: string, hasHistory: boolean): void {
    this.stubTransactionHistory[address.toLowerCase()] = hasHistory;
  }

  clearStubData(): void {
    Object.keys(this.stubNativeBalances).forEach((key) => {
      delete this.stubNativeBalances[key];
    });
    Object.keys(this.stubTokenBalances).forEach((key) => {
      delete this.stubTokenBalances[key];
    });
    Object.keys(this.stubTransactionHistory).forEach((key) => {
      delete this.stubTransactionHistory[key];
    });
  }
}
*/
