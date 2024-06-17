import { ethers } from 'hardhat'
import { expect } from 'chai'
import { ENERGY_CONTRACT_ADDRESS, PARAMS_CONTRACT_ADDRESS } from '../../../constants'
import { Energy, Params, VexchangeV2Factory, VexchangeV2Pair, VexchangeV2Router02 } from '../../../typechain-types'
import * as energyArtifact from '../../../artifacts/contracts/vechain/Energy.sol/Energy.json'
import * as paramsArtifact from '../../../artifacts/contracts/vechain/Params.sol/Params.json'

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

  const VexWrapper = await getContractFactory('VexWrapper', god)
  const vexWrapper = await VexWrapper.deploy(routerAddr)
  const vexWrapperAddr = await vexWrapper.getAddress()

  expect(await provider.getCode(vexWrapperAddr)).not.to.have.length(0)

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
    vexWrapper,
    vexWrapperAddr,
  }
}
