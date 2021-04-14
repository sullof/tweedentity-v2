// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


interface ITweedentityTokenOptimized {

    function nextTokenId(
        uint _appId,
        uint _id
    ) external view
    returns (uint);

    function lastMintedById(
        uint _appId,
        uint _id
    ) external view
    returns (uint[2] memory);

    function mintToken(
        uint _appId,
        uint _tokenId,
        uint _supply,
        address _address
    ) external;

    function mintBatchToken(
        uint _appId,
        uint[] memory _tokenIds,
        uint[] memory _supplies,
        address _address
    ) external;

    function giveAway(
        address _donor,
        address _donee,
        uint _tokenId,
        uint _donation
    ) external;

    function giveBatchAway(
        address _donor,
        address _donee,
        uint[] memory _tokenIds,
        uint[] memory _donations
    ) external;

}
