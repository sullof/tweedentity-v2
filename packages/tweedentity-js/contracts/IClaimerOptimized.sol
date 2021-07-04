// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IClaimerOptimized {

    function setClaim(
        uint _appId,
        uint _id,
        address _claimer
    ) external;


    function setClaimedIdentity(
        uint _appId,
        uint _id,
        address _claimer
    ) external;

}
