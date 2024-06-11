// SPDX-License-Identifier: Unlicense
pragma solidity =0.6.6;

import { IEnergy } from "./interfaces/IEnergy.sol";
import { IVexchangeV2Router02 } from "./interfaces/IVexchangeV2Router02.sol";

/**
 * @title Vexchange V2 Router Wrapper
 * @notice Wrapper around the Vexchange Router V2 contract exposing the original Uniswap V2 Router Interface.
 */
contract VexWrapper {

    IEnergy public constant vtho = IEnergy(0x0000000000000000000000000000456E65726779);

    IVexchangeV2Router02 public immutable vex;

    constructor(address vex_) public {
        vex = IVexchangeV2Router02(vex_);
    }

    // TODO: how to trick the compiler so that we set this function as `pure`
    // instead of `view` so that we match the uniswap router interface?
    function WETH() external view returns (address) {
        return vex.VVET();
    }

    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts)
    {
        // Approve vexchange for VTHO token spending in behalf of the VexWrapper.
        require(vtho.approve(address(vex), amountIn), "VexWrapper: approve failed");

        return vex.swapExactTokensForVET(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline
        );
    }

    // TODO: how to trick the compiler so that we set this function as `pure`
    // instead of `view` so that we match the uniswap router interface?
    function getAmountsOut(uint amountIn, address[] memory path)
        public
        view
        returns (uint[] memory amounts)
    {
        return vex.getAmountsOut(amountIn, path);
    }
}
