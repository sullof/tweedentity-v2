// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IClaimable.sol";

contract Claimable
is
IClaimable,
Ownable {

    uint256 public waitingTime;
    address public oracle;

    uint256 internal _claimId = 0;

    mapping(uint256 => address) internal _pendingClaims;
    mapping(address => uint256) internal _ids;
    mapping(uint256 => address) internal _claimers;

    constructor(
        address _oracle,
        uint256 _waitingTime
    )
    {
        oracle = _oracle;
        waitingTime = _waitingTime;
    }

    function updateOracle(
        address _oracle
    )
    external
    onlyOwner
    virtual
    override
    {
        oracle = _oracle;
        emit OracleUpdated(_oracle, block.timestamp);
    }

    function updateWaitingTime(
        uint256 _waitingTime
    )
    external
    onlyOwner
    virtual
    override
    {
        waitingTime = _waitingTime;
        emit WaitingTimeUpdated(_waitingTime, block.timestamp);
    }

    function setClaim(
        uint256 proofId
    )
    external
    virtual
    override
    {
        _claimId++;
        _pendingClaims[_claimId] = msg.sender;
        emit ClaimSet(_claimId, msg.sender, proofId, block.timestamp);
    }

    function verifyClaim(
        uint256 claimId,
        uint256 id
    )
    external
    virtual
    override
    {
        require(msg.sender == oracle, "Not authorized");
        if (id > 0) {
            address addr = _pendingClaims[claimId];
            _ids[addr] = id;
            _claimers[id] = addr;
            emit ClaimApproved(claimId, addr, id, block.timestamp);
        } else {
            emit ClaimRebunked(claimId, block.timestamp);
        }
    }

    function addressOf(uint256 id)
    external
    view
    virtual
    override
    returns (address)
    {
        return _claimers[id];
    }

    function idOf(address addr)
    external
    view
    virtual
    override
    returns (uint256)
    {
        return _ids[addr];
    }

}
