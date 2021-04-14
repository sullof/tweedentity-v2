// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */

import "hardhat/console.sol";

import "../Managed.sol";

contract IsManagedMock is Managed {

    constructor(address _manager)
    Managed(_manager)
    {}


    uint public val;

    function setVal(
        uint _val
    ) public
    onlyManager
    {
        val = _val;
    }

}
