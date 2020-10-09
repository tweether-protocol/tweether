// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

interface IProposal {

    function newTweet(address proposer, uint expiry, string memory content) external returns (uint);
    function get(uint tokenId) external view returns (address, uint, string memory, bool);
    function resetExpiry(uint tokenId, uint expiry) external;
    function acceptTweet(uint tokenId) external;

}