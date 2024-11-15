import { BlockchainAction } from "./BlockchainAction";

export type ActionType = "action" | "external-link";

export interface Metadata<T extends ActionType = "action"> {
  type: T;
  icon: string;
  title: string;
  description: string;
  label: string;
  actions: BlockchainAction[];
}