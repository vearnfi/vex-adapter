# Wrapped Vexchange

## Getting started

To get started, clone the repository and set environment variables based on the provided example:

```
git clone ...
cd contracts
npm i
cp ./env.example ./env
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
