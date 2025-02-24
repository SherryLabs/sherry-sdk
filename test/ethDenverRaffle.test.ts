import { describe, expect, it } from "@jest/globals";
import { Metadata } from "../src/interface/metadata";
import { BlockchainAction } from "../src/interface/blockchainAction";
import { createMetadata, helperValidateMetadata } from "../src/utils/helpers";

describe('ETH Denver Raffle Metadata', () => {
  it('should validate ETH Denver raffle metadata correctly', () => {
    const ethDenverMetadata: Metadata = {
      url: "https://sherry.social",
      icon: "https://kfrzkvoejzjkugwosqxx.supabase.co/storage/v1/object/public/images//ETHDevnerRaffle-Miniapp.png",
      title: "NFC Quest: Scan, Mint & Win at ETHDenver",
      description: "Found me at ETHDenver? Enter your wallet address to verify your POAP and join the $500 USDC raffle! Five winners will be selected",
      actions: [
        {
          label: "Join the Raffle",
          address: "0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b",
          abi: [
            // Solo incluimos las funciones relevantes para reducir el tamaño
            {
              inputs: [{ internalType: "address", name: "_user", type: "address" }],
              name: "checkAndRegister",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function"
            }
          ],
          functionName: "checkAndRegister",
          chains: { source: "fuji", destination: "alfajores" },
          paramsLabel: ["Your Address"],
          //paramsValue: ["sender"] // Añadimos paramsValue que faltaba
        }
      ]
    };

    // Validar la creación de metadata
    const validatedMetadata = createMetadata(ethDenverMetadata);
    expect(validatedMetadata.url).toBe(ethDenverMetadata.url);
    expect(validatedMetadata.title).toBe(ethDenverMetadata.title);
    expect(validatedMetadata.actions).toHaveLength(1);

    // Validar la acción específica
    const action = validatedMetadata.actions[0] as BlockchainAction;
    expect(action.label).toBe("Join the Raffle");
    expect(action.address).toBe("0xB7cfa4c519a8508900c02d21b6C8B5310f63D53b");
    expect(action.functionName).toBe("checkAndRegister");
    expect(action.blockchainActionType).toBe("nonpayable");

    // Validar usando helperValidateMetadata
    const validationResult = helperValidateMetadata(JSON.stringify(validatedMetadata));
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.type).toBe("ValidatedMetadata");
    
    // Verificar la estructura completa
    if (validationResult.data) {
      const data = validationResult.data;
      expect(data.url).toBe(ethDenverMetadata.url);
      expect(data.icon).toBe(ethDenverMetadata.icon);
      expect(data.title).toBe(ethDenverMetadata.title);
      expect(data.description).toBe(ethDenverMetadata.description);
      expect(data.actions).toHaveLength(1);
    }
  });
});
