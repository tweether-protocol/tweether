// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

interface IProposal {

    function newTweet(address proposer, uint expiry, string memory content) external returns (uint);
    function vote(uint proposalId, uint votes) external returns (uint);
    function get(uint proposalId) external view returns (address, uint, string memory, uint, bool);
    function resetExpiry(uint proposalId, uint expiry) external;
    function accept(address recipient, uint proposalId) external returns (string memory);

}