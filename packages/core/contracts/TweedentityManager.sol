// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title TweedentityManager
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "./IStoreOptimized.sol";
import "./IClaimerOptimized.sol";
import "./ClaimerCaller.sol";
import "./StoreCaller.sol";
import "./Validatable.sol";

contract TweedentityManager is ClaimerCaller, StoreCaller, Validatable {

    uint private _currentTweedentityId;

    function _getNextTweedentityId()
    private view
    returns (uint)
    {
        return _currentTweedentityId + 1;
    }


    function _incrementTokenTypeId()
    private
    {
        _currentTweedentityId++;
    }

    modifier onlySignedByValidator(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) {
        require(
            isSignedByValidator(
                _appId,
                encodeForSignature(
                    msg.sender,
                    _appId,
                    _id,
                    _timestamp
                ),
                _signature
            ),
            "Invalid signature"
        );
        _;
    }

    constructor(
        address _store,
        address _claimer,
        uint[] memory _appIds,
        address[] memory _validators
    )
    StoreCaller(_store)
    ClaimerCaller(_claimer)
    Validatable(_appIds, _validators)
    {
    }

    function setMyIdentity() external
    onlyIfStoreSet
    {
        store.setAddressAndIdByAppId(0, msg.sender, 0);
    }


    function setIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyIfStoreSet
    onlySignedByValidator(_appId, _id, _timestamp, _signature)
    {
        isValidForGroupId(_appId, _timestamp);
        store.setAddressAndIdByAppId(_appId, msg.sender, _id);
    }

    function setMultipleIdentities(
        uint[] memory _appIds,
        uint[] memory _ids,
        uint _timestamp,
        bytes[] memory _signatures
    ) external
    onlyIfStoreSet
    {

        for (uint i = 0; i < _appIds.length; i++) {
            isValidForGroupId(_appIds[i], _timestamp);
            require(
                isSignedByValidator(
                    _appIds[i],
                    encodeForSignature(
                        msg.sender,
                        _appIds[i],
                        _ids[i],
                        _timestamp
                    ),
                    _signatures[i]
                ),
                "Invalid signature"
            );
        }
        require(
            _appIds.length == _ids.length,
            "AppIds and ids are inconsistent"
        );
        for (uint i = 0; i < _appIds.length; i++) {
            store.setAddressAndIdByAppId(_appIds[i], msg.sender, _ids[i]);
        }
    }


    function updateIdentity(
        uint _appId,
        address _newAddress
    ) external
    onlyIfStoreSet
    {
        store.updateAddressByAppId(_appId, msg.sender, _newAddress);
    }


    function claimIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyIfClaimerSet
    onlySignedByValidator(_appId, _id, _timestamp, _signature)
    {
        isValidForGroupId(_appId, _timestamp);
        claimer.setClaim(_appId, _id, msg.sender);
    }


    function updateClaimedIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyIfClaimerSet
    onlySignedByValidator(_appId, _id, _timestamp, _signature)
    {
        isValidForGroupId(_appId, _timestamp);
        claimer.setClaimedIdentity(_appId, _id, msg.sender);
    }

}
