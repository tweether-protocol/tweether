// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "./IOracle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockOracle is IOracle {

    IERC20 private paymentToken;

    event Tweet(string content);

    constructor(address paymentTokenAddress) public {
        paymentToken = IERC20(paymentTokenAddress);
    }

    function price() external override returns (uint, uint) {
        return (10**18, 18);
    }

    function paymentTokenAddress() external override returns (address) {
        return address(paymentToken);
    }

    function sendTweet(string memory content) external override {
        emit Tweet(content);
    }
}