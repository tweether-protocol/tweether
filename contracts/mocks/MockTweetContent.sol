// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

import "../utils/TweetContent.sol";

contract MockTweetContent {
    using TweetContent for string;

    function checkLength(string memory tweetContent) external pure returns (bool) {
        return tweetContent.fitsInTweet();
    }
}