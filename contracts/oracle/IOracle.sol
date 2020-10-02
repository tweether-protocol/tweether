// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

interface IOracle {

    // Price, Decimals
    function price() external returns (uint, uint);
    function paymentTokenAddress() external returns (address);
    function sendTweet(string memory content) external; 
}