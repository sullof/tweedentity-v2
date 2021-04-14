// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Application is Ownable {

    event AppAdded(
        uint indexed id,
        bytes32 indexed nickname
    );

    event InactiveAppRemoved(
        uint indexed id
    );

    event AppActivated(
        uint indexed id
    );

    struct App {
        bytes32 nickname;
        bool hasPureNumberId;
    }

    uint constant public maxNumberOfApps = 100;

    uint public lastAppId;
    mapping(uint => App) public apps;

    // set by the extender
    mapping(uint => bool) private _activeApps;

    function activateApp(
        uint _id
    ) internal
    {

        if (!_activeApps[_id]) {
            _activeApps[_id] = true;
            emit AppActivated(_id);
        }
    }

    function addApp(
        bytes32 _nickname,
        bool _pureNumber
    ) public
    onlyOwner
    {
        require(
            _nickname > 0,
            "Empty nickname"
        );
        require(
            lastAppId < maxNumberOfApps - 1,
            "Limit reached. New apps not allowed"
        );

        lastAppId++;
        apps[lastAppId] = App(_nickname, _pureNumber);
        emit AppAdded(lastAppId, _nickname);
    }

    function removeInactiveApps() public
    onlyOwner
    {
        for (uint i = lastAppId; i > 0; i--) {
            if (_activeApps[i]) {
                break;
            }
            lastAppId--;
            delete apps[i];
            emit InactiveAppRemoved(i);
        }

    }

}
