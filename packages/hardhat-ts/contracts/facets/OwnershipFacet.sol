pragma solidity >=0.8.0 <0.9.0;
pragma experimental ABIEncoderV2;
//SPDX-License-Identifier: MIT
import "../libraries/LibDiamond.sol";
import "../interfaces/IERC173.sol";

contract OwnershipFacet is IERC173 {
  function transferOwnership(address _newOwner) external override {
    LibDiamond.enforceIsContractOwner();
    LibDiamond.setContractOwner(_newOwner);
  }

  function owner() external view override returns (address owner_) {
    owner_ = LibDiamond.contractOwner();
  }
}
