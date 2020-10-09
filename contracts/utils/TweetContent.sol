// SPDX-License-Identifier: MIT
pragma solidity ^0.6.10;

library TweetContent {

    function fitsInTweet(string memory s) internal pure returns (bool)
    {
        uint maxlength = 280;
        uint len = 0;
        uint i = 0;
        bytes memory strBytes = bytes(s);

        while (i < strBytes.length) {
            if (strBytes[i]>>7 == 0) {
                i+=1;
            } else if (strBytes[i]>>5 == 0x06) {
                i+=2;
            } else if (strBytes[i]>>4 == 0x0E) {
                i+=3;
            } else if (strBytes[i]>>3 == 0x1E) {
                i+=4;
            } else {
                i+=1;
            }
            len++;
        }

        return (len <= maxlength && len > 0);
    }
}