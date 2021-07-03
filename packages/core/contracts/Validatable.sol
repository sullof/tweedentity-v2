// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Validatable
 * @version 0.0.1
 * @author Francesco Sullo <francesco@sullo.co>
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Validatable is Ownable {

    event ValidForByAppIdUpdated(uint _groupId, uint _validForByAppId);

    event ValidatorAdded(uint _groupId, address _validator);
    event ValidatorRemoved(uint _groupId, address _validator);

    using ECDSA for bytes32;

    mapping(uint => mapping(address => bool)) internal _validators;

    mapping(uint => uint) public validForByAppId;

    constructor(
        uint[] memory _groupIds,
        address[] memory _initialValidators
    )
    {
        for (uint i=0;i<_groupIds.length;i++) {
            _addValidator(_groupIds[i], _initialValidators[i]);
        }
    }

    function isValidatorForGroup(uint _groupId, address _validator)
    public view
    returns (bool)
    {
        return _validators[_groupId][_validator];
    }

    function _addValidator(uint _groupId, address _validator) internal
    {
        _validators[_groupId][_validator] = true;
        emit ValidatorAdded(_groupId, _validator);
    }

    function addValidator(uint _groupId, address _validator) external
    onlyOwner
    {
        require(_validator != address(0), "Validator can not be 0x0");
        require(!_validators[_groupId][_validator], "Validator already set");
        _addValidator(_groupId, _validator);
    }

    function _removeValidator(uint _groupId, address _validator) internal
    {
        delete _validators[_groupId][_validator];
        emit ValidatorRemoved(_groupId, _validator);
    }


    function removeValidator(uint _groupId, address _validator) external
    onlyOwner
    {
        require(_validators[_groupId][_validator], "Validator not found");
        _removeValidator(_groupId, _validator);
    }

    function updateValidator(uint _groupId, address _validator, address _newValidator) external
    onlyOwner
    {
        require(_newValidator != address(0), "New validator can not be 0x0");
        require(_newValidator != _validator, "No changes");
        require(_validators[_groupId][_validator], "Validator not found");
        require(!_validators[_groupId][_newValidator], "New validator already set");
        _removeValidator(_groupId, _validator);
        _addValidator(_groupId, _newValidator);
    }

    function updateTimestampValidFor(uint _groupId, uint _validFor) external
    onlyOwner
    {
        validForByAppId[_groupId] = _validFor;
        emit ValidForByAppIdUpdated(_groupId, _validFor);
    }

    function getChainId()
    public view
    returns (uint256) {
        uint256 id;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            id := chainid()
        }
        return id;
    }


    function isValidForGroupId(
        uint _groupId,
        uint _timestamp
    ) internal view
    returns (bool)
    {
        require(
            // solium-disable-next-line security/no-block-members
            _timestamp < block.timestamp,
            "Invalid timestamp"
        );
        require(
            // solium-disable-next-line security/no-block-members
            _timestamp > block.timestamp - validForByAppId[_groupId],
            "Signature expired"
        );
        return true;
    }

    function encodeForSignature(
        address _address,
        uint _groupId,
        uint _id,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupId,
                _id,
                _timestamp
            )
        );
    }

    function encodeForSignature(
        address _address,
        uint[] memory _groupIds,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupIds,
                _ids,
                _timestamp
            )
        );
    }

    function encodeForSignature(
        address _address,
        uint _groupId,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(
            abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupId,
                _ids,
                _timestamp
            )
        );
    }


    function isSignedByValidator(
        uint _groupId,
        bytes32 _hash,
        bytes memory _signature
    ) public view
    returns (bool)
    {
        return _validators[_groupId][ECDSA.recover(_hash, _signature)];
    }

}
