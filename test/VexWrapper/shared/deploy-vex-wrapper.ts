import { ethers } from 'hardhat'
import { expect } from 'chai'

const { getContractFactory, provider } = ethers

type Params = {
  deployer: any
  vexchange: {
    routerAddr: string
  }
}

export async function deployVexWrapper({ deployer, vexchange }: Params) {
  const Wrapper = await getContractFactory('VexWrapper', deployer)
  const wrapper = await Wrapper.deploy(vexchange.routerAddr)
  const wrapperAddr = await wrapper.getAddress()

  expect(await provider.getCode(wrapperAddr)).not.to.have.length(0)

  return wrapper
}
