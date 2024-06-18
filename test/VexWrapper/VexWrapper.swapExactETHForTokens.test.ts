import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { createPairTokenVET } from './shared/create-pair-token-vet'

const { MaxUint256 } = ethers

describe.only('VexWrapper.swapExactETHForTokens', function () {
  it('should swap exact VET for VTHO', async function () {
    // Arrange
    const { energy, energyAddr, baseGasPrice, wvetAddr, factory, router, vexWrapper, god, alice } = await fixture()

    const vetAmount = expandTo18Decimals(1000)
    const tokenAmount = expandTo18Decimals(20000)

    const pair = await createPairTokenVET({
      token: energy,
      vetAmount,
      tokenAmount,
      factory,
      router,
      deployer: god,
    })

    const path = [wvetAddr, energyAddr]
    const amountIn = expandTo18Decimals(10)

    const outputs = await router.getAmountsOut(amountIn, path)
    console.log({ outputs })

    const aliceVTHOBalanceBefore = await energy.balanceOf(alice.address)

    // // Act
    const amountOutMin = 0n
    const to = alice.address
    const deadline = MaxUint256

    const tx = await router.connect(alice).swapExactVETForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    // const tx = await vexWrapper
    //   .connect(alice)
    //   .swapExactETHForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    const receipt = await tx.wait(1)

    // Assert
    expect(await energy.balanceOf(alice.address)).to.be.greaterThanOrEqual(
      aliceVTHOBalanceBefore + outputs[1] - (receipt?.gasUsed || 0n) * baseGasPrice
    )
    // ^ we don't use strict equality because holding VET produces VTHO which increases the expected VTHO balance.
  })
})
