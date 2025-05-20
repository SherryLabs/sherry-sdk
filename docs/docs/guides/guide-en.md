# Guide English - to Create Mini-Apps with Sherry SDK and Next.js

This guide details the step-by-step process for creating mini-applications (mini-apps) using the Sherry Links SDK within a Next.js application, allowing you to expose action metadata and manage its execution.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [GET Endpoint Implementation](#get-endpoint-implementation)
- [POST Endpoint Implementation](#post-endpoint-implementation)
- [CORS Handling](#cors-handling)
- [Testing the Mini-App](#testing-the-mini-app)
- [Production Deployment](#production-deployment)
- [Supported Parameter Types](#supported-parameter-types)

## Prerequisites

- Node.js (version 18.x or higher recommended)
- npm, yarn, or pnpm
- Basic knowledge of Next.js and TypeScript
- Basic knowledge of blockchain (chains, transactions)

## Project Setup

### 1. Create a new Next.js project

```bash
npx create-next-app@latest sherry-miniapp --typescript --eslint --tailwind --src-dir --app --import-alias "@/*"
cd sherry-miniapp
```

### 2. Install necessary dependencies

```bash
npm install @sherrylinks/sdk viem wagmi
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## GET Endpoint Implementation

The GET endpoint is responsible for exposing the mini-app metadata, which will be used by Sherry Links platforms to display information about the action.

### 1. Create the directory structure

```
mkdir -p app/api/example
```

### 2. Create the route file

Create the `app/api/example/route.ts` file with the following content:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { avalancheFuji } from 'viem/chains';
import { createMetadata, Metadata, ValidatedMetadata } from '@sherrylinks/sdk';

export async function GET(_req: NextRequest, _res: NextResponse) {
  // Contract address - must match the address in the POST endpoint
  const CONTRACT_ADDRESS = '0xYourContractAddressHere';

  try {
    // Create the metadata object step by step
    const metadata: Metadata = {
      // ----- General properties of the mini-app -----

      // Complete URL to access the metadata
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/dynamic-action`,

      // URL of the icon to display for the mini-app
      icon: 'https://avatars.githubusercontent.com/u/117962315',

      // Title of the mini-app that will appear in the interface
      title: 'Timestamped Message',

      // Base URL for API calls
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',

      // Detailed description of what the mini-app does
      description: 'Store a message with an optimized timestamp calculated by our algorithm',

      // ----- Definition of available actions -----
      actions: [
        {
          // Action type: 'dynamic' indicates it will be executed with an endpoint call
          type: 'dynamic',

          // Text that will be displayed on the action button
          label: 'Store Message',

          // Detailed description of what this specific action does
          description: 'Store your message with a custom timestamp calculated for optimal storage',

          // Blockchain chains compatible with the action
          chains: {
            source: 'fuji', // Source chain (Avalanche Fuji)
          },

          // Path of the POST endpoint that will process this action
          path: `/api/example`,

          // ----- Parameters needed for the action -----
          // Each parameter without a predefined value will generate an input field in the UI
          params: [
            {
              // Parameter name (will be used as queryParam name in the POST request)
              name: 'message',

              // Label that the user will see next to the input field
              label: 'Your Message',

              // Data type of the field (text, number, select, etc.)
              type: 'text',

              // Whether this field is mandatory
              required: true,

              // Description or instructions for the user
              description: 'Enter the message you want to store on the blockchain',

              // NOTE: If we wanted a predefined value, we could use:
              // value: "Default value",
              // When 'value' is included, no input is rendered for this parameter
            },
            // More parameters could be added as needed
          ],

          // More actions could be defined as needed
        },
      ],
    };

    // Validate the metadata using the SDK function
    const validated: ValidatedMetadata = createMetadata(metadata);

    // Return the validated metadata with CORS headers
    return NextResponse.json(validated, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create metadata' }, { status: 500 });
  }
}
```

### Key Elements of the GET Endpoint

#### Metadata Structure

Metadata is the foundation of the mini-app and is built hierarchically:

1. **General mini-app properties**:

   - `url`: Complete URL of the mini-app endpoint.
   - `icon`: URL of the icon to be displayed.
   - `title`: Name of the mini-app.
   - `baseUrl`: Base URL for all API calls.
   - `description`: General description of the mini-app.

2. **Available actions** (`actions` array):

   - `type`: Action type (generally `"dynamic"` for mini-apps).
   - `label`: Text for the button that will execute the action.
   - `description`: Detailed description of what the action does.
   - `chains`: Blockchain chains compatible with the action.
   - `path`: Path of the POST endpoint that will process the action.

3. **Action parameters** (`params` array inside each action):
   - `name`: Parameter identifier (will be used as the queryParam name).
   - `label`: Label that users will see in the interface.
   - `type`: Data type (text, number, select, etc.).
   - `required`: Whether the field is mandatory.
   - `description`: Instructions for the user.
   - `value` (optional): Default value. **Important**: If a value is provided, no input field will be rendered for this parameter.

#### Parameter Behavior

- Each parameter **without** a predefined `value` will automatically generate an input field in the user interface.
- When the user submits the form, each entered value will be sent as a query parameter to the POST endpoint.
- The parameter name in the URL will be exactly the same as defined in the `name` property.

#### Other Considerations

- **Validation**: The `createMetadata` method from the SDK validates the complete structure.
- **CORS**: Headers are configured to allow requests from different origins.

## POST Endpoint Implementation

The POST endpoint is responsible for executing the dynamic action, receiving parameters and returning an execution response.

### Add the POST endpoint code to the `route.ts` file:

```typescript
import { serialize } from 'wagmi';
import { ExecutionResponse } from '@sherrylinks/sdk';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    // Get parameters from the URL
    // The queryParam names match exactly with the names defined in 'name' in the metadata configuration
    const { searchParams } = new URL(req.url);
    const message = searchParams.get('message');

    // Validate that the 'message' parameter exists (marked as required in the metadata)
    if (!message) {
      return NextResponse.json(
        { error: 'Message parameter is required' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }

    // ---- Processing of received data ----
    // Here you can implement any necessary business logic
    // Examples: add timestamps, additional validations, interactions with external APIs

    // ---- Transaction creation ----
    // In a real case, here you would create the transaction to interact with your contract
    const tx = {
      to: '0x5ee75a1B1648C023e885E58bD3735Ae273f2cc52', // Contract address
      value: BigInt(1000000), // Value to send (in wei)
      chainId: avalancheFuji.id, // Chain ID (Avalanche Fuji)
      // You could also include:
      // - data: for contract function calls
      // - maxFeePerGas, maxPriorityFeePerGas: to configure fees
      // - nonce: for transaction control
    };

    // ---- Transaction serialization ----
    // Converts the transaction to a format that can be signed and sent to the blockchain
    const serialized = serialize(tx);

    // ---- Response creation ----
    // Specific format expected by the Sherry SDK
    const resp: ExecutionResponse = {
      serializedTransaction: serialized, // Serialized transaction ready to be signed
      chainId: avalancheFuji.name, // Chain name (important: must match the one specified in the metadata)
    };

    // Return the response
    return NextResponse.json(resp, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error in POST request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Key Elements of the POST Endpoint

#### Processing Flow

1. **Parameter Reception**:

   - Parameters are received as query params in the URL.
   - Parameter names match exactly with the names defined in the `name` property of each parameter in the metadata.
   - Example: If you defined a parameter with `name: "message"`, it is accessed with `searchParams.get("message")`.

2. **Parameter Validation**:

   - Parameters marked as `required: true` in the metadata are verified to be present.
   - If any required parameter is missing, a 400 error (Bad Request) is returned.

3. **Data Processing**:

   - Here you can implement any necessary business logic.
   - Examples: add timestamps, additional validations, interactions with external APIs.

4. **Transaction Creation**:

   - The transaction object is built with the necessary parameters to interact with the blockchain.
   - Main components:
     - `to`: Smart contract address.
     - `value`: Amount of native tokens to send (in wei).
     - `chainId`: Numeric ID of the blockchain chain.
     - `data` (optional): Encoded data for contract function calls.

5. **Serialization**:

   - The transaction is serialized using the `serialize` function from `wagmi`.
   - This converts the transaction to a format that can be signed by a wallet.

6. **Response**:
   - An `ExecutionResponse` object is returned containing:
     - `serializedTransaction`: The serialized transaction ready to be signed.
     - `chainId`: The chain name (must match the one specified in the metadata).

#### Relationship with Metadata

- Each parameter defined in the metadata that doesn't have a predefined `value` will generate an input field in the user interface.
- The values entered by the user are automatically sent to the POST endpoint when the action is triggered.
- It's crucial that the parameter names in the `searchParams.get()` code match the names defined in the metadata.

## CORS Handling

To allow requests from different origins, we need to properly handle CORS requests, including preflight requests.

### Add the OPTIONS handler to the `route.ts` file:

```typescript
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204, // No Content
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
    },
  });
}
```

## Testing the Mini-App

Once the endpoints are implemented, you can test them in two ways:

### 1. Start the development server

```bash
npm run dev
```

### 2. Test the GET endpoint directly

Open a browser and visit `http://localhost:3000/api/example`. You should see the mini-app metadata in JSON format.

### 3. Test the POST endpoint manually

Use Postman or curl to make a POST request to `http://localhost:3000/api/example?message=HelloWorld`. You should receive the serialized transaction in the response.

```bash
curl -X POST "http://localhost:3000/api/example?message=HelloWorld"
```

### 4. Test with Sherry tools

#### A. Using the Sherry main application

1. Start your development server so your endpoint is accessible.
2. Visit [https://app.sherry.social/home](https://app.sherry.social/home)
3. Look for the input field to enter mini-app URLs.
4. Enter your GET endpoint URL (e.g., `http://localhost:3000/api/example`).
5. The Sherry platform will handle rendering the interface based on your metadata.

#### B. Using the Sherry Debugger

The Sherry Debugger is a specialized tool for validating and testing your mini-apps. It offers more options for debugging and allows you to quickly test your metadata.

1. Visit [https://app.sherry.social/debugger](https://app.sherry.social/debugger)
2. You have three options to test your metadata:
   - **URL**: Enter your GET endpoint URL.
   - **JSON**: Copy and paste the metadata JSON directly into the field.
   - **TypeScript**: Paste your TypeScript code that generates the metadata.
3. The debugger will validate your metadata and show you a preview of what your mini-app will look like.
4. If there are errors or issues with your metadata, the debugger will point them out.
5. You can also report bugs or issues directly from the debugger.

> **Note**: The debugger is under development, so you might encounter some bugs. If you find any issues, you can report them directly from the tool.

## Production Deployment

To deploy your mini-app in a production environment:

### 1. Build the Next.js application:

```bash
npm run build
```

### 2. Configure environment variables for production:

```
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### 3. Start the production server:

```bash
npm start
```

Alternatively, you can deploy on services like Vercel, Netlify, or any provider that supports Next.js applications.

## Supported Parameter Types

The Sherry SDK supports several parameter types that you can use in your mini-apps:

| Type      | Description              | Usage Example                           |
| --------- | ------------------------ | --------------------------------------- |
| `text`    | Simple text field        | Messages, names, identifiers            |
| `number`  | Numeric values           | Quantities, numeric IDs                 |
| `select`  | Dropdown list of options | Select an option from a predefined list |
| `boolean` | True/false value         | Enable/disable options                  |
| `date`    | Date selector            | Expiry dates, scheduling                |
| `file`    | File upload              | Upload images, documents                |

To use the `select` type, you need to define the available options:

```javascript
{
  name: "priority",
  label: "Priority",
  type: "select",
  required: true,
  description: "Select the message priority",
  options: [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" }
  ]
}
```
