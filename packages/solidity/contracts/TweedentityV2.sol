// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./Claimable.sol";

contract TweedentityV2
is
ERC1155,
Claimable
{

    address internal _organization;

    event OrganizationUpdated(
        address organization,
        uint256 updatedAt
    );

    constructor(
        address oracle,
        uint256 waitingTime,
        address organization
    )
    ERC1155(
        "https://store.tweedentity.com/metadata/{id}.json"
    )
    Claimable(
        oracle,
        waitingTime
    )
    {
        _organization = organization;
    }

    function updateOrganization(
        address organization
    )
    onlyOwner
    external
    {
        _organization = organization;
        emit OrganizationUpdated(_organization, block.timestamp);
    }

    function mintToken(
        uint256 id,
        uint256 supply,
        bytes memory data
    )
    external
    {
        require(_ids[msg.sender] == id, "Forbidden");
        require(supply <= 1000);
        _mint(msg.sender, id, supply, data);
        uint256 fee = supply / 100;
        if (fee == 0) {
            fee = 1;
        }
        safeTransferFrom(msg.sender, _organization, id, fee, data);
    }

}
