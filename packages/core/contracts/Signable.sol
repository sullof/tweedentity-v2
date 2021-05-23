// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Signable
 * @version 0.0.1
 * @author Francesco Sullo <francesco@sullo.co>
 */

import "./ISignable.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Signable is ISignable, Ownable {

    using ECDSA for bytes32;

    mapping (address => bool) public oracles;
    address[] public oraclesAddress;

    address public oracle;
    uint public timestampValidFor = 1 days;

    constructor(
        address _oracle
    )
    {
        oracles[_oracle] = true;
        oraclesAddress.push[_oracle];
    }

    function _addOracle(address _oracle) internal
    {
        oracles[_oracle] = true;
        oraclesAddress.push[_oracle];
        emit OracleAdded(_oracle);
    }

    function updateOracle(address _oracle) external override
    onlyOwner
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function addOracle(address _oracle) external override
    onlyOwner
    {
        if (!oracles[_oracle]) {

        }
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function removeOracle(address _oracle) external override
    onlyOwner
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function updateTimestampValidFor(uint _timestampValidFor) external override
    onlyOwner
    {
        timestampValidFor = _timestampValidFor;
        emit TimestampValidForUpdated(_timestampValidFor);
    }

    function getChainId()
    public override view
    returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }


    modifier onlyValidTimestamp(
        uint _timestamp
    ) {
        require(
            _timestamp < block.timestamp,
            "Invalid timestamp"
        );
        require(
            _timestamp > block.timestamp - timestampValidFor,
            "Signature expired"
        );
        _;
    }

    function encodeForSignature(
        address _address,
        uint _groupId,
        uint _id,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        // EIP-191
        return keccak256(abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupId,
                _id,
                _timestamp
            ));
    }

    function encodeForSignature(
        address _address,
        uint[] memory _groupIds,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupIds,
                _ids,
                _timestamp
            ));
    }

    function encodeForSignature(
        address _address,
        uint _groupId,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _groupId,
                _ids,
                _timestamp
            ));
    }


    function isSignedByOracle(
        bytes32 _hash,
        bytes memory _signature
    ) public override view
    returns (bool)
    {
        return oracle == ECDSA.recover(_hash, _signature);
    }

}
