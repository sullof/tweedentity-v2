// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Tweedentity
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Tweedentity Semi-fungible & Identity Token
 */


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

//import "hardhat/console.sol";

import "./IdentityManager.sol";

contract Tweedentity is ERC1155, IdentityManager {

    using ECDSA for bytes32;
    using SafeMath for uint;

    event DoneeUpdated(address indexed _donee);
    event MaxSupplyUpdated(uint _maxSupply);

    address public donee;
    uint public maxSupply;
    uint public maxMintingEvents = 1000;
    mapping(bytes32 => uint) public lastMintedById;

    constructor(address _oracle, address _donee, string memory _uri, uint _maxSupply)
    ERC1155(_uri)
    IdentityManager(_oracle)
    {
        donee = _donee;
        maxSupply = _maxSupply;
    }

    function updateDonee(address _donee) external
    onlyOwner
    {
        donee = _donee;
        emit DoneeUpdated(_donee);
    }

    function updateMaxSupply(uint _maxSupply) external
    onlyOwner
    {
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }

    function nextTokenId(uint _appId, bytes32 _id) public view
    returns (uint)
    {
        uint id = uint256(_id);
        uint tokenId = id.mul(maxNumberOfApps * maxMintingEvents)
        + _appId.mul(maxMintingEvents)
        + lastMintedById[_id].add(1);
        return tokenId;
    }

    function mintNewEdition(
        uint _appId,
        uint _tokenId,
        uint _supply,
        uint _donation,
        address[] memory _otherDonees,
        uint[] memory _otherDonations,
        bytes memory _signature
    ) external
    onlyAlreadySet(_appId, msg.sender)
    {
        require(isSignedByOracle(keccak256(abi.encode(msg.sender, _appId, _tokenId)), _signature), "Not signed by oracle");
        bytes32 id = idByAddress[_appId][msg.sender];
        require(id != 0, "Identity not found");
        require(_tokenId == nextTokenId(_appId, id), "Invalid token ID");
        require(_supply > 0 && _supply <= maxSupply, "Invalid supply");
        require(_otherDonees.length == _otherDonations.length, "Donations do not match with donees");
        uint totalDonations = _donation;
        for (uint i = 0; i < _otherDonees.length; i++) {
            require(_otherDonees[i] != address(0), "Donation to 0x0 address");
            totalDonations = totalDonations.add(_otherDonations[i]);
        }
        require(totalDonations <= _supply, "Donations can not be larger than supply");
        lastMintedById[id] = lastMintedById[id].add(1);
        bytes memory zero;
        _mint(msg.sender, _tokenId, _supply, zero);
        if (totalDonations > 0) {
            if (_donation > 0) {
                safeTransferFrom(msg.sender, donee, _tokenId, _donation, zero);
            }
            for (uint i = 0; i < _otherDonees.length; i++) {
                address addr = _otherDonees[i];
                safeTransferFrom(msg.sender, addr, _tokenId, _otherDonations[i], zero);
            }
        }
    }

}
