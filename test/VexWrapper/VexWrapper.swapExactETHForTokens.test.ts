import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { createPairTokenVET } from './shared/create-pair-token-vet'

const { MaxUint256 } = ethers

describe('VexWrapper.swapExactETHForTokens', function () {
  it('should swap exact VET for VTHO', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, factory, router, vexWrapper, god, alice } = await fixture()

    const pair = await createPairTokenVET({
      token: energy,
      vetAmount: expandTo18Decimals(1000),
      tokenAmount: expandTo18Decimals(20000),
      factory,
      router,
      deployer: god,
    })

    const path = [wvetAddr, energyAddr]
    const amountIn = expandTo18Decimals(10)
    const outputs = await router.getAmountsOut(amountIn, path)
    console.log({ outputs })

    // Act
    const amountOutMin = 0n
    const to = alice.address
    const deadline = MaxUint256

    const tx = await router.connect(alice).swapExactVETForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    // const tx = await vexWrapper
    //   .connect(alice)
    //   .swapExactETHForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    const amounts = await tx.wait(1)
    console.log({ amounts })

    // Assert
    // expect(amounts[1]).to.equal(outputs[1])
    // expect(amounts[1]).to.be.lessThanOrEqual(expandTo18Decimals(10))

    // const expectedOutputs = await router.getAmountsOut(amountIn, path)

    // expect(amounts[0]).to.equal(expectedOutputs[0])
    // expect(amounts[1]).to.equal(expectedOutputs[1])
  })
})
