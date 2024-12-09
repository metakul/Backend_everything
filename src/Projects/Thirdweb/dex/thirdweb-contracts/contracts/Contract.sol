// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract MyContract {
    constructor() {}

 function myName() public view returns (address) {
    return address(this);
}
}