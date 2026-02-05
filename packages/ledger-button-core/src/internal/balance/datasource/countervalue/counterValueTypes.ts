export type CounterValueRequest = {
  froms: string[];
  to: string;
};

export type CounterValuedResponse = Record<string, number>;

export type CounterValueResult = {
  ledgerId: string;
  rate: number;
};
