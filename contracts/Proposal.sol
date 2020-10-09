// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/TweetContent.sol";
import "./IProposal.sol";

/**
 * @dev Tweether NFTwe
 * @author Alex Roan (@alexroan)
 */
contract Proposal is IProposal, ERC721, Ownable{
    using TweetContent for string;

    uint private _tokenIds;

    Tweet[] public tweets;

    struct Tweet {
        address proposer;
        uint expiry;
        string content;
        bool accepted;
    }

    constructor() public ERC721("Tweether Tweet", "NFTWE") {
    }

    function newTweet(address proposer, uint expiry, string memory content) external override onlyOwner returns (uint) {
        require(content.fitsInTweet(), "Invalid tweet size");
        uint256 newId = tweets.length;
        tweets.push(Tweet(proposer, expiry, content, false));
        _safeMint(owner(), newId);
        return newId;
    }

    function get(uint tokenId) external view override returns (address, uint, string memory, bool) {
        return (
            tweets[tokenId].proposer,
            tweets[tokenId].expiry,
            tweets[tokenId].content,
            tweets[tokenId].accepted
        );
    }

    function resetExpiry(uint tokenId, uint expiry) external override onlyOwner {

    }

    function acceptTweet(uint tokenId) external override onlyOwner {

    }

}
