// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title IdentityManager
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

//import "hardhat/console.sol";

import "./Datastore.sol";

contract IdentityManager is Datastore {

    using ECDSA for bytes32;

    event IdentitySet(uint indexed _appId, address indexed _addr, bytes32 indexed _id);
    event IdentityUpdated(uint indexed _appId, address indexed _addr, bytes32 indexed _id);

    event OracleUpdated(address indexed _donee);

    address public oracle;

    constructor(address _oracle)
    {
        oracle = _oracle;
    }

    function updateOracle(address _oracle) external
    onlyOwner
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setIdentity(uint _appId, bytes32 _id, bytes memory _signature) external
    onlySupportedApp(_appId)
    onlyNotNullAddress(msg.sender)
    onlyNotAlreadySet(_appId, msg.sender, _id)
    {
        require(isSignedByOracle(keccak256(abi.encode(msg.sender, _appId, _id)), _signature), "Not signed by oracle");
        setAddressAndIdByAppId(_appId, msg.sender, _id);
        emit IdentitySet(_appId, msg.sender, _id);
    }

    function updateIdentity(uint _appId, address _newAddress) external
    onlySupportedApp(_appId)
    onlyNotNullAddress(_newAddress)
    onlyAlreadySet(_appId, msg.sender)
    onlyAddressNotAlreadySet(_appId, _newAddress)
    {
        updateAddressByAppId(_appId, _newAddress);
        emit IdentityUpdated(_appId, msg.sender, idByAddress[_appId][_newAddress]);
    }

    function isSignedByOracle(bytes32 _hash, bytes memory _signature) internal view
    returns (bool)
    {
        return oracle == ECDSA.recover(_hash, _signature);
    }

}
