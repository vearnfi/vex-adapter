import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'

const { getContractFactory } = ethers

describe('VexWrapper.constructor', function () {
  it('should set the constructor args to the supplied values', async function () {
    // Arrange
    const { vexchange, god } = await fixture()

    // Act
    const VexWrapper = await getContractFactory('VexWrapper', god)
    const vexWrapper = await VexWrapper.deploy(vexchange.routerAddr)

    // Assert
    expect(await vexWrapper.vex()).to.equal(vexchange.routerAddr)
  })

  it('should revert if router address is not provided', async function () {
    // Arrange
    const { god } = await fixture()

    // Act
    const VexWrapper = await getContractFactory('VexWrapper', god)

    // Assert
    await expect(VexWrapper.deploy()).to.be.rejectedWith('incorrect number of arguments to constructor')
  })
})
