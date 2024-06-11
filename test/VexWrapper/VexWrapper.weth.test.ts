import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'

const { getContractFactory } = ethers

describe('VexWrapper.WETH', function () {
  it('should return the wvet address', async function () {
    // Arrange
    const { wvetAddr, routerAddr, god } = await fixture()

    // Act
    const VexWrapper = await getContractFactory('VexWrapper', god)
    const vexWrapper = await VexWrapper.deploy(routerAddr)

    // Assert
    expect(await vexWrapper.WETH()).to.equal(wvetAddr)
  })
})
