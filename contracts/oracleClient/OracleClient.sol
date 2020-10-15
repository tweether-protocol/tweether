// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OracleClient is ChainlinkClient, Ownable {
    // Price, Decimals
    uint256 public DECIMALS = 18;
    uint256 public PRICE;  

    address public ORACLE_ADDRESS;
    bytes32 public JOBID;

    uint256[] public tweetIds;
    uint256 public mostRecentTweetId;
    address public governance;

    constructor(address _governance) public {
        setPublicChainlinkToken();
        ORACLE_ADDRESS = 0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b;
        JOBID = "09f3d678301a408cb6a8ab983932636d";
        PRICE = 1 * 10 ** DECIMALS; // 1 LINK
        governance = _governance;
    }

    function getPrice() external view returns (uint256, uint256){
        return (PRICE, DECIMALS);
    }

    function paymentTokenAddress() external view returns (address){
        return chainlinkTokenAddress();
    }

    function sendTweet(string memory status) external onlyGovernance {
        Chainlink.Request memory request = buildChainlinkRequest(JOBID, address(this), this.returnTweetId.selector);
        request.add("status", status);
        sendChainlinkRequestTo(ORACLE_ADDRESS, request, PRICE);
    }

    function returnTweetId(bytes32 _requestId, uint256 _tweetId) public recordChainlinkFulfillment(_requestId){
        mostRecentTweetId = _tweetId;
        tweetIds.push(_tweetId);
    }

    modifier onlyGovernance() {
        require(msg.sender == governance, "Source must be the governance contract");
        _;
    }
    
    // We don't want the owner able to withdraw
    // function withdrawLink() public onlyOwner {
    //     LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    //     require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
    // }
}
