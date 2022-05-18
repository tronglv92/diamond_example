pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: MIT
contract YourContract {
  string purpose = "hello";

  function setPurpose(string memory _purpose) public {
    purpose = _purpose;
  }

  function getPurpose() public view returns (string memory) {
    return purpose;
  }

  // Fallback Functions for calldata and reciever for handling only ether transfer
  fallback() external payable {}

  receive() external payable {}
}
