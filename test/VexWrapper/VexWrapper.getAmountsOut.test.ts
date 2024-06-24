import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'

describe('VexWrapper.getAmountsOut', function () {
  it('should return the expected output amount', async function () {
    // Arrange
    const { energyAddr, wvetAddr, vexchange, vexWrapper, god, createVexchangePairVTHO_VET } = await fixture()

    const pair = await createVexchangePairVTHO_VET({
      vetAmount: expandTo18Decimals(1000),
      vthoAmount: expandTo18Decimals(20000),
    })

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)

    const expectedOutputs = await vexchange.router.getAmountsOut(amountIn, path)

    // Act
    const outputs = await vexWrapper.getAmountsOut(amountIn, path)

    // Assert
    expect(outputs[1]).to.be.greaterThan(expandTo18Decimals(9))
    expect(outputs[1]).to.be.lessThanOrEqual(expandTo18Decimals(10))

    expect(outputs[0]).to.equal(expectedOutputs[0])
    expect(outputs[1]).to.equal(expectedOutputs[1])
  })
})
