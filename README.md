# Vexchange Adapter

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
