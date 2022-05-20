import { getContractAddress } from '@ethersproject/address';
import { Alert, Button, Card, DatePicker, Divider, Input, notification, Progress, Slider, Spin } from 'antd';
import { Address, AddressInput, Balance, EtherInput } from 'eth-components/ant';
import { NotificationMessage, TRawTxError, TTransactorFunc } from 'eth-components/functions';

import { TEthersSigner } from 'eth-hooks/models';
import { BigNumber, Contract, ethers } from 'ethers';
import React, { FC, ReactElement, useContext, useState } from 'react';

import * as hardhatContracts from '~~/generated/contract-types';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { Diamond, DiamondCutFacet, YourContract, DiamondLoupeFacet } from '~~/generated/contract-types';

export interface IExampleProps {
  price: number;
  tx: TTransactorFunc;
  scaffoldAppProviders: IScaffoldAppProviders;

  yourContract: YourContract;
  diamondLoupeFacet: DiamondLoupeFacet;
  diamond: Diamond;
  diamondCutFacet: DiamondCutFacet;
  yourLocalBalance: BigNumber;
  signer: TEthersSigner;
}
export const ExampleUI: FC<IExampleProps> = (props) => {
  const {
    price,
    scaffoldAppProviders,
    yourContract,
    diamond,
    tx,
    diamondCutFacet,
    yourLocalBalance,
    signer,
    diamondLoupeFacet,
  } = props;
  const [purpose, setPurpose] = useState<string>('');
  const [facetAddress, setFacetAddress] = useState<string>('');
  const [action, setAction] = useState<number>();
  const [countAddresses, setCountAddresses] = useState<number>(0);
  const [purposeResult, setPurposeResult] = useState<string>('');
  const dataGetPurpose = yourContract.interface.encodeFunctionData('getPurpose');
  const facetAddresses = diamondLoupeFacet.interface.encodeFunctionData('facetAddresses');
  const address = diamond.address;

  const diamondLoupeFacetContract = new ethers.Contract(diamond?.address, diamondLoupeFacet.interface, signer);
  const diamondCutFacetContract = new ethers.Contract(diamond?.address, diamondCutFacet.interface, signer);
  const yourContractContract = new ethers.Contract(diamond?.address, yourContract.interface, signer);
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
        <h2>Address facet</h2>
        <Divider />
        <div style={{ margin: 8, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 8 }}>Count addresses: {countAddresses} </div>
          <Button
            onClick={async () => {
              const facetAddresses = await diamondLoupeFacetContract.facetAddresses();

              console.log('facet addresses ', facetAddresses);
              setCountAddresses(facetAddresses.length);
            }}>
            Get Address
          </Button>
        </div>
        <Divider />
        <h2>Zap with DeFi Facet</h2>
        <Divider />
        <div style={{ margin: 8 }}>
          <Input
            onChange={(e) => {
              setPurpose(e.target.value);
            }}
            value={purpose}
          />

          <br />
          <br />
          <Button
            onClick={() => {
              console.log('purpose ', purpose);

              tx(yourContractContract.setPurpose(purpose));
            }}>
            Set Purpose
          </Button>
          <Button
            onClick={async () => {
              try {
                const purpose = await yourContractContract.getPurpose();
                // setPurposeResult(purpose);
                console.log('purpose ', purpose);
              } catch (e) {
                const err = e as TRawTxError;
                const msgTitle = err.cause ? err.cause.message : 'Transaction Error';
                const msgDescriptionContent = err?.data?.message ?? err.message;
                let notificationMessage: NotificationMessage = {
                  message: msgTitle,
                  description: msgDescriptionContent,
                };
                const revertedWithReason = new RegExp(/reverted with reason string \'(.*?)\'/).exec(
                  msgDescriptionContent
                );
                if (revertedWithReason && revertedWithReason.length > 0) {
                  notificationMessage.description = revertedWithReason[1];
                }

                notification.error(notificationMessage);
              }
            }}>
            Get Purpose
          </Button>
          <br />
          <br />
          <div>Purpose: {purposeResult}</div>
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
                  tx(
                    diamondCutFacetContract.diamondCut(
                      diamondCutParams,
                      '0x0000000000000000000000000000000000000000',
                      '0x'
                    )
                  );
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
        <Divider />
      </div>
    </>
  );
};
