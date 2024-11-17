import { BlockchainAction } from "./BlockchainAction";
import { Abi } from "abitype"

export type ActionType = "action" | "external-link";

export interface Metadata<
  T extends ActionType = "action",
  ContractABI extends Abi = Abi
> {
  type: T;
  icon: string;
  title: string;
  description: string;
  label: string;
  actions: BlockchainAction<ContractABI>[];
}