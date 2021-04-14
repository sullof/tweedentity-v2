// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */

import "hardhat/console.sol";

import "../Application.sol";

contract IsApplicationMock is Application {

    mapping(uint => mapping(uint => address)) private _addressById;
    mapping(uint => mapping(address => uint)) private _idByAddress;
    mapping(uint => uint) public totalIdentities;

    constructor()
    {
        // twitter
        addApp(
            0x7477697474657200000000000000000000000000000000000000000000000000,
            true
        );
        // reddit
        addApp(
            0x7265646469740000000000000000000000000000000000000000000000000000,
            false
        );
    }

    function setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) external
    {
        activateApp(_appId);
        _idByAddress[_appId][_address] = _id;
        _addressById[_appId][_id] = _address;
        totalIdentities[_appId]++;
    }

}
