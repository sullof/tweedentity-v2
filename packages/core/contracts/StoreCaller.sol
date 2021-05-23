// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title StoreCaller
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./IStoreOptimized.sol";

contract StoreCaller is AccessControl {

    IStoreOptimized public store;

    event StoreSet(
        address indexed _store
    );

    bool public storeSet;

    modifier onlyIfStoreSet() {
        require(
            storeSet,
            "Store not set yet"
        );
        _;
    }

    constructor(
        address _store
    )
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        setStore(_store);
    }

    function setStore(
        address _store
    ) public
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), 'Not authorized');
        if (!storeSet && _store != address(0)) {
            store = IStoreOptimized(_store);
            storeSet = true;
            emit StoreSet(_store);
        }
    }

}
