import { expect } from 'chai'
import { fixture } from './shared/fixture'

describe('VexWrapper.WETH', function () {
  it('should return the wvet address', async function () {
    // Arrange
    const { wvetAddr, vexWrapper } = await fixture()

    // Act
    const weth = await vexWrapper.WETH()

    // Assert
    expect(weth).to.equal(wvetAddr)
  })
})
