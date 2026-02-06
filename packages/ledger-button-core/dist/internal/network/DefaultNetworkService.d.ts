import { Either } from 'purify-ts';
import { NetworkServiceOpts } from './model/types.js';
import { Config } from '../config/model/config.js';
import { NetworkService } from './NetworkService.js';
export declare class DefaultNetworkService implements NetworkService<NetworkServiceOpts> {
    private readonly config;
    private headers;
    constructor(config: Config);
    get<T>(url: string, options?: NetworkServiceOpts): Promise<Either<Error, T>>;
    post<T>(url: string, body: unknown, options?: NetworkServiceOpts): Promise<Either<Error, T>>;
    put<T>(url: string, body: unknown, options?: NetworkServiceOpts): Promise<Either<Error, T>>;
    patch<T>(url: string, body: unknown, options?: NetworkServiceOpts): Promise<Either<Error, T>>;
    delete<T>(url: string, options?: NetworkServiceOpts): Promise<Either<Error, T>>;
}
//# sourceMappingURL=DefaultNetworkService.d.ts.map