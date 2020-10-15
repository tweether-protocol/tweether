// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "../oracleClient/IOracleClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract MockOracleClient is IOracleClient, ChainlinkClient {

    IERC20 private _paymentToken;
    uint private _price = 10**18;
    uint private _decs = 18;

    event Tweet(string content);
    event TweetId(uint256 id);

    constructor(address paymentTokenAddress) public {
        _paymentToken = IERC20(paymentTokenAddress);
    }

    function getPrice() external view override returns (uint, uint) {
        return (_price, _decs);
    }

    function paymentTokenAddress() external view override returns (address) {
        return address(_paymentToken);
    }

    function sendTweet(string memory content) external override {
        emit Tweet(content);
    }

    function returnTweetId(bytes32 _requestId, uint256 _tweetId) public recordChainlinkFulfillment(_requestId){
        emit TweetId(_tweetId);
    }
}