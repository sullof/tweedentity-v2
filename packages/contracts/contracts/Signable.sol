// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title Signable
 * @version 1.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Manages identities
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Signable is Ownable {

    using ECDSA for bytes32;

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
            isSignedByOracle(keccak256(abi.encode(
                getChainId(),
                msg.sender,
                _appId,
                _id,
                _timestamp
            )), _signature),
            "Invalid signature"
        );
        _;
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
