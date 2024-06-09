import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'

const { getContractFactory } = ethers

describe('Adapter.WETH', function () {
  it('should return the weth address', async function () {
    // Arrange
    const { wvetAddr, routerAddr, god } = await fixture()

    // Act
    const Adapter = await getContractFactory('VexchangeV2Router02Adapter', god)
    const adapter = await Adapter.deploy(routerAddr)

    // Assert
    expect(await adapter.WETH()).to.equal(wvetAddr)
  })
})
