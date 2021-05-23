// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ISignable 0.0.1
 * @author Francesco Sullo <francesco@sullo.co>
 */

interface ISignable {

    event TimestampValidForUpdated(uint _timestampValidFor);

    event OracleUpdated(address _oracle);
    event OracleAdded(address _oracle);
    event OracleRemoved(address _oracle);

    function getChainId() external view returns (uint256);

    function updateOracle(address _oracle) external;

    function updateTimestampValidFor(uint _timestampValidFor) external;

    function isSignedByOracle(bytes32 _hash, bytes memory _signature) external view returns (bool);

}
