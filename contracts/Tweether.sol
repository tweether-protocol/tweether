// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./oracle/IOracle.sol";

contract Tweether is ERC20{

    // LINK token address
    IERC20 public link;

    // Oracle contract to tweet from
    IOracle public oracle;

    // Tweether denominator which determines ratios for
    // proposals and votes
    uint public tweetherDenominator;

    constructor(address oracleAddress, uint denominator) public ERC20("Tweether", "TWE") {
        oracle = IOracle(oracleAddress);
        link = IERC20(oracle.paymentTokenAddress());
        tweetherDenominator = denominator;
    }
}