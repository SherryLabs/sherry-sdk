---
# filepath: /Users/gilbertsahumada/projects/sherry-sdk/docs/docs/sdk/examples.md
sidebar_position: 8
---

# Examples

The SDK includes several practical examples demonstrating how to define different types of mini-apps and actions. You can find the complete source code in the `src/examples` directory of the SDK repository.

## Single Action Mini-Apps

These examples show how to create mini-apps with individual blockchain or transfer actions.

-   **`src/examples/example-miniapps.ts`**:
    -   `tokenSwapMiniApp`: Token swap using a Uniswap-like router (includes approval).
    -   `nftMarketplaceMiniApp`: List, buy, and cancel NFT listings.
    -   `daoVotingMiniApp`: Create proposals, vote, and execute them in a DAO.
    -   `fundraisingMiniApp`: Create fundraising campaigns, donate, and claim funds.
    -   `marketCreationMiniApp`: Complex example of market creation (may require special struct handling).
    -   `bridgeMiniApp`: Cross-chain token bridge using a blockchain action.
    -   `simpleTransferMiniApp`: Basic examples of `TransferAction`.

-   **`src/examples/transfer-miniapps.ts`**:
    -   `simpleDonationMiniApp`: Transfers with fixed values.
    -   `charityDonationMiniApp`: Transfer with recipient selection (`recipient`).
    -   `tippingMiniApp`: Transfer with amount selection (`amountConfig`).
    -   `crossChainTransferMiniApp`: Transfers between different blockchains.
    -   `paymentSplittingMiniApp`: Multiple transfers to split a payment.

## Mixed Action Mini-App

-   **`src/examples/mixed-miniapp.ts`**:
    -   `mixedActionMiniApp`: Combines `HttpAction`, `TransferAction`, and `BlockchainAction` in a single mini-app.

## Nested Action Flows (`ActionFlow`)

These examples demonstrate how to build multi-step processes.

-   **`src/examples/nested-actions.ts`**:
    -   `onboardingFlowApp`: Welcome flow with HTTP form and NFT mint.
    -   `defiSwapFlowApp`: DeFi swap flow with approval (`blockchain`), confirmation (`decision`), and swap (`blockchain`).
    -   `governanceFlowApp`: Complete DAO governance flow (action selection, proposal creation, voting, execution).

## Usage in Tests

You can also see how this `Metadata` is used and validated in the test files within the `tests/` directory, especially in `tests/examples/`.

These examples are an excellent starting point for understanding how to structure your own `Metadata` and utilize the different features of the SDK.