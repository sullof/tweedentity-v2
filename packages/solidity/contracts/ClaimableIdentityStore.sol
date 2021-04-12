// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IdentityClaimer
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identity claims
 */


import "./IdentityStore.sol";

contract ClaimableIdentityStore is IdentityStore {

    using SafeMath for uint;

    event ClaimStarted(
        uint indexed _appId,
        uint indexed _id,
        address indexed _claimer
    );

    event ClaimCompleted(
        uint indexed _appId,
        uint indexed _id,
        address indexed _claimer
    );

    event ClaimCanceled(
        uint indexed _appId,
        uint indexed _id,
        address indexed _claimer
    );

    event ProbationTimesUpdated(
        uint probationTime,
        uint afterProbationTime
    );


    uint public probationTime = 1 weeks;
    uint public afterProbationTime = 1 weeks;


//    constructor() {
//        console.log("probationTime %s %s", probationTime, afterProbationTime);
//    }

    struct Claimer {
        address claimer;
        uint when;
    }

    mapping(uint => mapping(uint => Claimer)) public claimerById;
    mapping(uint => mapping(address => uint)) public claimByAddress;


    function updateProbationTimes(
        uint _probationTime,
        uint _afterProbationTime
    ) external
    onlyOwner
    {
        probationTime = _probationTime;
        afterProbationTime = _afterProbationTime;
        emit ProbationTimesUpdated(_probationTime, _afterProbationTime);
    }


    // getters

    struct Claim {
        address claimer;
        uint appId;
        uint id;
        uint when;
    }

    function activeClaimsByOrAgainst()
    public view
    returns (Claim[] memory)
    {
        Claim[] memory claims;
        uint j;
        for (uint appId = 1; appId <= _lastAppId; appId++) {
            uint id = idByAddress[appId][msg.sender];
            if (id == 0) {
                id = claimByAddress[appId][msg.sender];
            }
            if (id != 0) {
                if (claimerById[appId][id].when > block.timestamp.sub(probationTime.add(afterProbationTime))) {

                    claims[j] = Claim(claimerById[appId][id].claimer, appId, id, claimerById[appId][id].when);
                    j++;
                }
            }
        }
        return claims;
    }


    // setters

    function _setClaim(
        uint _appId,
        uint _id,
        address _claimer
    ) internal
    {
        require(
            _claimer != address(0),
            "_claimer cannot be 0x0"
        );
        require(
            addressById[_appId][_id] != address(0),
            "Claimed identity not found"
        );
        require(
            idByAddress[_appId][_claimer] == 0,
            "Claimer owns some identity"
        );
        require(
            claimerById[_appId][_id].claimer == address(0)
            || claimerById[_appId][_id].when < block.timestamp.sub(probationTime.add(afterProbationTime)),
            "Active claim found for identity"
        );

        claimerById[_appId][_id] = Claimer(_claimer, block.timestamp);
        emit ClaimStarted(_appId, _id, _claimer);
    }


    function cancelActiveClaim(
        uint _appId,
        uint _id
    ) external
    {
        require(
            claimerById[_appId][_id].claimer == msg.sender,
            "Claim by msg.sender not found"
        );

        delete claimerById[_appId][_id];
        emit ClaimCanceled(_appId, _id, msg.sender);
    }


    function _setClaimedIdentity(
        uint _appId,
        uint _id,
        address _claimer
    ) internal
    {
        require(
            idByAddress[_appId][_claimer] == 0,
            "Claimer owns another identity"
        );
        require(
            claimerById[_appId][_id].claimer == _claimer,
            "Claim not found"
        );
        require(
            claimerById[_appId][_id].when < block.timestamp - probationTime,
            "Probation time not passed yet"
        );
        require(
            claimerById[_appId][_id].when > block.timestamp - probationTime - afterProbationTime,
            "Claim is expired"
        );

        _updateAddressByAppId(_appId, addressById[_appId][_id], _claimer);
    }


}
