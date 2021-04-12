// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Temp {

    // for test only

    bytes32 public val;
    function mom(bytes32 _val) view public
    {
        uint val0 = uint256(_val);
        console.log("Val %s", val0);
    }
}
