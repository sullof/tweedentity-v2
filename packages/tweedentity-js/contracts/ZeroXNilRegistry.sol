// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Twiptos
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Twiptos Registry
 */

import "@openzeppelin/contracts/access/Ownable.sol";


contract ZeroXNilRegistry is Ownable {

    event RegistryUpdated(bytes32 _contract, address _contractAddress);

    mapping(bytes32 => address) public registry;

    constructor(
        bytes32[] memory _names,
        address[] memory _addresses
    ) {
        for (uint i=0;i< _names.length; i++) {
            setData(_names[i], _addresses[i]);
        }
    }

    function setData(
        bytes32 _name,
        address _address
    )
    public
    onlyOwner
    {
        if (_address != address(0)) {
            registry[_name] = _address;
        }
    }

    function updateData(
        bytes32 _name,
        address _address
    )
    public
    onlyOwner
    {
        require(_address != address(0),
            "Null address"
        );
        registry[_name] = _address;
        emit RegistryUpdated(_name, _address);

    }


}
