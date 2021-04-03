// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IClaimable {

    event OracleUpdated(address oracle, uint256 updatedAt);

    event WaitingTimeUpdated(uint256 waitingTime, uint256 updatedAt);

    event ClaimSet(uint256 indexed claimId, address indexed claimer, uint256 indexed proofId, uint256 setAt);

    event ClaimApproved(uint256 indexed claimId, address indexed claimer, uint256 indexed id, uint256 approvedAt);

    event ClaimRebunked(uint256 indexed claimId, uint256 rebunkedAt);

    function updateOracle(address _oracle) external;

    function updateWaitingTime(uint256 _waitingTime) external;

    function setClaim(uint256 proofId) external;

    function verifyClaim(uint256 claimId, uint256 id) external;

    function addressOf(uint256 id) external view returns(address);

    function idOf(address addr) external view returns(uint256);

}
