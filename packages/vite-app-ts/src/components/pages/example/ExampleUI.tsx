import { SyncOutlined } from '@ant-design/icons';
import { formatEther, parseEther } from '@ethersproject/units';
import { Alert, Button, Card, DatePicker, Divider, Progress, Slider, Spin } from 'antd';
import { Address, AddressInput, Balance, EtherInput } from 'eth-components/ant';
import { TTransactorFunc } from 'eth-components/functions';
import { useContractReader } from 'eth-hooks';
import { EthersAppContext } from 'eth-hooks/context';
import { TEthersSigner } from 'eth-hooks/models';
import { BigNumber, ethers } from 'ethers';
import React, { FC, ReactElement, useContext, useState } from 'react';
import { Switch } from 'react-router-dom';
import { text } from 'stream/consumers';
import { useAppContracts } from '~~/components/contractContext';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { Diamond, DiamondCutFacet, YourContract } from '~~/generated/contract-types';
export interface IExampleProps {
  price: number;
  tx: TTransactorFunc;
  scaffoldAppProviders: IScaffoldAppProviders;

  yourContract: YourContract;
  diamond: Diamond;
  diamondCutFacet: DiamondCutFacet;
  yourLocalBalance: BigNumber;
  signer: TEthersSigner;
}
export const ExampleUI: FC<IExampleProps> = (props) => {
  const { price, scaffoldAppProviders, yourContract, diamond, tx, diamondCutFacet, yourLocalBalance, signer } = props;
  const [amount, setAmount] = useState<string>('0');
  const [facetAddress, setFacetAddress] = useState<string>('');
  const [action, setAction] = useState<number>();

  const data = yourContract.interface.encodeFunctionData('setPurpose', ['test2']);
  const dataGetPurpose = yourContract.interface.encodeFunctionData('getPurpose');
  const address = diamond.address;

  function handleActionChange(evt: any) {
    const action = evt.target.value.toLowerCase();
    console.log(action);
    let actionVal;
    if (action == 'add') {
      actionVal = 0;
    } else if (action == 'replace') {
      actionVal = 1;
    } else if (action == 'remove') {
      actionVal = 2;
    }
    setAction(actionVal);
  }
  return (
    <>
      <Alert
        message={'⚠️ Facet Deployment'}
        description={<div>Deploy the facet you want to upgrade through scaffold</div>}
        type="error"
        closable={false}
      />
      <a href="https://faucet.metamask.io/">
        <b>Get Ropsten ETH here</b>
      </a>
      <div style={{ border: '1px solid #cccccc', padding: 16, width: 400, margin: 'auto', marginTop: 64 }}>
        <h2>Zap with DeFi Facet</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <EtherInput
            price={price}
            value={amount ?? '0'}
            onChange={(value) => {
              setAmount(value);
            }}
          />
          <br />
          <br />
          <Button
            onClick={() => {
              /* look how you call setPurpose on your contract: */
              // console.log('amount ', amount);
              // const value = parseEther(amount);
              // console.log('value ', value);
              const transaction = {
                to: address,
                data: data,
                // value: parseEther(amount),
                // gasLimit: 40000,
              };
              console.log('transaction ', transaction);
              tx(signer.sendTransaction(transaction));
            }}>
            Set Purpose
          </Button>
          <Button
            onClick={async () => {
              /* look how you call setPurpose on your contract: */
              // console.log('amount ', amount);
              // const value = parseEther(amount);
              // console.log('value ', value);
              const transaction = {
                to: address,
                data: dataGetPurpose,
                // value: parseEther(amount),
                // gasLimit: 40000,
              };
              console.log('transaction ', transaction);
              const purposeHex = await diamond.signer.call(transaction);
              // const test = ethers.utils.isHexString(purpose);
              // convert hex to string
              const purpose = ethers.utils.toUtf8String(purposeHex);
              // console.log('test ', test);
              console.log('purpose ', purpose);
            }}>
            Get Purpose
          </Button>
        </div>
        <Divider />
        <h2>Upgrade Diamond Facet</h2>
        {/* upgrades the defi facet only currently for demo purposes */}
        <Divider />
        <div style={{ margin: 8 }}>
          <AddressInput
            autoFocus
            ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
            address={facetAddress}
            onChange={setFacetAddress}
          />
          <br />
          <h5>Select Upgrade Action</h5>
          <br />
          <select
            onChange={(env) => {
              handleActionChange(env);
            }}>
            <option>Select Action</option>
            <option>Add</option>
            <option>Replace</option>
            <option>Remove</option>
          </select>
          <br />
          <br />
          {facetAddress && (
            <Button
              onClick={() => {
                const signatures: string[] = [];
                Object.keys(yourContract.interface.functions).map((key) => {
                  signatures.push(yourContract.interface.getSighash(key));
                });
                console.log('signatures ', signatures);
                const diamondCutParams = [
                  { facetAddress: facetAddress, action: BigNumber.from(action), functionSelectors: signatures },
                ];
                /* look how you call setPurpose on your contract: */
                if (tx) {
                  tx(diamondCutFacet.diamondCut(diamondCutParams, '0x0000000000000000000000000000000000000000', '0x'));
                }
              }}>
              Upgrade
            </Button>
          )}
        </div>
        <Divider />
        Your Address:
        <Address address={address} ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider} fontSize={16} />
        <Divider />
        ENS Address Example:
        <Address
          address={'0x34aA3F359A9D614239015126635CE7732c18fDF3'} /* this will show as austingriffith.eth */
          ensProvider={scaffoldAppProviders.mainnetAdaptor?.provider}
          fontSize={16}
        />
        <Divider />
        {/* use formatEther to display a BigNumber: */}
        {/* <h2>Your Balance: {yourLocalBalance ? formatEther(yourLocalBalance) : '...'}</h2>
        OR
        <Balance address={address} dollarMultiplier={price} />
        <Divider /> */}
        {/* use formatEther to display a BigNumber: */}
        {/* <h2>Your Balance:{yourLocalBalance ? formatEther(yourLocalBalance) : '...'}</h2>
        <Divider /> */}
        {/* Your Contract Address:
        <Address
            value={readContracts?readContracts.YourContract.address:readContracts}
            ensProvider={mainnetProvider}
            fontSize={16}
        /> */}
        <Divider />
      </div>
      {/* <div style={{ width: 600, margin: 'auto', marginTop: 32, paddingBottom: 256 }}>
        <Card>
          Check out all the{''}
          <a
            href="https://github.com/austintgriffith/scaffold-eth/tree/master/packages/react-app/src/components"
            target="_blank"
            rel="noopener noreferrer">
            📦 components
          </a>
        </Card>
        <Card style={{ marginTop: 32 }}>
          <div>
            There are tons of generic components included from{' '}
            <a href="https://ant.design/components/overview/" target="_blank" rel="noopener noreferrer">
              🐜 ant.design
            </a>{' '}
            too!
          </div>

          <div style={{ marginTop: 8 }}>
            <Button type="primary">Buttons</Button>
          </div>

          <div style={{ marginTop: 8 }}>
            <SyncOutlined spin /> Icons
          </div>

          <div style={{ marginTop: 8 }}>
            Date Pickers?
            <div style={{ marginTop: 2 }}>
              <DatePicker onChange={() => {}} />
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <Slider range defaultValue={[20, 50]} onChange={() => {}} />
          </div>

          <div style={{ marginTop: 32 }}>
            <Switch />
          </div>

          <div style={{ marginTop: 32 }}>
            <Progress percent={50} status="active" />
          </div>

          <div style={{ marginTop: 32 }}>
            <Spin />
          </div>
        </Card>
      </div> */}
    </>
  );
};
