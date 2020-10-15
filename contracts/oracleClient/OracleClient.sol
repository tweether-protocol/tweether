// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract OracleClient is ChainlinkClient {
    // Price, Decimals
    uint256 public DECIMALS = 18;
    uint256 public PRICE;  

    address public ORACLE_ADDRESS;
    bytes32 public JOBID;

    uint256[] public tweetIds;
    uint256 public mostRecentTweetId;

    constructor() public {
        setPublicChainlinkToken();
        ORACLE_ADDRESS = 0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b;
        JOBID = "f20522651c7e4239a7730e619b70eb4b";
        PRICE = 1 * 10 ** DECIMALS; // 1 LINK
    }

    function getPrice() external view returns (uint256, uint256){
        return (PRICE, DECIMALS);
    }

    // function paymentTokenAddress() external view returns (address){
        
    // }

    function sendTweet(string memory status) external{
        Chainlink.Request memory request = buildChainlinkRequest(JOBID, address(this), this.returnTweetId.selector);
        request.add("status", status);
        sendChainlinkRequestTo(ORACLE_ADDRESS, request, PRICE);
    }

    function returnTweetId(bytes32 _requestId, uint256 _tweetId) public recordChainlinkFulfillment(_requestId){
        mostRecentTweetId = _tweetId;
        tweetIds.push(_tweetId);
    }
}
