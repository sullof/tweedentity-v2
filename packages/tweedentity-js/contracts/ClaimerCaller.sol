// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title ClaimerCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/Ownable.sol";

import "./IClaimerOptimized.sol";

contract ClaimerCaller is Ownable{

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
        setClaimer(_claimer);
    }

    function setClaimer(
        address _claimer
    ) public
    onlyOwner
    {
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
