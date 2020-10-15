// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

/**
 * @dev Tweether NFTwe
 * @author Alex Roan (@alexroan)
 */
contract NFTwe is ERC721, Ownable{

    uint private _tokenIds;

    Tweet[] private tweets;

    struct Tweet {
        address proposer;
        string content;
        uint tweetTime;
    }

    constructor() public ERC721("Tweether Tweet", "NFTWE") {
    }

    function newTweet(address proposer, string memory content, uint tweetTime, address holder) external onlyOwner returns (uint) {
        uint256 newId = tweets.length;
        tweets.push(Tweet(proposer, content, tweetTime));
        _safeMint(holder, newId);
        return newId;
    }

    function get(uint proposalId) external view returns (address, string memory, uint) {
        return (
            tweets[proposalId].proposer,
            tweets[proposalId].content,
            tweets[proposalId].tweetTime
        );
    }

}
