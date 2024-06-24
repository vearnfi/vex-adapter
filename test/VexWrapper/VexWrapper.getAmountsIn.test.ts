import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'

describe('VexWrapper.getAmountsIn', function () {
  it('should return the expected input amount', async function () {
    // Arrange
    const { energyAddr, wvetAddr, vexchange, vexWrapper, createVexchangePairVTHO_VET } = await fixture()

    const pair = await createVexchangePairVTHO_VET({
      vetAmount: expandTo18Decimals(1000),
      vthoAmount: expandTo18Decimals(20000),
    })

    const path = [energyAddr, wvetAddr]
    const amountOut = expandTo18Decimals(10) // VET

    const expectedInputs = await vexchange.router.getAmountsIn(amountOut, path)

    // Act
    const inputs = await vexWrapper.getAmountsIn(amountOut, path)

    // Assert
    expect(inputs[0]).to.be.greaterThan(expandTo18Decimals(200))
    expect(inputs[0]).to.be.lessThanOrEqual(expandTo18Decimals(210))

    expect(inputs[0]).to.equal(expectedInputs[0])
    expect(inputs[1]).to.equal(expectedInputs[1])
  })
})
