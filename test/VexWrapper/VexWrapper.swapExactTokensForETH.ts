import { ethers } from 'hardhat'
import { expect } from 'chai'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { createPairTokenVET } from './shared/create-pair-token-vet'
import { approveToken } from './shared/approve-token'

const { MaxUint256, provider } = ethers

describe('VexWrapper.swapExactTokensForETH', function () {
  it('should swap exact VTHO for VET', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, factory, router, vexWrapper, vexWrapperAddr, god, alice } = await fixture()

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

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)

    const outputs = await router.getAmountsOut(amountIn, path)

    await approveToken(energy, alice, vexWrapperAddr, amountIn)

    const aliceVETBalanceBefore = await provider.getBalance(alice.address)

    // Act
    const amountOutMin = 0n
    const to = alice.address
    const deadline = MaxUint256

    const tx = await vexWrapper.connect(alice).swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)
    await tx.wait(1)

    // Assert
    expect(await provider.getBalance(alice.address)).to.equal(aliceVETBalanceBefore + outputs[1])
  })
})
