import { ethers } from 'hardhat'
import { expect } from 'chai'
import { ENERGY_CONTRACT_ADDRESS, PARAMS_CONTRACT_ADDRESS } from '../../../constants'
import { Energy, Params } from '../../../typechain-types'
import * as energyArtifact from '../../../artifacts/contracts/vechain/Energy.sol/Energy.json'
import * as paramsArtifact from '../../../artifacts/contracts/vechain/Params.sol/Params.json'
import { deployWVET } from './deploy-wvet'
import { deployVexchange } from './deploy-vexchange'
import { deployVexWrapper } from './deploy-vex-wrapper'
import { createVexchangePairTokenVET } from './create-vexchange-pair-token-vet'

const { getSigners, Contract, provider } = ethers

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

  const { wvet, wvetAddr } = await deployWVET({ deployer: god })

  const vexchange = await deployVexchange({ deployer: god, wethAddr: wvetAddr })
  const vexWrapper = await deployVexWrapper({ deployer: god, vexchange })
  const vexWrapperAddr = await vexWrapper.getAddress()

  return {
    god,
    alice,
    bob,
    energy,
    energyAddr,
    wvet,
    wvetAddr,
    baseGasPrice,
    vexchange,
    vexWrapper,
    vexWrapperAddr,
    createVexchangePairVTHO_VET: async ({ vthoAmount, vetAmount }: { vthoAmount: bigint; vetAmount: bigint }) =>
      createVexchangePairTokenVET({
        vexchange,
        token: energy,
        vetAmount,
        tokenAmount: vthoAmount,
        deployer: god,
      }),
  }
}
