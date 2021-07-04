// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Managed v1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract Managed is Ownable {

    mapping(address => bool) public managers;

    event ManagerAdded(address indexed manager);
    event ManagerRemoved(address indexed manager);

    uint public total;

    modifier notNullAddress(
        address _manager
    ) {
        require(
            _manager != address(0),
            "Null address"
        );
        _;
    }

    modifier onlyManager() {
        require(
            total > 0,
            "No manager set yet"
        );
        require(
            managers[msg.sender],
            "Not authorized"
        );
        _;
    }

    constructor(address _manager) {
        if (_manager != address(0)) {
            managers[_manager] = true;
            total++;
        }
    }


    /**
    * @dev Sets new manager
    * @param _manager New manager's address
    */
    function addManager(
        address _manager
    ) external
    onlyOwner
    notNullAddress(_manager)
    {
        require(
            managers[_manager] == false,
            "Manager already set"
        );
        managers[_manager] = true;
        total++;
        emit ManagerAdded(_manager);
    }

    /**
    * @dev Sets new manager
    * @param _manager New manager's address
    */
    function removeManager(
        address _manager
    ) external
    onlyOwner
    notNullAddress(_manager)
    {
        require(
            managers[_manager],
            "Manager not found"
        );
        delete managers[_manager];
        total--;
        emit ManagerRemoved(_manager);
    }

}
