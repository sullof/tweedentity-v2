// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Datastore
 * @version 2.0.0
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev Key/value store for identities
 */

import "@openzeppelin/contracts/access/Ownable.sol";

contract Datastore is Ownable{

    string public versionStr = "2.0.0";

    struct App {
        string nickname;
        bool hashPureNumberId;
    }
    // if the app's user id is not numeric, it must be converted to a big integer
    // before triggering the Tweedentity smart contract
    // Javascript example:
    /*
function fromStringToIntegerString(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
  let result = ''
  for (let i = 0; i < str.length; i++) {
    let pos = alphabet.indexOf(str[i])
    if (!pos === -1) {
      throw new Error()
    }
    if (pos < 10) {
      pos = `0${pos}`
    }
    result += pos
  }
  return result
}
assert(fromStringToIntegerString('ax2B2') == '2649540154')
    */

    uint internal lastAppId;
    uint public maxNumberOfApps = 100;
    mapping(uint => App) public apps;
    mapping(uint => mapping(bytes32 => address)) public addressById;
    mapping(uint => mapping(address => bytes32)) public idByAddress;
    mapping(uint => uint) public totalIdentities;

    // events

    event AppAdded(uint indexed id, string indexed nickname);

    // modifiers

    modifier onlyNotNullAddress(address _address) {
        require(_address != address(0), "Null address");
        _;
    }

    modifier onlySupportedApp(uint _appId) {
        require(bytes(apps[_appId].nickname).length > 0, "Unsupported app");
        _;
    }

    modifier onlyNotAlreadySet(uint _appId, address _address, bytes32 _id) {
        require(idByAddress[_appId][_address] == 0, "Data found for address");
        require(addressById[_appId][_id] == address(0), "Data found for id");
        _;
    }

    modifier onlyAlreadySet(uint _appId, address _address) {
        require(idByAddress[_appId][_address] != 0, "Data not found for msg.sender");
        _;
    }

    modifier onlyAddressNotAlreadySet(uint _appId, address _address) {
        require(idByAddress[_appId][_address] == 0, "Data found for address");
        _;
    }

    //

    constructor() {
        addApp("twitter", true);
        addApp("reddit", false);
    }

    function addApp(string memory _appNickname, bool _pureNumber) public
    onlyOwner
    {
        require(bytes(_appNickname).length > 0, "Empty nickname");
        require(lastAppId < maxNumberOfApps, "New apps not allowed");
        lastAppId++;
        apps[lastAppId] = App(_appNickname, _pureNumber);
        emit AppAdded(lastAppId, _appNickname);
    }

    /**
     * @dev Sets some unique data
     * @param _address The address of the wallet
     * @param _id The user-id of the owner user account
     */
    function setAddressAndIdByAppId(uint _appId, address _address, bytes32 _id) internal
    {
        idByAddress[_appId][_address] = _id;
        addressById[_appId][_id] = _address;
        totalIdentities[_appId]++;
    }


    /**
     * @dev Sets some unique data
     * @param _address The new address of the wallet
     */
    function updateAddressByAppId(uint _appId, address _address) internal
    {
        bytes32 id = idByAddress[_appId][msg.sender];
        idByAddress[_appId][_address] = id;
        addressById[_appId][id] = _address;
        delete idByAddress[_appId][msg.sender];
    }

}
