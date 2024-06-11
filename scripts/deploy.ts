import { network, ethers } from 'hardhat'

const {
  name,
  config: { chainId },
} = network

async function main() {
  console.log('Deploying contract...')
  console.log(`Using network ${name} (${chainId})`)

  if (name == null || chainId == null || ![100010, 100009].includes(chainId)) {
    console.error('Unknown network')
    return
  }

  // Vex addresses taken from https://github.com/vexchange/vexchange-contracts
  const map: Record<number, Address> = {
    100010: '0x01d6b50b31c18d7f81ede43935cadf79901b0ea0', // testnet
    100009: '0x6c0a6e1d922e0e63901301573370b932ae20dadb', // mainnet
  }

  const vexAddr = map[chainId]

  const [deployer] = await ethers.getSigners()
  console.log({ deployer: await deployer.getAddress() })

  const VexWrapper = await ethers.getContractFactory('VexWrapper')
  const vexWrapper = await VexWrapper.connect(deployer).deploy(vexAddr)

  const receipt = await vexWrapper.waitForDeployment()
  console.log(JSON.stringify(receipt))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
