import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { createPairTokenVET } from './shared/create-pair-token-vet'

describe('VexWrapper.getAmountsIn', function () {
  it('should return the expected input amount', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, factory, router, vexWrapper, god } = await fixture()

    const pair = await createPairTokenVET({
      token: energy,
      vetAmount: expandTo18Decimals(1000),
      tokenAmount: expandTo18Decimals(20000),
      factory,
      router,
      deployer: god,
    })

    // Act
    const path = [energyAddr, wvetAddr]
    const amountOut = expandTo18Decimals(10) // VET

    const inputs = await vexWrapper.getAmountsIn(amountOut, path)

    // Assert
    expect(inputs[0]).to.be.greaterThan(expandTo18Decimals(200))
    expect(inputs[0]).to.be.lessThanOrEqual(expandTo18Decimals(210))

    const expectedInputs = await router.getAmountsIn(amountOut, path)

    expect(inputs[0]).to.equal(expectedInputs[0])
    expect(inputs[1]).to.equal(expectedInputs[1])
  })
})
