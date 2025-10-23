# Safe3Devs QR Deploy CLI Examples

## Basic Usage

### 1. Connect to Wallet

```bash
# Connect using ethers client (default)
safe3 connect --project-id YOUR_PROJECT_ID

# Connect using viem client
safe3 connect --client viem --project-id YOUR_PROJECT_ID

# Connect to specific network
safe3 connect --network polygon --project-id YOUR_PROJECT_ID
```

### 2. Check Connection Status

```bash
safe3 status --project-id YOUR_PROJECT_ID
```

### 3. Deploy Contract

```bash
# Deploy from JSON file (compiled contract)
safe3 deploy --file ./artifacts/contracts/Greeter.sol/Greeter.json --args '["Hello World!"]' --project-id YOUR_PROJECT_ID

# Deploy to specific network
safe3 deploy --file ./contract.json --network polygon --project-id YOUR_PROJECT_ID

# Use custom RPC URL
safe3 deploy --file ./contract.json --rpc-url https://custom-rpc.com --project-id YOUR_PROJECT_ID
```

## Environment Variables

Create a `.env` file:

```env
WALLETCONNECT_PROJECT_ID=your_project_id_here
MAINNET_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon.llamarpc.com
```

Then use without `--project-id`:

```bash
safe3 connect
safe3 deploy --file ./contract.json --args '["Hello!"]'
```

## Supported Networks

- `mainnet` or `1` - Ethereum Mainnet
- `polygon` or `137` - Polygon
- `bsc` or `56` - BSC
- `arbitrum` or `42161` - Arbitrum
- `optimism` or `10` - Optimism
- `base` or `8453` - Base

## Contract File Formats

### JSON Format (Compiled Contract)

```json
{
  "abi": [...],
  "bytecode": "0x608060405234801561001057600080fd5b50..."
}
```

### Solidity Files

For `.sol` files, use Hardhat integration instead:

```bash
npx hardhat safe3:deploy --contract Greeter --args '["Hello World!"]'
```

## Advanced Examples

### Deploy with Multiple Arguments

```bash
safe3 deploy --file ./MultiArgContract.json --args '[42, "test", true]' --project-id YOUR_PROJECT_ID
```

### Deploy to Testnet

```bash
safe3 deploy --file ./contract.json --network polygon --project-id YOUR_PROJECT_ID
```

### Use Viem Client

```bash
safe3 deploy --client viem --file ./contract.json --args '["Hello Viem!"]' --project-id YOUR_PROJECT_ID
```

## Integration with Hardhat

The CLI works alongside Hardhat integration:

```bash
# Compile contracts
npx hardhat compile

# Deploy using Hardhat plugin
npx hardhat safe3:deploy --contract Greeter --args '["Hello Hardhat!"]'

# Or use CLI with compiled artifacts
safe3 deploy --file ./artifacts/contracts/Greeter.sol/Greeter.json --args '["Hello CLI!"]'
```

## Error Handling

Common error scenarios and solutions:

### Missing Project ID
```
❌ WalletConnect Project ID is required.
```
**Solution**: Set `WALLETCONNECT_PROJECT_ID` environment variable or use `--project-id` flag.

### Contract File Not Found
```
❌ Contract file not found: ./contract.json
```
**Solution**: Check file path and ensure file exists.

### Invalid Contract JSON
```
❌ Invalid contract JSON file. Must contain "abi" and "bytecode" fields.
```
**Solution**: Ensure JSON file has proper structure with `abi` and `bytecode` fields.

### Network Connection Issues
```
❌ Connection failed: Network error
```
**Solution**: Check internet connection and RPC URL validity.

## Tips and Best Practices

1. **Always test on testnets first** before deploying to mainnet
2. **Use environment variables** for sensitive configuration
3. **Verify contract addresses** after deployment
4. **Keep your WalletConnect Project ID secure**
5. **Use specific network flags** for multi-chain deployments
6. **Compile contracts first** when using Solidity files
7. **Check connection status** before attempting deployments
