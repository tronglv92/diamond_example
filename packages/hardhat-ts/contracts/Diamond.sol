pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

/******************************************************************************\
* Author: Nick Mudge
*
* Implementation of an example of a diamond.
/******************************************************************************/
import "hardhat/console.sol";
import "./libraries/LibDiamond.sol";
import "./interfaces/IDiamondLoupe.sol";
import "./interfaces/IDiamondCut.sol";
import "./interfaces/IERC173.sol";
import "./interfaces/IERC165.sol";

contract Diamond {
  // more arguments are added to this struct
  // this avoids stack too deep errors

  constructor(address _contractOwner, address _diamondCutFacet) payable {
    LibDiamond.setContractOwner(_contractOwner);

    // Add the diamondCut external function from the diamondCutFacet
    IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](1);
    bytes4[] memory functionSelectors = new bytes4[](1);
    functionSelectors[0] = IDiamondCut.diamondCut.selector;
    cut[0] = IDiamondCut.FacetCut({ facetAddress: _diamondCutFacet, action: IDiamondCut.FacetCutAction.Add, functionSelectors: functionSelectors });
    LibDiamond.diamondCut(cut, address(0), "");
    // LibDiamond.diamondCut(_diamondCut, address(0), new bytes(0));
    // LibDiamond.setContractOwner(msg.sender);

    LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
    ds.supportedInterfaces[type(IERC165).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
    ds.supportedInterfaces[type(IERC173).interfaceId] = true;
  }

  // Find facet for function that is called and execute the
  // function if a facet is found and return any value.
  fallback() external payable {
    console.log("fallback");
    LibDiamond.DiamondStorage storage ds;
    bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
    assembly {
      ds.slot := position
    }
    console.logBytes4(msg.sig);
    address facet = address(bytes20(ds.facets[msg.sig]));

    require(facet != address(0), "Diamond: Function does not exist");

    assembly {
      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }

  receive() external payable {
    console.log("receive");
  }
}
