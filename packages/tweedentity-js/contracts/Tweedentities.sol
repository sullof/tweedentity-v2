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

    uint constant public maxNumberOfChains = 100;

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

    event NicknameSet(
        uint indexed _id,
        bytes32 nickname
    );


    event DataChanged(
        uint indexed _id,
        bytes32 indexed key,
        bytes value
    );

    mapping(uint => mapping(uint => address)) private _addressById;
    mapping(uint => mapping(address => uint)) private _idByAddress;
    mapping(uint => uint) public totalIdentities;

    uint public lastTweedentityId;

    // There is no way to validate this on chain.
    uint public chainProgressiveId;

    bool public nicknamesActive;
    mapping(uint => bytes32) public nicknamesById;
    mapping(bytes32 => bool) public takenNicknames;

    bytes32[] public supportedExtras;
    mapping(uint => mapping(bytes32 => bytes)) public extras;



    constructor(
        address _manager,
        uint _chainProgressiveId
    )
    Managed(_manager)
    {
        require(
            _chainProgressiveId < maxNumberOfChains,
            "_chainProgressiveId must be < 100"
        );
        chainProgressiveId = _chainProgressiveId;
        // twitter
        addApp(0x7477697474657200000000000000000000000000000000000000000000000000);
        // reddit
        addApp(0x7265646469740000000000000000000000000000000000000000000000000000);
        // instagram
        addApp(0x696e7374616772616d0000000000000000000000000000000000000000000000);
    }



    function setExtraKey(
        bytes32 _key
    ) external
    onlyOwner
    {
        supportedExtras.push(_key);
    }


    function getExtras(
        address _address,
        bytes32 _key
    ) public view
    returns (bytes memory _value)
    {
        uint id = _idByAddress[0][_address];
        require(
            id != 0,
            "Account not found"
        );
        return extras[id][_key];
    }


    function setExtras(
        bytes32 _key,
        bytes calldata _value
    ) external
    {
        bool supported;
        for (uint i = 0; i < supportedExtras.length; i++) {
            if (supportedExtras[i] == _key) {
                supported = true;
                break;
            }
        }
        require(
            supported,
            "Key not supported"
        );
        uint id = _idByAddress[0][msg.sender];
        require(
            id != 0,
            "Account not found"
        );
        extras[id][_key] = _value;
        emit DataChanged(id, _key, _value);
    }


    function activateNicknames() external
    onlyOwner
    {
        nicknamesActive = true;
    }


    function setNickname(
        bytes32 _nickname
    ) external
    {
        require(
            nicknamesActive,
            "Nicknames not active"
        );
        uint id = _idByAddress[0][msg.sender];
        require(
            id != 0,
            "Account not found"
        );
        // nicknames are immutable
        require(
            !takenNicknames[_nickname],
            "Nickname taken"
        );
        require(
            nicknamesById[id] == 0,
            "Nicknames are immutable"
        );
        nicknamesById[id] = _nickname;
        takenNicknames[_nickname] = true;
        NicknameSet(id, _nickname);
    }


    function setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) external
    onlyManager
    {
        require(
            apps[_appId] > 0,
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
        if (_appId == 0) {
            lastTweedentityId++;
            _id = lastTweedentityId;
        }
        require(
            _addressById[_appId][_id] == address(0),
            "Existing identity found for _appId/_id"
        );

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
        for (uint i = 0; i <= lastAppId; i++) {
            if (_idByAddress[i][_address] != 0) {
                ids[i] = _idByAddress[i][_address];
            }
        }
        return ids;
    }


    function profile() public view
    returns (uint[] memory)
    {
        return profile(msg.sender);
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
