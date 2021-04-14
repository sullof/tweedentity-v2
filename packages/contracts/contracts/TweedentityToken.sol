// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TweedentityToken
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Tweedentity Semi-fungible & Identity Token
 */


import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import "./Managed.sol";
import "./StoreCaller.sol";


contract TweedentityToken is ERC1155, Managed, StoreCaller {

    uint constant public maxNumberOfChains = 100;
    uint constant public maxMintingEvents = 1000;

    // There is no way to validate this on chain.
    uint public chainProgressiveId;

    constructor(
        address _manager,
        string memory _uri,
        uint _chainProgressiveId,
        address _store
    )
    ERC1155(_uri)
    Managed(_manager)
    StoreCaller(_store)
    {
        require(
            _chainProgressiveId < maxNumberOfChains,
            "_chainProgressiveId must be < 100"
        );
        chainProgressiveId = _chainProgressiveId;
    }


    mapping(uint => mapping(uint => uint[2])) private _lastMintedById;


    function nextTokenId(
        uint _appId,
        uint _id
    ) public view
    returns (uint)
    {
        uint tokenId = _id * maxNumberOfChains * store.maxNumberOfApps() * maxMintingEvents
        + chainProgressiveId * store.maxNumberOfApps() * maxMintingEvents
        + _appId * maxMintingEvents
        + _lastMintedById[_appId][_id][0]
        + 1;
        return tokenId;
    }


    function lastMintedById(
        uint _appId,
        uint _id
    ) external view
    returns (uint[2] memory)
    {
        return _lastMintedById[_appId][_id];
    }


    function mintToken(
        uint _appId,
        uint _tokenId,
        uint _supply,
        address _address,
        bytes memory data
    ) external
    onlyManager
    {
        uint id = store.idByAddress(_appId, _address);
        require(
            id != 0,
            "Identity not found"
        );
        require(
            _tokenId == nextTokenId(_appId, id),
            "Invalid token ID"
        );
        _mint(_address, _tokenId, _supply, data);
        _lastMintedById[_appId][id][0]++;
        _lastMintedById[_appId][id][1] = block.timestamp;
    }

    function giveAway(
        address _donor,
        address _donee,
        uint _tokenId,
        uint _donation
    ) external
    onlyManager
    {
        safeTransferFrom(_donor, _donee, _tokenId, _donation, "");
    }


    function mintBatchToken(
        uint _appId,
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        address _address
    ) external
    onlyManager
    {
        uint id = store.idByAddress(_appId, _address);
        require(
            id != 0,
            "Identity not found"
        );
        require(
            _tokenIds.length == _supplies.length,
            "Arrays' lengths are inconsistent"
        );
        for (uint i = 0; i < _tokenIds.length; i++) {
            require(
                _tokenIds[i] == nextTokenId(_appId, id) + i,
                "Invalid token ID"
            );
        }

        _mintBatch(_address, _tokenIds, _supplies, "");
        _lastMintedById[_appId][id][0] += _tokenIds.length;
        _lastMintedById[_appId][id][1] = block.timestamp;

    }

    function giveBatchAway(
        address _donor,
        address _donee,
        uint[] memory _tokenIds,
        uint[] memory _donations
    ) external
    onlyManager
    {
        safeBatchTransferFrom(_donor, _donee, _tokenIds, _donations, "");
    }


}
