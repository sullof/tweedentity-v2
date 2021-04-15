// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */

import "hardhat/console.sol";
import "./Managed.sol";
import "./Application.sol";


// the store will be managed by the Claimer and the Manager

contract Tweedentities is Application, Managed {

    event IdentitySet(
        uint indexed _appId,
        uint indexed _id,
        address indexed _address
    );

    event IdentityUpdated(
        uint indexed _appId,
        uint indexed _id,
        address indexed _address
    );

    mapping(uint => mapping(uint => address)) private _addressById;
    mapping(uint => mapping(address => uint)) private _idByAddress;
    mapping(uint => uint) public totalIdentities;


    constructor(address _manager)
    Managed(_manager)
    {
        // twitter
        addApp(
            0x7477697474657200000000000000000000000000000000000000000000000000,
            true
        );
        // reddit
        addApp(
            0x7265646469740000000000000000000000000000000000000000000000000000,
            false
        );
    }


    function setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) external
    onlyManager
    {
        require(
            apps[_appId].nickname > 0,
            "Unsupported app"
        );
        require(
            _address != address(0),
            "_address cannot be 0x0"
        );
        require(
            _idByAddress[_appId][_address] == 0,
            "Existing identity found for _appId/_address"
        );
        require(
            _addressById[_appId][_id] == address(0),
            "Existing identity found for _appId/_id"
        );

        activateApp(_appId);
        _idByAddress[_appId][_address] = _id;
        _addressById[_appId][_id] = _address;
        totalIdentities[_appId]++;
        emit IdentitySet(_appId, _id, _address);
    }


    function updateAddressByAppId(
        uint _appId,
        address _oldAddress,
        address _newAddress
    ) external
    onlyManager
    {
        require(
            _newAddress != address(0),
            "_newAddress cannot be 0x0"
        );
        require(
            _newAddress != _oldAddress,
            "No change required"
        );
        require(
            _idByAddress[_appId][_oldAddress] != 0,
            "No identity found for _appId/_oldAddress"
        );
        require(
            _idByAddress[_appId][_newAddress] == 0,
            "Existing identity found for _appId/_newAddress"
        );

        uint id = _idByAddress[_appId][_oldAddress];
        _idByAddress[_appId][_newAddress] = id;
        _addressById[_appId][id] = _newAddress;
        delete _idByAddress[_appId][_oldAddress];
        emit IdentityUpdated(_appId, id, _newAddress);
    }


    function profile(
        address _address
    ) public view
    returns (uint[] memory)
    {
        uint[] memory ids = new uint[](lastAppId);
        for (uint i = 1; i <= lastAppId; i++) {
            if (_idByAddress[i][_address] != 0) {
                ids[i - 1] = _idByAddress[i][_address];
            }
        }
        return ids;
    }


    function idByAddress(
        uint _appId,
        address _address
    ) public view
    returns (uint)
    {
        return _idByAddress[_appId][_address];
    }


    function addressById(
        uint _appId,
        uint _id
    ) public view
    returns (address)
    {
        return _addressById[_appId][_id];
    }

}
