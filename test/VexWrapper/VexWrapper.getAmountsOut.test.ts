import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { createPairTokenVET } from './shared/create-pair-token-vet'

describe.only('VexWrapper.getAmountsOut', function () {
  it('should return the expected output amount', async function () {
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
    const amountIn = expandTo18Decimals(200)

    const outputs = await vexWrapper.getAmountsOut(amountIn, path)

    // Assert
    expect(outputs[1]).to.be.greaterThan(expandTo18Decimals(9))
    expect(outputs[1]).to.be.lessThanOrEqual(expandTo18Decimals(10))
  })
})
