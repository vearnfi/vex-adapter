import { ethers } from 'hardhat'
import { expect } from 'chai'
import { VexchangeV2Factory, VexchangeV2Pair, VexchangeV2Router02 } from '../../../typechain-types'
import * as pairArtifact from '../../../artifacts/contracts/vexchange/vexchange-v2-core/contracts/VexchangeV2Pair.sol/VexchangeV2Pair.json'
import { approveToken } from './approve-token'
import type { Token } from './approve-token'

const { Contract, MaxUint256 } = ethers

type Params = {
  token: Token
  vetAmount: bigint
  tokenAmount: bigint
  factory: VexchangeV2Factory
  router: VexchangeV2Router02
  deployer: any // HardhatEthersSigner
}

export async function createPairTokenVET({
  token,
  vetAmount,
  tokenAmount,
  factory,
  router,
  deployer,
}: Params): Promise<VexchangeV2Pair> {
  const wvetAddr = await router.VVET()
  const tokenAddr = await token.getAddress()
  const routerAddr = await router.getAddress()

  // Create pair
  const tx1 = await factory.createPair(wvetAddr, tokenAddr)
  await tx1.wait(1)

  const pairAddress = await factory.getPair(wvetAddr, tokenAddr)

  const pair = new Contract(pairAddress, pairArtifact.abi, deployer) as unknown as VexchangeV2Pair

  const reserves = await pair.getReserves()
  expect(reserves[0]).to.equal(0)
  expect(reserves[1]).to.equal(0)

  // Provide liquidity
  await approveToken(token, deployer, routerAddr, MaxUint256)

  const addLiquidityTx = await router.connect(deployer).addLiquidityVET(
    tokenAddr, // token
    tokenAmount, // amountTokenDesired
    0, // amountTokenMin
    0, // amountETHMin,
    deployer.address, // to: recipient of the liquidity tokens
    MaxUint256, // deadline
    { value: vetAmount }
  )

  await addLiquidityTx.wait()

  return pair
}
