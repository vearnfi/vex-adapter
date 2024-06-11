import { ethers } from 'hardhat'
import { expect } from 'chai'
import * as pairArtifact from '../../artifacts/contracts/vexchange/vexchange-v2-core/contracts/VexchangeV2Pair.sol/VexchangeV2Pair.json'
import { Energy, Params, VexchangeV2Factory, VexchangeV2Pair, VexchangeV2Router02 } from '../../typechain-types'
import { fixture } from './shared/fixture'
import { expandTo18Decimals } from './shared/expand-to-18-decimals'
import { approveEnergy } from './shared/approve-energy'

const { Contract, MaxUint256, provider } = ethers

describe('VexWrapper.getAmountsOut', function () {
  it('should return the expected output amount', async function () {
    // Arrange
    const { energy, energyAddr, wvetAddr, factory, router, routerAddr, vexWrapper, god } = await fixture()

    //  Create WVET-VTHO pair
    const tx1 = await factory.createPair(energyAddr, wvetAddr)
    await tx1.wait(1)

    const pairAddress = await factory.getPair(energyAddr, wvetAddr)

    const pair = new Contract(pairAddress, pairArtifact.abi, god) as unknown as VexchangeV2Pair

    expect(await provider.getCode(pair.getAddress())).not.to.have.length(0)

    const reserves = await pair.getReserves()
    expect(reserves[0]).to.equal(0)
    expect(reserves[1]).to.equal(0)

    // Provide liquidity with a 1 WVET - 20 VTHO exchange rate
    await approveEnergy(energy, god, routerAddr, MaxUint256)

    const token0Amount = expandTo18Decimals(20000) // energy/vtho
    const token1Amount = expandTo18Decimals(1000) // wvet

    const addLiquidityTx = await router.connect(god).addLiquidityVET(
      energyAddr, // token
      token0Amount, // amountTokenDesired
      0, // amountTokenMin
      0, // amountETHMin,
      god.address, // to: recipient of the liquidity tokens
      MaxUint256, // deadline
      { value: token1Amount, gasLimit: 300000 /*hexlify(9999999) */ }
    )

    await addLiquidityTx.wait()

    // Validate reserves
    const reserves2 = await pair.getReserves()
    expect(reserves2[0]).to.equal(token0Amount)
    expect(reserves2[1]).to.equal(token1Amount)

    const path = [energyAddr, wvetAddr]
    const amountIn = expandTo18Decimals(200)

    // Act
    const outputs = await vexWrapper.getAmountsOut(amountIn, path)

    // Assert
    // expect(await vexWrapper.WETH()).to.equal(wvetAddr)
    console.log(outputs)
  })
})
