// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Tweedentity
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Tweedentity Semi-fungible & Identity Token
 */


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./IdentityManager.sol";


contract Tweedentity is ERC1155, IdentityManager {

    using ECDSA for bytes32;
    using SafeMath for uint;

    event DoneeUpdated(address indexed _donee);
    event MaxSupplyUpdated(uint _maxSupply);
    event MaxTokensByMintUpdated(uint _maxTokensByMint);
    event MinTimeBetweenMintingEventsUpdated(uint _minTimeBetweenMintingEvents);

    uint constant public maxNumberOfChains = 100;
    uint constant public maxMintingEvents = 1000;

    address public donee;

    // There is no way to validate this on chain.
    uint public chainProgressiveId;

    uint public maxSupply = 1000;
    uint public minTimeBetweenMintingEvents = 1 days;
    uint public maxTokensByMint = 10;

    struct NextMintedEvent {
        uint id;
        uint timestamp;
    }

    mapping(uint => NextMintedEvent) public nextMintedById;

    constructor(
        address _oracle,
        address _donee,
        string memory _uri,
        uint _chainProgressiveId
    )
    ERC1155(_uri)
    IdentityManager(_oracle)
    {
        donee = _donee;
        require(
            _chainProgressiveId < maxNumberOfChains,
            "_chainProgressiveId must be < 100"
        );
        chainProgressiveId = _chainProgressiveId;
    }


    function updateDonee(
        address _donee
    ) external
    onlyOwner
    {
        donee = _donee;
        emit DoneeUpdated(_donee);
    }

    function updateMaxSupply(
        uint _maxSupply
    ) external
    onlyOwner
    {
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }

    function updateMaxTokensByMint(
        uint _maxTokensByMint
    ) external
    onlyOwner
    {
        maxTokensByMint = _maxTokensByMint;
        emit MaxTokensByMintUpdated(_maxTokensByMint);
    }

    function updateMinTimeBetweenMintingEvents(
        uint _minTimeBetweenMintingEvents
    ) external
    onlyOwner
    {
        minTimeBetweenMintingEvents = _minTimeBetweenMintingEvents;
        emit MinTimeBetweenMintingEventsUpdated(_minTimeBetweenMintingEvents);
    }


    function nextTokenId(
        uint _appId,
        uint _id
    ) public view
    returns (uint)
    {
        uint tokenId = _id * maxNumberOfChains * maxNumberOfApps * maxMintingEvents
        + chainProgressiveId * maxNumberOfApps * maxMintingEvents
        + _appId * maxMintingEvents
        + nextMintedById[_id].id;
        return tokenId;
    }

    // 13 00 01 001



    function mintToken(
        uint _appId,
        uint _tokenId,
        uint _supply,
        uint[] memory _donations,
        address[] memory _donees,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlySignedByOracle(_appId, _tokenId, _timestamp, _signature)
    {
        uint id = idByAddress[_appId][msg.sender];

        require(
            id != 0,
            "Identity not found"
        );
        require(
            _tokenId == nextTokenId(_appId, id),
            "Invalid token ID"
        );
        require(
            _supply > 0 && _supply <= maxSupply,
            "Invalid supply"
        );
        require(
            nextMintedById[id].timestamp == 0
            || nextMintedById[id].timestamp > block.timestamp.sub(minTimeBetweenMintingEvents),
            "Too early for new minting"
        );

        nextMintedById[id] = NextMintedEvent(nextMintedById[id].id + 1, block.timestamp);
        _mint(msg.sender, _tokenId, _supply, "");
        _makeDonations(_tokenId, _supply, _donations, _donees);
    }


    function _makeDonations(
        uint _tokenId,
        uint _supply,
        uint[] memory _donations,
        address[] memory _donees
    ) internal
    {
        require(
            _donations.length == _donees.length,
            "Donations are inconsistent with donees"
        );

        uint total;
        for (uint i = 0; i < _donations.length; i++) {
            total += _donations[i];
        }

        require(
            total <= _supply,
            "Donations can not be larger than supply"
        );

        for (uint i = 0; i < _donees.length; i++) {
            if (_donations[i] > 0) {
                if (_donees[i] == address(0)) {
                    _donees[i] = donee;
                }
                safeTransferFrom(msg.sender, _donees[i], _tokenId, _donations[i], "");
            }
        }
    }


    function mintBatchToken(
        uint _appId,
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        uint[] memory _donations,
        address[] memory _donees,
        uint[] memory _temp,
        uint _timestamp,
        bytes memory _signature
    ) external
    onlyMultiSignedByOracle(_appId, _tokenIds, _timestamp, _signature)
    {
        uint id = idByAddress[_appId][msg.sender];

        require(
            id != 0,
            "Identity not found"
        );
        require(
            _tokenIds.length <= maxTokensByMint,
            "Tokens minted at a time over limit"
        );
        require(
            _tokenIds.length == _supplies.length &&
            _tokenIds.length == _donations.length,
            "Arrays' lengths are inconsistent"
        );
        for (uint i = 0; i < _tokenIds.length; i++) {
            require(
                _supplies[i] > 0 && _supplies[i] <= maxSupply,
                "Invalid supplies"
            );
            require(
                _tokenIds[i] == nextTokenId(_appId, id) + i,
                "Invalid token ID"
            );
        }

        require(
            nextMintedById[id].timestamp == 0
            || nextMintedById[id].timestamp > block.timestamp.sub(minTimeBetweenMintingEvents),
            "Too early for new minting"
        );

        nextMintedById[id] = NextMintedEvent(nextMintedById[id].id + _tokenIds.length, block.timestamp);

        _mintBatch(msg.sender, _tokenIds, _supplies, "");
        _makeBatchDonations(_tokenIds, _supplies, _donations, _donees, _temp);

    }

    function _makeBatchDonations(
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        uint[] memory _donations,
        address[] memory _donees,
        uint[] memory _temp
    ) internal
    {
        uint totalDonations;
        for (uint i = 0; i < _tokenIds.length; i++) {
            require(
                _donations[i] <= _supplies[i],
                "Donations can not be larger than supply"
            );
            totalDonations += _donations[i];
        }
        if (totalDonations > 0) {
            for (uint i = 0; i < _donees.length; i++) {
                uint[] memory amounts = getRations(_donations, _temp, i);
                safeBatchTransferFrom(msg.sender, _donees[i], _tokenIds, amounts, "");
            }
        }
    }

    function getRations(
        uint[] memory _donations,
        uint[] memory _temp,
        uint index
    ) internal pure
    returns (uint[] memory)
    {
        for (uint i = 0; i < _donations.length; i++) {
            uint base = _donations[i].div(_donations.length);
            uint remainder = _donations[i].mod(_donations.length);
            _temp[i] = base + (remainder > index ? 1 : 0);
        }
        return _temp;
    }

}
