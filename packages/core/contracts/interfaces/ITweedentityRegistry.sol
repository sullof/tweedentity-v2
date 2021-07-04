// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ITweedentityRegistry
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface ITweedentityRegistry {

    event RegistryUpdated(bytes32 contractName, address contractAddress);

    function setData(bytes32 name_, address address_) external;

    function updateData(bytes32 name_, address address_) external;


}
