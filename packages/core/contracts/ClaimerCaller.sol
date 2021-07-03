// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title ClaimerCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./IClaimerOptimized.sol";

contract ClaimerCaller is AccessControl {

    IClaimerOptimized public claimer;

    event ClaimerSet(
        address indexed _store
    );

    event ClaimerUpdated(
        address indexed _store
    );

    bool public claimerSet;

    modifier onlyIfClaimerSet() {
        require(
            claimerSet,
            "Claimer not set yet"
        );
        _;
    }

    constructor(
        address _claimer
    )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        setClaimer(_claimer);
    }

    function setClaimer(
        address _claimer
    ) public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        if (_claimer != address(0)) {
            claimer = IClaimerOptimized(_claimer);
            if (!claimerSet) {
                claimerSet = true;
                emit ClaimerSet(_claimer);
            } else {
                emit ClaimerUpdated(_claimer);
            }
        }
    }

}
