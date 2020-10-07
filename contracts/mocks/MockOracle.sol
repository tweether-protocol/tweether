// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "../oracle/IOracle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockOracle is IOracle {

    IERC20 private _paymentToken;
    uint private _price = 10**18;
    uint private _decs = 18;

    event Tweet(string content);

    constructor(address paymentTokenAddress) public {
        _paymentToken = IERC20(paymentTokenAddress);
    }

    function price() external view override returns (uint, uint) {
        return (_price, _decs);
    }

    function paymentTokenAddress() external view override returns (address) {
        return address(_paymentToken);
    }

    function sendTweet(string memory content) external override {
        emit Tweet(content);
    }
}