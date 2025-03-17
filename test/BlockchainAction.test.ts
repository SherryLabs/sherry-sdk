import { describe, expect, it } from "@jest/globals";
import fetch from 'node-fetch';
import {
  BlockchainActionMetadata,
  BlockchainAction,
  TransferAction,
} from "../src/interface/blockchainAction";
import { Metadata, ValidatedMetadata } from "../src/interface/metadata";
import {
  getParameters,
  getAbiFunction,
  isValidFunction,
  validateActionParameters,
  getBlockchainActionType,
  createMetadata,
  isTransferAction,
  isBlockchainAction,
  isBlockchainActionMetadata,
  helperValidateMetadata
} from "../src/utils/helpers";
import { simpleAbi } from "./abi";

describe('BlockchainAction Functions', () => {
  const exampleAbi = simpleAbi

  const actionMetadata: BlockchainActionMetadata = {
    label: "Test Action",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    abi: exampleAbi,
    functionName: "balanceOf",
    paramsValue: ["0x1234567890abcdef1234567890abcdef12345678"],
    chains: { source: "fuji" },
  };


  it('should get parameters of a function', () => {
    const parameters = getParameters(actionMetadata);
    expect(parameters).toEqual([{ name: 'owner', type: 'address' }]);
  });

  it('should get the ABI function', () => {
    const abiFunction = getAbiFunction(exampleAbi, "balanceOf");
    expect(abiFunction).toEqual({
      name: 'balanceOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'owner', type: 'address' }],
      outputs: [{ name: 'balance', type: 'uint256' }],
    });
  });

  it('should validate if a function exists in the ABI', () => {
    const isValid = isValidFunction(exampleAbi, "balanceOf");
    expect(isValid).toBe(true);

    const isInvalid = isValidFunction(exampleAbi, "nonExistentFunction");
    expect(isInvalid).toBe(false);
  });

  it('should validate action parameters', () => {
    const action: BlockchainAction = {
      ...actionMetadata,
      params: [{ type: 'address' }],
      blockchainActionType: 'view',
    };

    const isValid = validateActionParameters(action);
    expect(isValid).toBe(true);

    const invalidAction: BlockchainAction = {
      ...actionMetadata,
      params: [],
      blockchainActionType: 'view',
    };
    const isInvalid = validateActionParameters(invalidAction);
    expect(isInvalid).toBe(false);
  });

  it('should get the blockchain action type', () => {
    const actionType = getBlockchainActionType(actionMetadata);
    expect(actionType).toBe('view');
  });

});

describe('Metadata Functions', () => {
  it('should return and false when metadata is invalid', () => {
    const metadataEleven: Metadata = {
      url: "google.com",
      icon: "https://ipfs.io/ipfs/bafybeifto4kwihaup53m5pzi4g7iuypm3oajj4rdcm6gywjvfcaqdh3zsm/10.png",
      title: "Sparkling Connector Token",
      description: "Mint a special NFT for Javier Salomon, who connects communities with the sparkle of Christmas.",
      actions: [
        {
          label: "NOT MINT",
          address: '0x1234567890abcdef1234567890abcdef12345678',
          abi: [],
          functionName: "mint",
          chains: { source: "fuji" },
          paramsValue: [0, "sender"],
          paramsLabel: ["ID", "To"] // Si hay paramsLabel me da error
        }
      ]
    };

    expect(isTransferAction(metadataEleven.actions[0])).toBe(false);
    expect(isBlockchainActionMetadata(metadataEleven.actions[0])).toBe(true);
  })

  it('should return metadata formatted', async() => {
    const actions: TransferAction[] = [
      {
        label: "0.01 AVAX",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 0.01,
        chains: { source: "avalanche" },
      },
      {
        label: "1 AVAX",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chains: { source: "avalanche" },
      },
      {
        label: "SENT",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 1,
        chains: { source: "avalanche" },
      },
      {
        label: "Test Action",
        chains: { source: "avalanche" },
        to: "0x1234567890abcdef1234567890abcdef12345678",
        amount: 1000000000000000000,
      }
    ]

    const metadata: Metadata = {
      url: "google.com",
      icon: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExM21kajk5ODVzMmV2bXUzNzN5dGluMWJsejNtN2ptejBqYnhxcjByZSZlcD12MV9pbnRlcm5naWZfYnlfaWQmY3Q9Zw/5phvgzYzpqFL2N1lav/giphy.gif",
      title: "Sent me a tip",
      description: "Send me a tip to show your appreciation for my work",
      actions: actions
    };

    const formattedMetadata: ValidatedMetadata = {
      url: metadata.url,
      icon: metadata.icon,
      title: metadata.title,
      description: metadata.description,
      actions: actions
    };

    const m = createMetadata(metadata);
    expect(m).toEqual(formattedMetadata);

    // Primero validamos que la metadata local sea correcta
    const localMetadataString = JSON.stringify(metadata);
    //console.log("Local metadata validation:");
    const localValidation = helperValidateMetadata(localMetadataString);
    expect(localValidation.isValid).toBe(true);

    // Luego hacemos el fetch de Algun endpoint Valido
    // Descomentar esto para probar la validación de la metadata de un endpoint
    /*
    const response = await fetch('http://localhost:3000/api/examples/poap', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    */
    
    //const jsonResponse = await response.json(); // jsonResponse es ya un objeto JavaScript
  
  
    // Validamos que la respuesta tenga la estructura correcta  
    expect(m).toHaveProperty('url');
    expect(m).toHaveProperty('actions');
    
    // Solo convertimos a string si helperValidateMetadata lo requiere
    //const apiValidation = helperValidateMetadata(JSON.stringify(localValidation));

    // Verificaciones más específicas    
    if (!localValidation.isValid) {
      console.error("Validation errors:", localValidation)
    }

    expect(localValidation.isValid).toBe(true);    
    expect(localValidation.type).toBe("ValidatedMetadata");
    expect(localValidation.data).toBeDefined();
  });

  it('should validate transfer actions correctly', () => {
    const actionsTransfer: TransferAction[] = [
      {
        label: "0.01 CELO",
        to: "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24",
        amount: 0.01,
        chains: { source: "fuji", destination: "alfajores" },
      },
      // ...existing code...
    ];

    // Esto debería retornar true
    expect(isTransferAction(actionsTransfer[0])).toBe(true);
    expect(isBlockchainAction(actionsTransfer[0])).toBe(false); // Esto es falso porque no es un BlockchainAction
  });

})