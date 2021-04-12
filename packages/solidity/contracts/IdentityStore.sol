// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract IdentityStore is Ownable {

    using SafeMath for uint;

    event AppAdded(
        uint indexed id,
        bytes32 indexed nickname
    );

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


    struct App {
        bytes32 nickname;
        bool hasPureNumberId;
    }

    uint constant public maxNumberOfApps = 100;

    uint internal _lastAppId;
    mapping(uint => App) public apps;

    mapping(uint => mapping(uint => address)) public addressById;
    mapping(uint => mapping(address => uint)) public idByAddress;
    mapping(uint => uint) public totalIdentities;


    constructor() {
        addApp("twitter", true);
        addApp("reddit", false);
    }


    function addApp(
        bytes32 _appNickname,
        bool _pureNumber
    ) public
    onlyOwner
    {
        require(
            _appNickname > 0,
            "Empty nickname"
        );

//        console.log("_lastAppId %s maxNumberOfApps %s", _lastAppId, maxNumberOfApps);

        require(
            _lastAppId < maxNumberOfApps.sub(1),
            "New apps not allowed"
        );

        _lastAppId++;
        apps[_lastAppId] = App(_appNickname, _pureNumber);
        emit AppAdded(_lastAppId, _appNickname);
    }


    function _setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) internal
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
            idByAddress[_appId][_address] == 0,
            "Existing identity found for _appId/_address"
        );
        require(
            addressById[_appId][_id] == address(0),
            "Existing identity found for _appId/_id"
        );

        idByAddress[_appId][_address] = _id;
        addressById[_appId][_id] = _address;
        totalIdentities[_appId]++;
        emit IdentitySet(_appId, _id, _address);
    }


    function _updateAddressByAppId(
        uint _appId,
        address _oldAddress,
        address _newAddress
    ) internal
    {
        require(
            _newAddress != address(0),
            "_newAddress cannot be 0x0"
        );
        require(
            idByAddress[_appId][_oldAddress] != 0,
            "No identity found for _appId/_oldAddress"
        );
        require(
            idByAddress[_appId][_newAddress] == 0,
            "Existing identity found for _appId/_newAddress"
        );

        uint id = idByAddress[_appId][_oldAddress];
        idByAddress[_appId][_newAddress] = id;
        addressById[_appId][id] = _newAddress;
        delete idByAddress[_appId][_oldAddress];
        emit IdentityUpdated(_appId, id, _newAddress);
    }


    function isSetAndOwned(
        uint _appId,
        address _address,
        uint _id
    ) internal view
    returns (bool)
    {
        return _address != address(0) && idByAddress[_appId][_address] == _id && addressById[_appId][_id] == _address;

    }



}
