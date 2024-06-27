# Vexchange Wrapper

A wrapper around the Vexchange contract exposing the original uniswap V2 interface.

| Network  | Address                                    |
|----------|--------------------------------------------|
| Testnet  | `0x0bb72c2423cff281E9e7aa49b0ebb3a2D3280603` |
| Mainnet  | `0x3c3847A92B57A3163d26cc2eb22F53b33BaA34D8` |


## Getting started

To get started, clone the repository and set environment variables based on the provided example:

```
git clone git@github.com:vearnfi/vex-adapter.git
cd contracts
nvm use 18
npm i
cp ./env.example ./env
```

## Compile source code

```
npm run build
```

## Testing

Ensure your Docker daemon is running, and then launch a local blockchain:

```
systemctl start docker
docker-compose up -d
npm test
```

## Deployment

```
npm run deploy:testnet
npm run deploy:mainnet
```
