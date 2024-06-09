import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'

const { getContractFactory } = ethers

describe('Adapter.constructor', function () {
  it('should set the constructor args to the supplied values', async function () {
    // Arrange
    const { routerAddr, god } = await fixture()

    // Act
    const Adapter = await getContractFactory('VexchangeV2Router02Adapter', god)
    const adapter = await Adapter.deploy(routerAddr)

    // Assert
    expect(await adapter.vex()).to.equal(routerAddr)
  })

  it('should revert if router address is not provided', async function () {
    // Arrange
    const { routerAddr, god } = await fixture()

    // Act
    const Adapter = await getContractFactory('VexchangeV2Router02Adapter', god)

    // Assert
    await expect(Adapter.deploy()).to.be.rejectedWith('incorrect number of arguments to constructor')
  })
})
