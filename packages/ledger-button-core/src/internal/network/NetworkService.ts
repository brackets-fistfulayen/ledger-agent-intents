import { Either } from "purify-ts";

export type NetworkService<Opts> = {
  get<T>(url: string, options?: Opts): Promise<Either<Error, T>>;
  post<T>(
    url: string,
    body: unknown,
    options?: Opts
  ): Promise<Either<Error, T>>;
  put<T>(url: string, body: unknown, options?: Opts): Promise<Either<Error, T>>;
  patch<T>(
    url: string,
    body: unknown,
    options?: Opts
  ): Promise<Either<Error, T>>;
  delete<T>(url: string, options?: Opts): Promise<Either<Error, T>>;
};
