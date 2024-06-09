import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'

const { getContractFactory } = ethers

describe('Adapter.factory', function () {
  it('should return the factory address', async function () {
    // Arrange
    const { factoryAddr, routerAddr, god } = await fixture()

    // Act
    const Adapter = await getContractFactory('VexchangeV2Router02Adapter', god)
    const adapter = await Adapter.deploy(routerAddr)

    // Assert
    expect(await adapter.factory()).to.equal(factoryAddr)
  })
})
