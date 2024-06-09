import { ethers } from 'hardhat'
import type { AddressLike } from 'ethers'
import { expect } from 'chai'
import { ENERGY_CONTRACT_ADDRESS, PARAMS_CONTRACT_ADDRESS } from '../../../constants'
import { Energy, Params, VexchangeV2Factory, VexchangeV2Pair, VexchangeV2Router02 } from '../../../typechain-types'
import * as energyArtifact from '../../../artifacts/contracts/vechain/Energy.sol/Energy.json'
import * as paramsArtifact from '../../../artifacts/contracts/vechain/Params.sol/Params.json'
import * as pairArtifact from '../../../artifacts/contracts/vexchange/vexchange-v2-core/contracts/VexchangeV2Pair.sol/VexchangeV2Pair.json'
import { expandTo18Decimals } from './expand-to-18-decimals'
import { approveEnergy } from './approve-energy'

const { getSigners, getContractFactory, Contract, ZeroAddress, MaxUint256, provider } = ethers

export async function fixture() {
  // NOTE: these account run out of gas the more we run tests! Fix!
  const [god, alice, bob] = await getSigners()

  const energy = new Contract(ENERGY_CONTRACT_ADDRESS, energyArtifact.abi, god) as unknown as Energy
  const energyAddr = await energy.getAddress()

  expect(await provider.getCode(energyAddr)).not.to.have.length(0)

  const params = new Contract(PARAMS_CONTRACT_ADDRESS, paramsArtifact.abi, god) as unknown as Params
  const paramsAddr = await params.getAddress()

  expect(await provider.getCode(paramsAddr)).not.to.have.length(0)

  // await provider.getFeeData()).gasPrice -> 0n

  const baseGasPriceKey = '0x000000000000000000000000000000000000626173652d6761732d7072696365'
  // ^ https://github.com/vechain/thor/blob/f77ab7f286d3b53da1b48c025afc633a7bd03561/thor/params.go#L44
  const baseGasPrice = (await params.get(baseGasPriceKey)) as bigint
  // ^ baseGasPrice is 1e^15, 2 orders of magnitude higher than on live networks

  const WVET = await getContractFactory('WVET', god)
  const wvet = await WVET.deploy()
  const wvetAddr = await wvet.getAddress()

  expect(await provider.getCode(wvetAddr)).not.to.have.length(0)

  const Factory = await getContractFactory('VexchangeV2Factory', god)
  const factory = await Factory.deploy(200, 5000, god.address, god.address)
  const factoryAddr = await factory.getAddress()

  expect(await provider.getCode(factoryAddr)).not.to.have.length(0)

  const Router = await getContractFactory('VexchangeV2Router02', god)
  const router = await Router.deploy(factoryAddr, wvetAddr)
  const routerAddr = await router.getAddress()

  expect(await provider.getCode(routerAddr)).not.to.have.length(0)

  const Adapter = await getContractFactory('VexchangeV2Router02Adapter', god)
  const adapter = await Adapter.deploy(routerAddr)
  const adapterAddr = await adapter.getAddress()

  expect(await provider.getCode(adapterAddr)).not.to.have.length(0)

  // Create WVET-VTHO pair
  // const tx1 = await factory.createPair(energyAddr, wvetAddr)
  // await tx1.wait(1)

  // const pairAddress = await factory.getPair(energyAddr, wvetAddr)

  // const pair = new Contract(pairAddress, pairArtifact.abi, god) as unknown as VexchangeV2Pair

  // expect(await provider.getCode(pair.getAddress())).not.to.have.length(0)

  // const reserves = await pair.getReserves()
  // expect(reserves[0]).to.equal(0)
  // expect(reserves[1]).to.equal(0)

  // // Provide liquidity with a 1 WVET - 20 VTHO exchange rate
  // await approveEnergy(energy, god, routerAddr, MaxUint256)

  // const token0Amount = expandTo18Decimals(20000) // energy/vtho
  // const token1Amount = expandTo18Decimals(1000) // wvet

  // const addLiquidityTx = await router.connect(god).addLiquidityVET(
  //   energyAddr, // token
  //   token0Amount, // amountTokenDesired
  //   0, // amountTokenMin
  //   0, // amountETHMin,
  //   god.address, // to: recipient of the liquidity tokens
  //   MaxUint256, // deadline
  //   { value: token1Amount, gasLimit: 300000 /*hexlify(9999999) */ }
  // )

  // await addLiquidityTx.wait()

  // // Validate reserves
  // const reserves2 = await pair.getReserves()
  // expect(reserves2[0]).to.equal(token0Amount)
  // expect(reserves2[1]).to.equal(token1Amount)

  // Burn all VET from all test accounts in order to avoid changes in VTHO balance
  for (const signer of [alice, bob]) {
    const signerBalanceVET_0 = await provider.getBalance(signer.getAddress())
    const tx = await signer.sendTransaction({
      to: ZeroAddress,
      value: signerBalanceVET_0,
    })
    await tx.wait()
    const signerBalanceVET_1 = await provider.getBalance(signer.getAddress())
    expect(signerBalanceVET_1).to.equal(0)
  }

  return {
    god,
    alice,
    bob,
    energy,
    energyAddr,
    wvet,
    wvetAddr,
    baseGasPrice,
    factory,
    factoryAddr,
    router,
    routerAddr,
    // pair,
    adapter,
    adapterAddr,
  }
}
