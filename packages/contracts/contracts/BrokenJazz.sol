// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Author: Francesco Sullo <francesco@sullo.co>
// BrokenJazz website: https://brokenjazz.cc

contract BrokenJazz is
ERC721URIStorage,
Ownable
{

    event ClaimerApproved(address indexed claimer, uint256 indexed tokenId);

    mapping(uint256 => address) public approvedClaimers;

    modifier validTokenURI(string memory tokenURI) {
        bytes memory tokenURIBytes = bytes(tokenURI);
        require(tokenURIBytes.length == 53, "BrokenJazz: invalid tokenURI");
        _;
    }

    constructor(string memory tokenName, string memory symbol)
    ERC721(tokenName, symbol){
    }

    function approveClaimer(address claimer, uint256 tokenId)
    public
    onlyOwner
    {
        require(claimer != address(0), "BrokenJazz: address 0?");
        require(!_exists(tokenId), "BrokenJazz: token already minted");
        approvedClaimers[tokenId] = claimer;
        ClaimerApproved(claimer, tokenId);
    }

    function claimToken(uint256 tokenId, string memory tokenURI)
    public
    validTokenURI(tokenURI)
    returns (uint256)
    {
        require(approvedClaimers[tokenId] == msg.sender, "BrokenJazz: not approved");
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function awardToken(address addr, uint256 tokenId, string memory tokenURI)
    public
    onlyOwner
    validTokenURI(tokenURI)
    returns (uint256)
    {
        _mint(addr, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

}
