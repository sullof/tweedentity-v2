// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TweedentityToken
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Tweedentity Semi-fungible & Identity Token
 */


import "./Signable.sol";
import "./ITweedentityTokenOptimized.sol";
import "./StoreCaller.sol";

contract TweedentityFactory is Signable, StoreCaller {

    ITweedentityTokenOptimized public token;

    event DoneeUpdated(address indexed _donee);
    event MaxSupplyUpdated(uint _maxSupply);
    event MaxTokensByMintUpdated(uint _maxTokensByMint);
    event MinTimeBetweenMintingEventsUpdated(uint _minTimeBetweenMintingEvents);

    address public donee;

    uint public maxSupply = 1000;
    uint public minTimeBetweenMintingEvents = 1 days;
    uint public maxTokensByMint = 10;

    struct NextMintedEvent {
        uint id;
        uint timestamp;
    }

    mapping(uint => NextMintedEvent) public nextMintedById;

    struct LastMinted {
        uint tokenId;
        uint timestamp;
    }


    constructor(
        address _oracle,
        address _donee,
        address _store,
        address _token
    )
    Signable(_oracle)
    StoreCaller(_store)
    {
        donee = _donee;
        token = ITweedentityTokenOptimized(_token);
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


    function mintSingleToken(
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
        require(
            _supply > 0 && _supply <= maxSupply,
            "Invalid supply"
        );

        uint id = store.idByAddress(_appId, msg.sender);

        require(
            id != 0,
            "Identity not found"
        );

        uint[2] memory lastMintedById = token.lastMintedById(_appId, id);

        require(
            lastMintedById[1] == 0
            || lastMintedById[1] > block.timestamp - minTimeBetweenMintingEvents,
            "Too early for new minting"
        );

        token.mintToken(_appId, _tokenId, _supply, msg.sender);
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
                token.giveAway(msg.sender, _donees[i], _tokenId, _donations[i]);
            }
        }
    }


    function mintManyTokens(
        uint _appId,
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        uint[] memory _donations,
        address[] memory _donees,
        uint _timestamp,
        bytes memory _signature
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
        }

        uint[2] memory lastMintedById = token.lastMintedById(_appId, id);

        require(
            lastMintedById[1] == 0
            || lastMintedById[1] > block.timestamp - minTimeBetweenMintingEvents,
            "Too early for new minting"
        );

        token.mintBatchToken(_appId, _tokenIds, _supplies, msg.sender);
        _makeBatchDonations(_tokenIds, _supplies, _donations, _donees);

    }

    function _makeBatchDonations(
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
                token.giveBatchAway(msg.sender, _donees[i], _tokenIds, amounts);
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
