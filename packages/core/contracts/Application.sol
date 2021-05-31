// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Application
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for apps
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract Application is AccessControl {

    event AppAdded(
        uint indexed id,
        bytes32 indexed nickname
    );

    uint constant public maxNumberOfApps = 100;

    uint public lastAppId;
    mapping(uint => bytes32) public apps;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        apps[0] = keccak256("tweedentity");
    }

    function addApp(
        bytes32 _nickname
    ) public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(
            _nickname > 0,
            "Empty nickname"
        );
        require(
            lastAppId < maxNumberOfApps - 1,
            "Limit reached. New apps not allowed"
        );

        lastAppId++;
        apps[lastAppId] = _nickname;
        emit AppAdded(lastAppId, _nickname);
    }

}
