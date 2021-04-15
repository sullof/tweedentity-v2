// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Twiptos
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Twiptos Semi-fungible & Identity Token
 */


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "./StoreCaller.sol";
import "./Signable.sol";

contract Twiptos is ERC1155, StoreCaller, Signable {

    uint constant public maxNumberOfChains = 100;
    uint constant public maxMintingEvents = 1000;

    // There is no way to validate this on chain.
    uint public chainProgressiveId;

    struct Minted {
        uint tokenId;
        uint timestamp;
    }

    mapping(uint => mapping(uint => Minted)) private _lastMintedById;

    event DoneeUpdated(address indexed _donee);
    event MaxSupplyUpdated(uint _maxSupply);
    event MaxTokensByMintUpdated(uint _maxTokensByMint);
    event MinTimeBetweenMintingEventsUpdated(uint _minTimeBetweenMintingEvents);

    address public donee;

    uint public maxSupply = 1000;
    uint public minTimeBetweenMintingEvents = 1 days;
    uint public maxTokensByMint = 10;



    constructor(
        address _oracle,
        address _donee,
        string memory _uri,
        uint _chainProgressiveId,
        address _store
    )
    ERC1155(_uri)
    Signable(_oracle)
    StoreCaller(_store)
    {
        require(
            _chainProgressiveId < maxNumberOfChains,
            "_chainProgressiveId must be < 100"
        );
        chainProgressiveId = _chainProgressiveId;
        donee = _donee;
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
        uint tokenId = _id * maxNumberOfChains * store.maxNumberOfApps() * maxMintingEvents
        + chainProgressiveId * store.maxNumberOfApps() * maxMintingEvents
        + _appId * maxMintingEvents
        + _lastMintedById[_appId][_id].tokenId
        + 1;
        return tokenId;
    }


    function create(
        uint _appId,
        uint _tokenId,
        uint _supply,
        uint _timestamp,
        bytes memory _signature,
        uint[] memory _donations,
        address[] memory _donees
    ) external
    onlySignedByOracle(_appId, _tokenId, _timestamp, _signature)
    {
        require(
            _supply > 0 && _supply <= maxSupply,
            "Invalid supply"
        );

        uint id = store.idByAddress(_appId, msg.sender);

        require(
            id != 0,
            "Identity not found"
        );

        require(
            _tokenId == nextTokenId(_appId, id),
            "Invalid token ID"
        );

        require(
            _lastMintedById[_appId][id].timestamp == 0
            || _lastMintedById[_appId][id].timestamp > block.timestamp - minTimeBetweenMintingEvents,
            "Too early for new minting"
        );

        _mint(msg.sender, _tokenId, _supply, "");
        _lastMintedById[_appId][id] = Minted(_lastMintedById[_appId][id].tokenId + 1,  block.timestamp);
        _donate(_tokenId, _supply, _donations, _donees);
    }


    function _donate(
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


    function createBatch(
        uint _appId,
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        uint _timestamp,
        bytes memory _signature,
        uint[] memory _donations,
        address[] memory _donees
    ) external
    onlyValidSignature(_timestamp)
    {
        require(
            isSignedByOracle(keccak256(abi.encode(
                getChainId(),
                msg.sender,
                _appId,
                _tokenIds,
                _timestamp
            )), _signature),
            "Invalid signature"
        );

        uint id = store.idByAddress(_appId,msg.sender);

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
            _lastMintedById[_appId][id].timestamp == 0
            || _lastMintedById[_appId][id].timestamp > block.timestamp - minTimeBetweenMintingEvents,
            "Too early for new minting"
        );

        _mintBatch(msg.sender, _tokenIds, _supplies, "");
        _lastMintedById[_appId][id] = Minted(_lastMintedById[_appId][id].tokenId + _tokenIds.length,  block.timestamp);
        _donateBatch(_tokenIds, _supplies, _donations, _donees);

    }


    function _donateBatch(
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        uint[] memory _donations,
        address[] memory _donees
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
                uint[] memory amounts = getRations(_donations, i);
                safeBatchTransferFrom(msg.sender, _donees[i], _tokenIds, amounts, "");
            }
        }
    }

    function getRations(
        uint[] memory _donations,
        uint index
    ) internal pure
    returns (uint[] memory)
    {
        uint[] memory ratios = new uint[](_donations.length);

        for (uint i = 0; i < _donations.length; i++) {
            uint base = _donations[i] / _donations.length;
            uint remainder = _donations[i] % _donations.length;
            ratios[i] = base + (remainder > index ? 1 : 0);
        }
        return ratios;
    }


}
