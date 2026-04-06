# ZK Tools Installation

The application requires `circom` and `snarkjs` for zero-knowledge proof generation. These have been installed locally in the project.

## Installation Status

✅ **Installed locally in:** `Z plus/node_modules/`

The code will automatically find these tools. If you need to reinstall:

```bash
cd "Z plus"
npm install circom snarkjs
```

## Global Installation (Optional)

If you prefer global installation (requires sudo):

```bash
sudo npm install -g circom snarkjs
```

## Verification

To verify the tools are working:

```bash
cd "Z plus"
npx circom --version
npx snarkjs --version
```

## Troubleshooting

If you get errors about missing tools:

1. **Check if tools are installed:**
   ```bash
   ls "Z plus/node_modules/.bin/" | grep -E "(circom|snarkjs)"
   ```

2. **Reinstall if needed:**
   ```bash
   cd "Z plus"
   npm install circom snarkjs
   ```

3. **The code will automatically use:**
   - Local node_modules (if available)
   - npx (if available)
   - Global installation (if available)
   - Show helpful error message if none found

