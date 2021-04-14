// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Tweedentity
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Tweedentity Registry
 */

import "@openzeppelin/contracts/access/Ownable.sol";


contract Tweedentity is Ownable {

    bytes32 constant public token = 0x5477656564656e74697479546f6b656e00000000000000000000000000000000;
    bytes32 constant public store = 0x5477656564656e7469747953746f726500000000000000000000000000000000;
    bytes32 constant public manager = 0x4964656e746974794d616e616765720000000000000000000000000000000000;
    bytes32 constant public claimer = 0x4964656e74697479436c61696d65720000000000000000000000000000000000;
    bytes32 constant public factory = 0x5477656564656e74697479466163746f72790000000000000000000000000000;

    event RegistryUpdated(bytes32 _contract, address _contractAddress);

    mapping(bytes32 => address) public registry;

    constructor(
        address _store,
        address _claimer,
        address _manager,
        address _token,
        address _factory
    ) {
        setData(store, _store);
        setData(claimer, _claimer);
        setData(manager, _manager);
        setData(token, _token);
        setData(factory, _factory);
    }

    function setData(
        bytes32 _what,
        address _address
    )
    public
    onlyOwner
    {
        if (_address != address(0)) {
            registry[_what] = _address;
        }
    }

    function updateData(
        bytes32 _what,
        address _address
    )
    public
    onlyOwner
    {
        require(_address != address(0),
            "Null address"
        );
        registry[_what] = _address;
        emit RegistryUpdated(_what, _address);

    }


}
