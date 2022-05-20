import { Contract } from 'ethers';
import { ethers, waffle } from 'hardhat';
import { DeployFunction, DeployResult } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
  };

  // loi tra ve undefind
  function getSelectors(contract: Contract) {
    const signatures: string[] = [];
    Object.keys(contract.interface.functions).map((key) => {
      signatures.push(contract.interface.getSighash(key));
    });

    return signatures;
  }

  // const defiFacet = await deploy('DeFiFacet', {
  //   from: deployer,
  //   log: true,
  // });

  // const defiContract = await ethers.getContract('DeFiFacet', deployer);
  // getSelectors(defiContract);

  const yourContract = await deploy('YourContract', {
    from: deployer,
    log: true,
  });
  // const yourContractTest = await ethers.getContract('YourContract', deployer);
  // getSelectors(yourContractTest);
  const DiamondCutFacet = await deploy('DiamondCutFacet', {
    from: deployer,
    log: true,
  });

  const Diamond = await deploy('Diamond', {
    from: deployer,
    args: [deployer, DiamondCutFacet.address],
    log: true,
  });
  const FacetNames = ['DiamondLoupeFacet', 'OwnershipFacet'];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await deploy(FacetName, {
      from: deployer,
      log: true,
    });
    const facet = await ethers.getContract(FacetName, deployer);

    cut.push({
      facetAddress: Facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }
  console.log('cut ', cut);
  const diamondCut = await ethers.getContractAt('IDiamondCut', Diamond.address);
  await diamondCut.diamondCut(cut, '0x0000000000000000000000000000000000000000', '0x');

  const diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', Diamond.address);
  const address = await diamondLoupeFacet.facetAddresses();
  console.log('address ', address);
  // const provider = waffle.provider;
  // const balanceInWei = await provider.getBalance(diamondCutFacet.address);
  // console.log('balanceInWei ', balanceInWei);
  // await deploy('YourContract', {
  //   // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
  //   from: deployer,
  //   // args: ["Hello"],
  //   log: true,
  // });

  // // Getting a previously deployed contract
  // const YourContract = await ethers.getContract('YourContract', deployer);
  // await YourContract.setPurpose('Hello');

  //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
};
export default func;
func.tags = ['DeFiFacet'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
