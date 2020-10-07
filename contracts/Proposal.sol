// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/TweetContent.sol";

/**
 * @dev Tweether NFTwe
 * @author Alex Roan (@alexroan)
 */
contract Proposal is ERC721, Ownable{
    using TweetContent for string;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    Tweet[] public tweets;

    struct Tweet {
        address proposer;
        uint expiry;
        string content;
        bool accepted;
    }

    constructor() public ERC721("Tweether Tweet", "NFTWE") {
    }

    function newTweet(address proposer, uint expiry, string memory content) external onlyOwner returns (uint) {
        require(content.fitsInTweet(), "Invalid tweet size");
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        tweets.push(
            Tweet(proposer, expiry, content, false)
        );
        _safeMint(owner(), newId);
        return newId;
    }

    function resetExpiry(uint tokenId, uint expiry) external onlyOwner {

    }

    function acceptTweet(uint tokenId) external onlyOwner {

    }

}
