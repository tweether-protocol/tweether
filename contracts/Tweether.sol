// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./oracle/IOracle.sol";

contract Tweether is ERC20{

    IERC20 public link;
    IOracle public oracle;

    constructor(address linkAddress, address oracleAddress) public ERC20("Tweether", "TWE") {
        link = IERC20(linkAddress);
        oracle = IOracle(oracleAddress);
    }
}