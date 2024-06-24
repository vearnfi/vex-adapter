import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'

const { MaxUint256 } = ethers

describe('VexWrapper.swapExactETHForTokens', function () {
  it.only('should swap exact VET for VTHO', async function () {
    // Arrange
    const { energy, energyAddr, baseGasPrice, wvetAddr, vexchange, vexWrapper, alice, createVexchangePairVTHO_VET } =
      await fixture()

    const vetAmount = expandTo18Decimals(1000)
    const vthoAmount = expandTo18Decimals(20000)

    const pair = await createVexchangePairVTHO_VET({
      vetAmount,
      vthoAmount,
    })

    const path = [wvetAddr, energyAddr]
    const amountIn = expandTo18Decimals(10)
    const amountOutMin = 1n
    const to = alice.address
    const deadline = MaxUint256

    const outputs = await vexchange.router.getAmountsOut(amountIn, path)
    const aliceVTHOBalanceBefore = await energy.balanceOf(alice.address)

    // Act
    // const tx = await vexchange.router
    //   .connect(alice)
    //   .swapExactVETForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    const tx = await vexWrapper
      .connect(alice)
      .swapExactETHForTokens(amountOutMin, path, to, deadline, { value: amountIn })
    const receipt = await tx.wait(1)

    // Assert
    expect(await energy.balanceOf(alice.address)).to.be.greaterThanOrEqual(
      aliceVTHOBalanceBefore + outputs[1] - (receipt?.gasUsed || 0n) * baseGasPrice
    )
    // ^ we don't use strict equality because holding VET produces VTHO which increases the expected VTHO balance.
  })
})
