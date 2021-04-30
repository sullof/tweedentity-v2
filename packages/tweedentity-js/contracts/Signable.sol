// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title Signable
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Signable is Ownable {

    using ECDSA for bytes32;

    //    byte private constant prefix = 0x19;
    //    byte private constant version = 0;

    event TimestampValidForUpdated(
        uint _timestampValidFor
    );

    event OracleUpdated(
        address _oracle
    );

    address public oracle;
    uint public timestampValidFor = 1 days;

    modifier onlyValidSignature(
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

    modifier onlySignedByOracle(
        uint _appId,
        uint _id,
        uint _timestamp,
        bytes memory _signature
    ) {
        require(
            isSignedByOracle(
                encodeForSignature(
                    msg.sender,
                    _appId,
                    _id,
                    _timestamp
                ),
                _signature
            ),
            "Invalid signature"
        );
        _;
    }

    function encodeForSignature(
        address _address,
        uint _appId,
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
                _appId,
                _id,
                _timestamp
            ));
    }

    function encodeForSignature(
        address _address,
        uint[] memory _appIds,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _appIds,
                _ids,
                _timestamp
            ));
    }

    function encodeForSignature(
        address _address,
        uint _appId,
        uint[] memory _ids,
        uint _timestamp
    ) public view
    returns (bytes32)
    {
        return keccak256(abi.encodePacked(
                "\x19\x00",
                _address,
                getChainId(),
                _appId,
                _ids,
                _timestamp
            ));
    }

    constructor(
        address _oracle
    )
    {
        oracle = _oracle;
    }

    function getChainId()
    public view
    returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }


    function updateOracle(address _oracle) external
    onlyOwner
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function updateTimestampValidFor(uint _timestampValidFor) external
    onlyOwner
    {
        timestampValidFor = _timestampValidFor;
        emit TimestampValidForUpdated(_timestampValidFor);
    }


    function isSignedByOracle(
        bytes32 _hash,
        bytes memory _signature
    ) public view
    returns (bool)
    {
        return oracle == ECDSA.recover(_hash, _signature);
    }

}
