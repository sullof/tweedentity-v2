// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IdentityManager
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "./IStoreOptimized.sol";
import "./IClaimerOptimized.sol";
import "./ClaimerCaller.sol";
import "./StoreCaller.sol";
import "./Signable.sol";

contract IdentityManager is ClaimerCaller, StoreCaller, Signable {

//    bytes32 public  = "0x7a6dfc";

    uint private _currentTweedentityID;


    function _getNextTweedentityID()
    private view
    returns (uint)
    {
        return _currentTweedentityID + 1;
    }


    function _incrementTokenTypeId()
    private
    {
        _currentTweedentityID++;
    }


    constructor(
        address _oracle,
        address _store,
        address _claimer
    )
    Signable(_oracle)
    StoreCaller(_store)
    ClaimerCaller(_claimer)
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
    onlyValidSignature(_timestamp)
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        store.setAddressAndIdByAppId(_appId, msg.sender, _id);
    }


    function setMultipleIdentities(
        uint[] memory _appIds,
        uint[] memory _ids,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyIfStoreSet
    onlyValidSignature(_timestamp)
    {
        require(
            isSignedByOracle(encodeForSignature(
                msg.sender,
                _appIds,
                _ids,
                _timestamp
            ), _signature),
            "Invalid signature"
        );
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
    onlyValidSignature(_timestamp)
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        claimer.setClaim(_appId, _id, msg.sender);
    }


    function updateClaimedIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyIfClaimerSet
    onlyValidSignature(_timestamp)
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        claimer.setClaimedIdentity(_appId, _id, msg.sender);
    }


//    function stringToUint(
//        string s
//    ) internal
//    view
//    returns (uint result) {
//        bytes memory b = bytes(s);
//        uint i;
//        result = 0;
//        for (i = 0; i < b.length; i++) {
//            uint c = uint(b[i]);
//            if (c >= 48 && c <= 57) {
//                result = result * 10 + (c - 48);
//            }
//        }
//    }

}
