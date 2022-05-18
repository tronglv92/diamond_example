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
      console.log('key ', key);
      signatures.push(contract.interface.getSighash(key));
    });

    console.log('signatures ', signatures);
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
  const yourContractTest = await ethers.getContract('YourContract', deployer);
  getSelectors(yourContractTest);
  const diamondCutFacet = await deploy('DiamondCutFacet', {
    from: deployer,
    log: true,
  });
  const diamondCutFacetContract = await ethers.getContract('DiamondCutFacet', deployer);
  getSelectors(diamondCutFacetContract);
  const diamondCutParams = [
    [diamondCutFacet.address, FacetCutAction.Add, ['0x1f931c1c']],
    [yourContract.address, FacetCutAction.Add, ['0xeb68757f', '0x84560625']],
  ];
  console.log('diamondCutParams ', diamondCutParams);
  await deploy('Diamond', {
    from: deployer,
    args: [diamondCutParams],
    log: true,
  });
  const diamondContract = await ethers.getContract('Diamond', deployer);
  getSelectors(diamondContract);
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
