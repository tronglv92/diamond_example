import '../helpers/hardhat-imports';
import './helpers/chai-imports';
import { getSelectors, FacetCutAction } from './helpers/diamond';
import { expect } from 'chai';
import {
  DiamondCutFacet__factory,
  Diamond__factory,
  DiamondLoupeFacet__factory,
  OwnershipFacet__factory,
  DiamondCutFacet,
  Diamond,
  DiamondLoupeFacet,
  OwnershipFacet,
  Test1Facet,
  Test2Facet,
  IDiamondCut,
} from 'generated/contract-types';
import hre, { ethers } from 'hardhat';
import { getHardhatSigners } from 'tasks/functions/accounts';

import { YourContract } from '../generated/contract-types/YourContract';

import { Contract } from 'ethers';

describe('Diamond', function () {
  let yourContract: YourContract;
  let diamond: Contract;
  let diamondCutFacet: Contract;
  let diamondLoupeFacet: Contract;
  let ownershipFacet: Contract;
  let test1Facet: Test1Facet;
  let test2Facet: Test2Facet;
  const addresses = [];
  before(async () => {
    const { deployer } = await getHardhatSigners(hre);
    const accounts = await ethers.getSigners();
    const contractOwner = accounts[0];
    // deploy DiamondCutFacet
    const DiamondCutFacet = await ethers.getContractFactory('DiamondCutFacet');
    diamondCutFacet = await DiamondCutFacet.deploy();
    await diamondCutFacet.deployed();
    console.log('DiamondCutFacet deployed:', diamondCutFacet.address);

    // deploy Diamond
    const Diamond = await ethers.getContractFactory('Diamond');
    const diamond = await Diamond.deploy(contractOwner.address, diamondCutFacet.address);
    await diamond.deployed();

    console.log('Diamond deployed:', diamond.address);

    const FacetNames = ['DiamondLoupeFacet', 'OwnershipFacet'];
    const cut = [];
    for (const FacetName of FacetNames) {
      const Facet = await ethers.getContractFactory(FacetName);
      const facet = await Facet.deploy();
      await facet.deployed();
      console.log(`${FacetName} deployed: ${facet.address}`);
      cut.push({
        facetAddress: facet.address,
        action: FacetCutAction.Add,
        functionSelectors: getSelectors(facet),
      });
    }

    // const DiamondLoupeFacet = await ethers.getContractFactory('DiamondLoupeFacet');
    // diamondLoupeFacet = await DiamondLoupeFacet.deploy();
    // const cut = [];

    // cut.push({
    //   facetAddress: diamondLoupeFacet.address,
    //   action: FacetCutAction.Add,
    //   functionSelectors: getSelectors(diamondLoupeFacet),
    // });

    // const OwnershipFacet = await ethers.getContractFactory('OwnershipFacet');
    // ownershipFacet = await OwnershipFacet.deploy();

    // cut.push({
    //   facetAddress: ownershipFacet.address,
    //   action: FacetCutAction.Add,
    //   functionSelectors: getSelectors(ownershipFacet),
    // });

    // upgrade diamond with facets
    console.log('');
    console.log('Diamond Cut:', cut);
    const diamondCut = await ethers.getContractAt('IDiamondCut', diamond.address);
    let tx;
    let receipt;
    tx = await diamondCut.diamondCut(cut, '0x0000000000000000000000000000000000000000', '0x');
    diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamond.address);
    diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamond.address);
    ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamond.address);
  });

  // beforeEach(async () => {
  //   // put stuff you need to run before each test here
  // });

  it("Should return the new purpose once it's changed", async function () {
    for (const address of await diamondLoupeFacet.facetAddresses()) {
      addresses.push(address);
    }
    console.log('addresses ', addresses.length);
    expect(addresses.length).to.equal(3);
    // assert.equal(addresses.length, 3);
    // assert.equal(addresses.length, 3);
    // await yourContract.deployed();
    // expect(await yourContract.purpose()).to.equal('Building Unstoppable Apps!!!');

    // const newPurpose = 'Hola, mundo!';
    // await yourContract.setPurpose(newPurpose);
    // expect(await yourContract.purpose()).to.equal(newPurpose);
  });
});
