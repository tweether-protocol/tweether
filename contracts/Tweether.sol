// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "./oracle/IOracle.sol";
import "./IProposal.sol";
import "./WadMath.sol";

/**
 * @dev Tweether Protocol gov contract
 * @author Alex Roan (@alexroan)
 */
contract Tweether is ERC20, ERC721Holder{
    using WadMath for uint;

    /**
     * @dev LINK token address
     */
    IERC20 public link;

    /**
     * @dev Oracle contract to tweet from
     */
    IOracle public oracle;

    /**
     * @dev Tweet proposals
     */
    IProposal public tweetProposals;

    /**
     * @dev WAD format Tweether denominator which determines ratios for proposals and votes.
     */
    uint public tweetherDenominator;

    /**
     * @dev Votes locked by an address
     * voter => lockedVotes
     */
    mapping(address => uint) public lockedVotes;

    // TODO
    mapping(uint => address[]) public voteLocations;

    event TweetProposed(uint proposalId, address proposer, uint expiryDate);
    event TweetAccepted(uint proposalId, address finalVoter);

    /**
     * Construct using a pre-constructed IOracle
     * @param oracleAddress address referencing pre-deployed IOracle
     * @param denominator WAD format representing the Tweether Denominator, 
     * used in a range of protocol calculations
     */
    constructor(address oracleAddress, address tweetProposalsAddress, uint denominator) public ERC20("Tweether", "TWE") {
        oracle = IOracle(oracleAddress);
        link = IERC20(oracle.paymentTokenAddress());
        tweetProposals = IProposal(tweetProposalsAddress);
        tweetherDenominator = denominator;
    }

    /**
     * @dev Mint TWE by supplying LINK. LINK.approve must first be called by msg.sender
     * @param linkAmount the amount of LINK to supply
     * @return amount of TWE minted
     */
    function mint(uint linkAmount) external returns (uint) {
        // First mint enters here and returns
        if (totalSupply() == 0 || linkBalance() == 0) {
            return _mint(linkAmount, linkAmount);
        }
        // For any other mint...
        uint tweMinted = (linkAmount.wadMul(totalSupply())).wadDiv(linkBalance());
        return _mint(linkAmount, tweMinted);
    }

    /**
     * @dev Internal mint function
     * @param linkAmount the amount of LINK to request from the sender
     * @param tweToMint the amount of TWE to mint
     * @return amount of TWE minted
     */
    function _mint(uint linkAmount, uint tweToMint) internal returns (uint) {
        require(link.transferFrom(msg.sender, address(this), linkAmount), "LINK not supplied");
        _mint(msg.sender, tweToMint);
        return tweToMint;
    }

    /**
     * @dev Burn TWE, receiving LINK.
     * @param tweAmount amount of TWE to burn
     * @return LINK returned
     */
    function burn(uint tweAmount) external returns (uint) {
        require(linkBalance() >= WadMath.WAD, "Not enough LINK");
        require(totalSupply() >= WadMath.WAD, "Not enough totalSupply");
        uint linkReturned = tweAmount.wadMul(tweValueInLink());
        _burn(msg.sender, tweAmount);
        require(link.transfer(msg.sender, linkReturned), "LINK transfer fail");
        return linkReturned;
    }

    function vote(uint proposalId, uint votes) external {
        // Does the sender have enough TWE for votes
        // Does the sender have enough TWE not locked in votes already?
        require(balanceOf(msg.sender).sub(lockedVotes[msg.sender]) >= votes, "Not enough unlocked TWE");
        // Increase amount of votes locked
        lockedVotes[msg.sender] = lockedVotes[msg.sender].add(votes);
        // Vote on tweet
        uint totalVotes = tweetProposals.vote(proposalId, votes);
        // If votes tip over edge, transfer NFTwe
        if (totalVotes >= votesRequired()) {
            string memory tweetContent = tweetProposals.accept(msg.sender, proposalId);
            oracle.sendTweet(tweetContent);
            emit TweetAccepted(proposalId, msg.sender);
            // TODO: Unlock votes!
        }
    }

    function votesRequired() public view returns (uint) {
        // (oracleCost * totalTweSupply) / linkBalance
        (uint oracleCost, ) = oracleCost();
        return (oracleCost.wadMul(totalSupply())).wadDiv(linkBalance());
    }

    /**
     * @dev Propose a tweet which can be voted on until proposal expires.
     * Expiry date is set using the daysValid parameter.
     * @param daysValid number of days for this proposal to be valid before expiry
     * @param tweetContent the text content of the tweet
     * @return Tweet proposal ID
     */
    function proposeTweet(uint daysValid, string memory tweetContent) external returns (uint) {
        uint daysValidPrice = daysValid.mul(tweSingleProposalCost());
        uint expiryDate = block.timestamp + daysValid.mul(24).mul(60).mul(60);
        _burn(msg.sender, daysValidPrice);
        uint proposalId = tweetProposals.newTweet(msg.sender, expiryDate, tweetContent);
        emit TweetProposed(proposalId, msg.sender, expiryDate);
        return proposalId;
    }

    /**
     * @dev The TWE cost of submitting a proposal for 1 day timespan
     * @return TWE cost
     */
    function tweSingleProposalCost() public view returns (uint) {
        // (oracleCost * totalTweSupply) / (denominator * linkBalance)
        (uint oracleCost, ) = oracleCost();
        return (oracleCost.wadMul(totalSupply())).wadDiv(tweetherDenominator.wadMul(linkBalance()));
    }

    /**
     * @dev Get the cost of a request to the oracle
     * @return (uint price, uint decimals)
     */
    function oracleCost() public view returns (uint, uint) {
        return oracle.price();
    }

    /**
     * @dev Get the current balance of LINK
     * @return balance
     */
    function linkBalance() public view returns (uint) {
        return link.balanceOf(address(this));
    }

    /**
     * @dev Get the current value of TWE in LINK
     * @return TWE value
     */
    function tweValueInLink() public view returns (uint) {
        return linkBalance().wadDiv(totalSupply());
    }
}