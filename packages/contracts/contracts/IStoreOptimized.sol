// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IStoreOptimized
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev An optimized Store inferface
 */

import "hardhat/console.sol";

interface IStoreOptimized {

    function totalIdentities()
    external view
    returns (uint);

    function lastAppId()
    external view
    returns (uint);

    function maxNumberOfApps()
    external view
    returns (uint);

    function idByAddress(
        uint _appId,
        address _address
    ) external view
    returns (uint);

    function addressById(
        uint _appId,
        uint _id
    ) external view
    returns (address);

    function setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) external;

    function setNickname(
        bytes32 _nickname
    ) external;

    function updateAddressByAppId(
        uint _appId,
        address _oldAddress,
        address _newAddress
    ) external;
}
