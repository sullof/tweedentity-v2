// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Signable
 * @version 0.0.1
 * @author Francesco Sullo <francesco@sullo.co>
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Signable is Ownable {

    event TimestampValidForUpdated(uint _timestampValidFor);

    event OracleAdded(address _oracle);
    event OracleRemoved(address _oracle);
    event OracleUpdated(address _oldOracle, address _newOracle);

    using ECDSA for bytes32;

    mapping(address => bool) public oracles;
    address[] public oraclesAddress;

    address public oracle;
    uint public timestampValidFor = 1 days;

    constructor(
        address _oracle
    )
    {
        _addOracle(_oracle);
    }

    function _addOracle(address _oracle) internal
    {
        oracles[_oracle] = true;
        oraclesAddress.push(_oracle);
        emit OracleAdded(_oracle);
    }

    function addOracle(address _oracle) external
    onlyOwner
    {
        require(_oracle != address(0), "Oracle can not be 0x0");
        require(!oracles[_oracle], "Oracle already set");
        _addOracle(_oracle);
    }

    function removeOracle(address _oracle) external
    onlyOwner
    {
        require(oracles[_oracle], "Oracle not found");
        delete oracles[_oracle];
        for (uint i = 0; i < oraclesAddress.length; i++) {
            if (oraclesAddress[i] == _oracle) {
                oraclesAddress[i] = address(0);
            }
        }
        emit OracleRemoved(_oracle);
    }

    function updateOracle(address _oracle, address _newOracle) external
    onlyOwner
    {
        require(_newOracle != address(0), "New oracle can not be 0x0");
        require(_newOracle != _oracle, "No changes");
        require(oracles[_oracle], "Oracle not found");
        require(!oracles[_newOracle], "New oracle already set");

        delete oracles[_oracle];
        oracles[_newOracle] = true;
        for (uint i = 0; i < oraclesAddress.length; i++) {
            if (oraclesAddress[i] == _oracle) {
                oraclesAddress[i] = _newOracle;
            }
        }
        emit OracleUpdated(_oracle, _newOracle);
    }

    function updateTimestampValidFor(uint _timestampValidFor) external
    onlyOwner
    {
        timestampValidFor = _timestampValidFor;
        emit TimestampValidForUpdated(_timestampValidFor);
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


    modifier onlyValidTimestamp(
        uint _timestamp
    ) {
        require(
            // solium-disable-next-line security/no-block-members
            _timestamp < block.timestamp,
            "Invalid timestamp"
        );
        require(
            // solium-disable-next-line security/no-block-members
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


    function isSignedByOracle(
        bytes32 _hash,
        bytes memory _signature
    ) public view
    returns (bool)
    {
        return oracles[ECDSA.recover(_hash, _signature)];
    }

}
