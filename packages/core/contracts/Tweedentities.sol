// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IdentityStore
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */


import "hardhat/console.sol";
import "./Application.sol";

// the store will be managed by TweedentityClaimer and IdentityManager

contract Tweedentities is Application {

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

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

    event DataChanged(
        uint indexed _id,
        bytes32 indexed key,
        bytes value
    );

    event UniqueDataChanged(
        uint indexed _id,
        bytes32 indexed key,
        bytes32 value
    );

    mapping(uint => mapping(uint => address)) private _addressById;
    mapping(uint => mapping(address => uint)) private _idByAddress;
    mapping(uint => uint) public totalIdentities;

    uint public lastTweedentityId;

    // Assigned during the deployment
    uint public chainProgressiveId;

    struct Extra {
        bool isSupported;
        bool isUnique;
        bool isImmutable;
    }

    mapping(bytes32 => Extra) public supportedExtras;
    mapping(uint => mapping(bytes32 => bytes)) public extras;
    mapping(uint => mapping(bytes32 => bytes32)) public uniqueExtras;
    mapping(bytes32 => mapping(bytes32 => bool)) public uniqueExtraExists;


    modifier isSupported(bytes32 _key, bool _isUnique) {
        require(
            supportedExtras[_key].isSupported,
            "Key not supported"
        );
        require(
            supportedExtras[_key].isUnique == _isUnique,
            "Invalid uniqueness"
        );
        _;
    }

    constructor(
        uint _chainProgressiveId
    )
    {
        require(
            _chainProgressiveId < maxNumberOfChains,
            "_chainProgressiveId must be < 100"
        );
        chainProgressiveId = _chainProgressiveId;
        addApp(keccak256("twitter"));
        addApp(keccak256("reddit"));
        addApp(keccak256("instagram"));
    }

    function setExtraKey(
        bytes32 _key,
        bool _unique,
        bool _immutable
    ) external
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        require(
            !supportedExtras[_key].isSupported,
            "Key already active"
        );
        supportedExtras[_key] = Extra(true, _unique, _immutable);
    }

    function getExtras(
        address _address,
        bytes32 _key
    ) public view
    isSupported(_key, false)
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
    isSupported(_key, false)
    {
        uint id = _idByAddress[0][msg.sender];
        require(
            id != 0,
            "Account not found"
        );
        extras[id][_key] = _value;
        emit DataChanged(id, _key, _value);
    }


    function getUniqueExtras(
        address _address,
        bytes32 _key
    ) public view
    isSupported(_key, true)
    returns (bytes32 _value)
    {
        uint id = _idByAddress[0][_address];
        require(
            id != 0,
            "Account not found"
        );
        return uniqueExtras[id][_key];
    }


    function setUniqueExtras(
        bytes32 _key,
        bytes32 _value
    ) external
    isSupported(_key, true)
    {
        uint id = _idByAddress[0][msg.sender];
        require(
            id != 0,
            "Account not found"
        );
        if (supportedExtras[_key].isImmutable) {
            require(
                uniqueExtras[id][_key] == 0,
                "Immutable key"
            );
        } else {
            require(
                uniqueExtras[id][_key] != _value,
                "No change required"
            );
            if (uniqueExtras[id][_key] != 0) {
                uniqueExtraExists[_key][uniqueExtras[id][_key]] = false;
            }
        }
        uniqueExtraExists[_key][_value] = true;
        uniqueExtras[id][_key] = _value;
        emit UniqueDataChanged(id, _key, _value);
    }

    // solium-disable-next-line security/no-assign-params
    function setAddressAndIdByAppId(
        uint _appId,
        address _address,
        uint _id
    ) external
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Not authorized");
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
    {
        require(hasRole(MANAGER_ROLE, msg.sender), "Not authorized");
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
