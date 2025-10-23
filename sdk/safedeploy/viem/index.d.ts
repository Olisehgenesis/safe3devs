import { WalletClient, PublicClient, Hex, Address, Chain } from 'viem';
import { Safe3QRDeploy, Safe3QRDeployOptions, Safe3Signer } from '../core';
export interface Safe3ViemClientOptions extends Safe3QRDeployOptions {
    chainId?: number;
    rpcUrl?: string;
}
export interface DeployContractOptions {
    abi: any[];
    bytecode: Hex;
    args?: any[];
    value?: bigint;
    gas?: bigint;
    gasPrice?: bigint;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
}
export declare class Safe3ViemClient extends Safe3QRDeploy implements Safe3Signer {
    private walletClient;
    private publicClient;
    private chain;
    private viemOptions;
    constructor(options: Safe3ViemClientOptions);
    /**
     * Connect to wallet and setup viem clients
     */
    connectWallet(): Promise<any>;
    /**
     * Setup viem wallet and public clients
     */
    private setupViemClients;
    /**
     * Get viem wallet client
     */
    getClient(): WalletClient;
    /**
     * Get viem public client
     */
    getPublicClient(): PublicClient;
    /**
     * Deploy a contract using viem
     */
    deployContract(options: DeployContractOptions): Promise<Address>;
    /**
     * Deploy contract and get contract instance
     */
    deployContractAndGetInstance(options: DeployContractOptions): Promise<{
        read: {
            [x: string]: (args: any[], options?: import("viem").Prettify<import("viem").UnionOmit<import("viem").ReadContractParameters<any[], any, any[]>, "args" | "address" | "abi" | "functionName">> | undefined) => Promise<any[]>;
        };
        estimateGas: {
            [x: string]: (args: any[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<any[], any, any[], Chain | undefined>, "args" | "address" | "abi" | "functionName">>) => Promise<import("viem").EstimateContractGasReturnType>;
        } & {
            [x: string]: (args: any[], options: import("viem").Prettify<import("viem").UnionOmit<import("viem").EstimateContractGasParameters<any[], any, any[], Chain | undefined>, "args" | "address" | "abi" | "functionName">>) => Promise<import("viem").EstimateContractGasReturnType>;
        };
        simulate: {
            [x: string]: <chainOverride extends Chain | undefined = undefined, accountOverride extends import("viem").Account | Address | undefined = undefined>(args: any[], options?: Omit<import("viem").SimulateContractParameters<any[], any, any[], Chain | undefined, chainOverride, accountOverride>, "args" | "address" | "abi" | "functionName"> | undefined) => Promise<import("viem").SimulateContractReturnType<any[], any, any[], Chain | undefined, import("viem").Account | undefined, chainOverride, accountOverride>>;
        };
        createEventFilter: {
            [x: string]: <const args extends Record<string, unknown> | readonly unknown[] | readonly [] | undefined, strict extends boolean | undefined = undefined>(args: readonly [] | {} | (readonly [] extends infer T ? T extends readonly [] ? T extends args ? Readonly<args> : never : never : never) | ({} extends infer T_1 ? T_1 extends {} ? T_1 extends args ? Readonly<args> : never : never : never), options?: ({
                fromBlock?: bigint | import("viem").BlockTag | undefined;
                toBlock?: bigint | import("viem").BlockTag | undefined;
            } & {
                strict?: strict | undefined;
            }) | undefined) => Promise<import("viem").CreateContractEventFilterReturnType<any[], any, args, strict>>;
        };
        getEvents: {
            [x: string]: (args?: readonly [] | {} | undefined, options?: {
                strict?: boolean | undefined;
                blockHash?: `0x${string}` | undefined;
                fromBlock?: bigint | import("viem").BlockTag | undefined;
                toBlock?: bigint | import("viem").BlockTag | undefined;
            } | undefined) => Promise<import("viem").GetContractEventsReturnType<any[], any>>;
        };
        watchEvent: {
            [x: string]: (args: readonly [] | {}, options: {
                batch?: boolean | undefined | undefined;
                pollingInterval?: number | undefined | undefined;
                strict?: boolean | undefined;
                fromBlock?: bigint | undefined;
                onError?: ((error: Error) => void) | undefined | undefined;
                onLogs: import("viem").WatchContractEventOnLogsFn<any[], any, undefined>;
                poll?: true | undefined | undefined;
            }) => import("viem").WatchContractEventReturnType;
        };
        write: {
            [x: string]: <chainOverride extends Chain | undefined, options extends (import("viem").UnionOmit<{
                abi: any[];
                functionName: any;
                args?: any[] | readonly any[] | undefined;
            } & {
                args: readonly any[];
            } & {
                address: Address;
            } & {
                chain: chainOverride | null;
            } & {
                account: `0x${string}` | import("viem").Account | null;
                value?: undefined | undefined;
                dataSuffix?: `0x${string}` | undefined;
            } & import("viem").UnionEvaluate<import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<Chain | undefined, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from" | "to" | "value" | "data">>, "args" | "address" | "abi" | "functionName"> extends infer T ? { [K in keyof T]: T[K]; } : never) | (import("viem").UnionOmit<{
                abi: any[];
                functionName: any;
                args?: any[] | readonly any[] | undefined;
            } & {
                args: readonly any[];
            } & {
                address: Address;
            } & {
                chain: chainOverride | null;
            } & {
                account: `0x${string}` | import("viem").Account | null;
                value?: import("viem").NoInfer<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<Chain | undefined, chainOverride>, "transactionRequest", import("viem").TransactionRequest>["value"]> | undefined;
                dataSuffix?: `0x${string}` | undefined;
            } & import("viem").UnionEvaluate<import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<Chain | undefined, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from" | "to" | "value" | "data">>, "args" | "address" | "abi" | "functionName"> extends infer T_1 ? { [K_1 in keyof T_1]: T_1[K_1]; } : never) | (import("viem").UnionOmit<{
                abi: any[];
                functionName: any;
                args?: any[] | readonly any[] | undefined;
            } & {
                args: readonly any[];
            } & {
                address: Address;
            } & {
                chain: chainOverride | null;
            } & {
                account: `0x${string}` | import("viem").Account | null;
                value?: import("viem").NoInfer<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<Chain | undefined, chainOverride>, "transactionRequest", import("viem").TransactionRequest>["value"]> | undefined;
                dataSuffix?: `0x${string}` | undefined;
            } & import("viem").UnionEvaluate<import("viem").UnionOmit<import("viem").ExtractChainFormatterParameters<import("viem").DeriveChain<Chain | undefined, chainOverride>, "transactionRequest", import("viem").TransactionRequest>, "from" | "to" | "value" | "data">>, "args" | "address" | "abi" | "functionName"> extends infer T_2 ? { [K_2 in keyof T_2]: T_2[K_2]; } : never)>(args: any[], options: options) => Promise<import("viem").WriteContractReturnType>;
        };
        address: `0x${string}`;
        abi: any[];
    }>;
    /**
     * Sign a message using WalletConnect
     */
    signMessage(message: string): Promise<string>;
    /**
     * Send a transaction using WalletConnect
     */
    sendTransaction(transaction: any): Promise<string>;
    /**
     * Sign a transaction using WalletConnect
     */
    signTransaction(transaction: any): Promise<string>;
    /**
     * Sign typed data using WalletConnect
     */
    signTypedData(address: string, typedData: any): Promise<string>;
    /**
     * Get chain configuration by ID
     */
    private getChainById;
    /**
     * Get default RPC URL for chain
     */
    private getDefaultRpcUrl;
    /**
     * Switch to a different chain
     */
    switchChain(chainId: number): Promise<void>;
    /**
     * Get current chain
     */
    getChain(): Chain;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map