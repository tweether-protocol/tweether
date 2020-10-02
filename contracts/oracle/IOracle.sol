// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

interface IOracle {

    // Price, Decimals
    function price() public returns (uint, uint);
    function paymentToken() public returns (address);
    function sendTweet(string content) public; 
}