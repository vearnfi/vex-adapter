import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { approveToken } from './shared/approve-token'

const { MaxUint256, provider } = ethers

describe('VexWrapper.swapExactTokensForETH', function () {
  it('should swap exact VTHO for VET', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, vexchange, vexWrapper, vexWrapperAddr, alice, createVexchangePairVTHO_VET } =
      await fixture()

    const vetAmount = expandTo18Decimals(1000)
    const vthoAmount = expandTo18Decimals(20000)

    const pair = await createVexchangePairVTHO_VET({
      vetAmount,
      vthoAmount,
    })

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)
    const amountOutMin = 0n
    const to = alice.address
    const deadline = MaxUint256

    const outputs = await vexchange.router.getAmountsOut(amountIn, path)

    await approveToken(energy, alice, vexWrapperAddr, amountIn)

    const aliceVETBalanceBefore = await provider.getBalance(alice.address)

    // Act
    const tx = await vexWrapper.connect(alice).swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)
    await tx.wait(1)

    // Assert
    expect(await provider.getBalance(alice.address)).to.equal(aliceVETBalanceBefore + outputs[1])
  })

  it('should revert if account does not approve token', async () => {
    // Arrange
    const { energyAddr, wvetAddr, vexWrapper, alice, createVexchangePairVTHO_VET } = await fixture()

    const vetAmount = expandTo18Decimals(1000)
    const vthoAmount = expandTo18Decimals(20000)

    const pair = await createVexchangePairVTHO_VET({
      vetAmount,
      vthoAmount,
    })

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)
    const amountOutMin = 0n
    const to = alice.address
    const deadline = MaxUint256
    // Do NOT approve energy

    // Act + assert
    await expect(
      vexWrapper.connect(alice).swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)
    ).to.be.rejectedWith('execution reverted: builtin: insufficient allowance')
  })

  it.only('should not lock the tokens if vexchange reverts', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, vexchange, vexWrapper, vexWrapperAddr, alice, createVexchangePairVTHO_VET } =
      await fixture()

    const vetAmount = expandTo18Decimals(1000)
    const vthoAmount = expandTo18Decimals(20000)

    const pair = await createVexchangePairVTHO_VET({
      vetAmount,
      vthoAmount,
    })

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)
    const amountOutMin = MaxUint256 // Force a revert
    const to = alice.address
    const deadline = MaxUint256

    await approveToken(energy, alice, vexWrapperAddr, amountIn)

    const wrapperVTHOBalanceBefore = await energy.balanceOf(vexWrapperAddr)

    // Act
    await expect(
      vexWrapper.connect(alice).swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)
    ).to.be.rejectedWith('')

    // Assert
    expect(await energy.balanceOf(vexWrapperAddr)).to.equal(wrapperVTHOBalanceBefore)
  })
})
