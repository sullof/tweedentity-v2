// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IdentityManager
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "./ClaimableIdentityStore.sol";

contract IdentityManager is ClaimableIdentityStore {

    using ECDSA for bytes32;
    using SafeMath for uint;

    event OracleUpdated(
        address indexed oracle
    );

    event TimestampValidForUpdated(
        uint _timestampValidFor
    );

    address public oracle;
    uint public timestampValidFor = 1 days;


    modifier onlySignedByOracle(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) {
//        console.log("_timestamp %s, block.timestamp %s, timestampValidFor %s", _timestamp, block.timestamp, timestampValidFor);
        require(
            _timestamp < block.timestamp,
            "Invalid timestamp"
        );
        require(
            _timestamp > block.timestamp.sub(timestampValidFor),
            "Signature expired"
        );
        require(
            isSignedByOracle(keccak256(abi.encode(
                getChainId(),
                msg.sender,
                _appId,
                _id,
                _timestamp
            )), _signature),
            "Invalid signature"
        );
        _;
    }

    modifier onlyMultiSignedByOracle(
        uint _appId,
        uint[] memory _ids,
        uint _timestamp,
        bytes memory _signature
    ) {
        //        console.log("_timestamp %s, block.timestamp %s, timestampValidFor %s", _timestamp, block.timestamp, timestampValidFor);
        require(
            _timestamp < block.timestamp,
            "Invalid timestamp"
        );
        require(
            _timestamp > block.timestamp.sub(timestampValidFor),
            "Signature expired"
        );
        require(
            isSignedByOracle(keccak256(abi.encode(
                getChainId(),
                msg.sender,
                _appId,
                _ids,
                _timestamp
            )), _signature),
            "Invalid signature"
        );
        _;
    }


    constructor(address _oracle) {
        oracle = _oracle;
    }


    function getChainId()
    public view
    returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }


    function updateOracle(address _oracle) external
    onlyOwner
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function updateTimestampValidFor(uint _timestampValidFor) external
    onlyOwner
    {
        timestampValidFor = _timestampValidFor;
        emit TimestampValidForUpdated(_timestampValidFor);
    }


    function setIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        _setAddressAndIdByAppId(_appId, msg.sender, _id);
    }


    function updateIdentity(
        uint _appId,
        address _newAddress
    ) external
    {
        _updateAddressByAppId(_appId, msg.sender, _newAddress);
    }


    function claimIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        _setClaim(_appId, _id, msg.sender);
    }

    function updateClaimedIdentity(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlySignedByOracle(_appId, _id, _timestamp, _signature)
    {
        _setClaimedIdentity(_appId, _id, msg.sender);
    }

    // utils

    function isSignedByOracle(
        bytes32 _hash,
        bytes memory _signature
    ) internal view
    returns (bool)
    {
        return oracle == ECDSA.recover(_hash, _signature);
    }

}
