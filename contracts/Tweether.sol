// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./oracle/IOracle.sol";
import "./WadMath.sol";

contract Tweether is ERC20{
    using WadMath for uint;

    // LINK token address
    IERC20 public link;

    // Oracle contract to tweet from
    IOracle public oracle;

    // Tweether denominator which determines ratios for
    // proposals and votes
    // WAD Format!
    uint public tweetherDenominator;

    /**
     * Construct using a pre-constructed IOracle
     * @param oracleAddress address referencing pre-deployed IOracle
     * @param denominator WAD format representing the Tweether Denominator, used in a range of protocol calcs
     */
    constructor(address oracleAddress, uint denominator) public ERC20("Tweether", "TWE") {
        oracle = IOracle(oracleAddress);
        link = IERC20(oracle.paymentTokenAddress());
        tweetherDenominator = denominator;
    }

    /**
     * @dev Get the cost of a request to the oracle
     * @return (uint price, uint decimals)
     */
    function _oracleCost() internal returns (uint, uint) {
        return oracle.price();
    }

    /**
     * @dev Get the current balance of LINK
     * @return balance
     */
    function _linkBalance() internal returns (uint) {
        return link.balanceOf(address(this));
    }

    /**
     * @dev Get the current value of TWE in LINK
     * @return TWE value
     */
    function _tweValueInLink() internal returns (uint) {
        return _linkBalance().wadDiv(totalSupply());
    }
}