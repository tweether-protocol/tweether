// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./utils/TweetContent.sol";
import "./IProposal.sol";

/**
 * @dev Tweether NFTwe
 * @author Alex Roan (@alexroan)
 */
contract Proposal is IProposal, ERC721, Ownable{
    using TweetContent for string;

    uint private _tokenIds;

    Tweet[] private tweets;

    struct Tweet {
        address proposer;
        uint expiry;
        string content;
        uint votes;
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

    function vote(uint proposalId, uint votes) external override onlyOwner returns (uint) {
        require(tweets[proposalId].expiry > block.timestamp, "Proposal expired");
        require(tweets[proposalId].accepted == false, "Proposal accepted already");
        tweets[proposalId].votes = tweets[proposalId].votes.add(votes);
        return tweets[proposalId].votes;
    }

    function get(uint proposalId) external view override returns (address, uint, string memory, uint, bool) {
        return (
            tweets[proposalId].proposer,
            tweets[proposalId].expiry,
            tweets[proposalId].content,
            tweets[proposalId].votes,
            tweets[proposalId].accepted
        );
    }

    function resetExpiry(uint proposalId, uint expiry) external override onlyOwner {

    }

    function accept(address newOwner, uint proposalId) external override onlyOwner returns (string memory) {
        require(tweets[proposalId].expiry > block.timestamp, "Proposal expired");
        require(tweets[proposalId].accepted == false, "Proposal accepted already");
        tweets[proposalId].accepted = true;
        safeTransferFrom(owner(), newOwner, proposalId);
        return tweets[proposalId].content;
    }

}
