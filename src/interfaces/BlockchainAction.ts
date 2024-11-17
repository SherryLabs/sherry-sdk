import { BlockchainParameter } from "./BlockchainParameter";
import { Abi, AbiFunction, AbiParametersToPrimitiveTypes, ExtractAbiFunctionNames, IsAbi } from "abitype";
import { AbiStateMutability, ExtractAbiFunctions, AbiParameter, ExtractAbiFunction } from "abitype";

export type ChainId = "ethereum" | "base" | "optimism" | "avalanche";

export interface BlockchainAction<ContractABI extends Abi> {
  label: string;
  contractAddress: `0x${string}`;
  contractABI: ContractABI;
  functionName: ExtractAbiFunctionNames<ContractABI>; // Validación estricta del nombre
  blockchainActionType: string;
  transactionParameters: AbiParameter[];
  chainId: ChainId;
  data?: any;
}

export interface BlockchainActionV2<
  ContractABI extends Abi, // El ABI específico
  FunctionName extends ExtractAbiFunctionNames<ContractABI>, // La función debe existir en el ABI
  StateMutability extends AbiStateMutability = AbiStateMutability // Opcionalmente restringimos mutabilidad
> {
  label: string; // Etiqueta para el botón o acción
  contractAddress: `0x${string}`; // Dirección del contrato
  contractABI: ContractABI; // ABI del contrato
  functionName: FunctionName; // Función validada contra el ABI
  blockchainActionType: "read" | "write"; // Tipo de acción
  transactionParameters: Extract<
    ExtractAbiFunctions<ContractABI, StateMutability>,
    { name: FunctionName }
  >["inputs"]; // Los parámetros se derivan automáticamente del ABI
  chainId: number; // ID de la cadena
  data?: any; // Información opcional adicional
}

const exampleAbi = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }],
  },
  {
    name: 'safeTransferFrom',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;


type IsExampleAbiValid = IsAbi<typeof exampleAbi>;

const invalidAction: BlockchainAction<typeof exampleAbi> = {
  label: "Invalid Action",
  contractAddress: "0x1234567890abcdef1234567890abcdef12345678",
  contractABI: exampleAbi,
  functionName: "balanceOf", // TypeScript debería marcar esto como error
  blockchainActionType: "read",
  transactionParameters: [],
  chainId: "ethereum",
  data: {}
};


declare function readContract<
  abi extends Abi,
  functionName extends ExtractAbiFunctionNames<abi, 'pure' | 'view'>,
  abiFunction extends AbiFunction = ExtractAbiFunction<abi, functionName>
>(
  config: {
    abi: abi;
    functionName: functionName | ExtractAbiFunctionNames<abi, 'pure' | 'view'>;
    args: AbiParametersToPrimitiveTypes<
      ExtractAbiFunction<abi, functionName>['inputs'],
      'inputs'
    >;
}): AbiParametersToPrimitiveTypes<abiFunction['outputs'], 'outputs'>

// Only Readable Actions
const res = readContract({
  abi: exampleAbi,
  functionName: 'balanceOf',
  args: ['0x'],
})




