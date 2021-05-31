// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title TweedentityClaimer
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identity claims
 */

import "./StoreCaller.sol";

contract TweedentityClaimer is StoreCaller {

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

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


    struct Claim {
        address claimer;
        uint when;
    }

    mapping(uint => mapping(uint => Claim)) private _claimById;
    mapping(uint => mapping(address => uint)) private _claimByAddress;


    constructor(
        address _store
    )
    StoreCaller(_store)
    {
    }


    function updateProbationTimes(
        uint _probationTime,
        uint _afterProbationTime
    ) external
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        probationTime = _probationTime;
        afterProbationTime = _afterProbationTime;
        emit ProbationTimesUpdated(_probationTime, _afterProbationTime);
    }


    // getters

    struct FullClaim {
        address claimer;
        uint appId;
        uint id;
        uint when;
    }

    function activeClaimsByOrAgainst()
    public view
    returns (FullClaim[] memory)
    {
        FullClaim[] memory claims;
        uint j;
        for (uint appId = 1; appId <= store.lastAppId(); appId++) {
            uint id = store.idByAddress(appId, msg.sender);
            if (id == 0) {
                id = _claimByAddress[appId][msg.sender];
            }
            if (id != 0) {
                // solium-disable-next-line security/no-block-members
                if (_claimById[appId][id].when > block.timestamp - probationTime - afterProbationTime) {
                    claims[j] = FullClaim(_claimById[appId][id].claimer, appId, id, _claimById[appId][id].when);
                    j++;
                }
            }
        }
        return claims;
    }


    // setters

    function setClaim(
        uint _appId,
        uint _id,
        address _claimer
    ) external
    onlyIfStoreSet
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Not authorized");
        require(
            _appId > 0,
            "Tweedentity id can't be claimed"
        );
        require(
            _claimer != address(0),
            "_claimer cannot be 0x0"
        );
        require(
            store.addressById(_appId, _id) != address(0),
            "Claimed identity not found"
        );
        require(
            store.idByAddress(_appId, _claimer) == 0,
            "Claimer owns some identity"
        );
        require(
            // solium-disable-next-line security/no-block-members
            _claimById[_appId][_id].claimer == address(0) || _claimById[_appId][_id].when < block.timestamp - probationTime - afterProbationTime,
            "Active claim found for identity"
        );
        require(
            // solium-disable-next-line security/no-block-members
            _claimByAddress[_appId][_claimer] == 0 || _claimById[_appId][_claimByAddress[_appId][_claimer]].when < block.timestamp - probationTime - afterProbationTime,
            "Active claim found for claimer"
        );
        // solium-disable-next-line security/no-block-members
        _claimById[_appId][_id] = Claim(_claimer, block.timestamp);
        _claimByAddress[_appId][_claimer] = _id;
        emit ClaimStarted(_appId, _id, _claimer);
    }


    function cancelActiveClaim(
        uint _appId
    ) external
    onlyIfStoreSet
    {
        require(
            _claimByAddress[_appId][msg.sender] != 0,
            "Claim by msg.sender not found"
        );

        uint id = _claimByAddress[_appId][msg.sender];
        delete _claimById[_appId][id];
        delete _claimByAddress[_appId][msg.sender];
        emit ClaimCanceled(_appId, id, msg.sender);
    }


    function setClaimedIdentity(
        uint _appId,
        uint _id,
        address _claimer
    ) external
    onlyIfStoreSet
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Not authorized");
        require(
            store.idByAddress(_appId, _claimer) == 0,
            "Claimer owns another identity"
        );
        require(
            _claimById[_appId][_id].claimer == _claimer,
            "Claim not found"
        );
        require(
            // solium-disable-next-line security/no-block-members
            _claimById[_appId][_id].when < block.timestamp - probationTime,
            "Probation time not passed yet"
        );
        require(
            // solium-disable-next-line security/no-block-members
            _claimById[_appId][_id].when > block.timestamp - probationTime - afterProbationTime,
            "Claim is expired"
        );

        store.updateAddressByAppId(_appId, store.addressById(_appId, _id), _claimer);
    }


    function claimByAddress(
        uint _appId,
        address _address
    ) public view
    returns (uint)
    {
        return _claimByAddress[_appId][_address];
    }


    function claimById(
        uint _appId,
        uint _id
    ) public view
    returns (Claim memory)
    {
        return _claimById[_appId][_id];
    }

}
