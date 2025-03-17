export const complexAbi = [
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'address',
                name: 'newAddress',
                type: 'address',
            },
        ],
        name: 'AddressUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newBalance',
                type: 'uint256',
            },
        ],
        name: 'BalanceUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'bool',
                name: 'newFlag',
                type: 'bool',
            },
        ],
        name: 'FlagUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256',
                name: 'newNumber',
                type: 'uint256',
            },
        ],
        name: 'NumberUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'uint256[]',
                name: 'newNumbers',
                type: 'uint256[]',
            },
        ],
        name: 'NumbersUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'string',
                name: 'name',
                type: 'string',
            },
            {
                indexed: false,
                internalType: 'uint256',
                name: 'age',
                type: 'uint256',
            },
        ],
        name: 'PersonUpdated',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: 'string',
                name: 'newText',
                type: 'string',
            },
        ],
        name: 'TextUpdated',
        type: 'event',
    },
    {
        inputs: [],
        name: 'addr',
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
        ],
        name: 'balances',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'flag',
        outputs: [
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'number',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        name: 'numbers',
        outputs: [
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'person',
        outputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string',
            },
            {
                internalType: 'uint256',
                name: 'age',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'readAll',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
            {
                internalType: 'bool',
                name: '',
                type: 'bool',
            },
            {
                internalType: 'address',
                name: '',
                type: 'address',
            },
            {
                components: [
                    {
                        internalType: 'string',
                        name: 'name',
                        type: 'string',
                    },
                    {
                        internalType: 'uint256',
                        name: 'age',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct TestContract.Person',
                name: '',
                type: 'tuple',
            },
            {
                internalType: 'uint256[]',
                name: '',
                type: 'uint256[]',
            },
            {
                internalType: 'uint256',
                name: '',
                type: 'uint256',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'text',
        outputs: [
            {
                internalType: 'string',
                name: '',
                type: 'string',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'newAddress',
                type: 'address',
            },
        ],
        name: 'updateAddress',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: 'account',
                type: 'address',
            },
            {
                internalType: 'uint256',
                name: 'newBalance',
                type: 'uint256',
            },
        ],
        name: 'updateBalance',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'bool',
                name: 'newFlag',
                type: 'bool',
            },
        ],
        name: 'updateFlag',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: 'newNumber',
                type: 'uint256',
            },
        ],
        name: 'updateNumber',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256[]',
                name: 'newNumbers',
                type: 'uint256[]',
            },
        ],
        name: 'updateNumbers',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'name',
                type: 'string',
            },
            {
                internalType: 'uint256',
                name: 'age',
                type: 'uint256',
            },
        ],
        name: 'updatePerson',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: 'string',
                        name: 'name',
                        type: 'string',
                    },
                    {
                        internalType: 'uint256',
                        name: 'age',
                        type: 'uint256',
                    },
                ],
                internalType: 'struct TestContract.Person',
                name: 'newPerson',
                type: 'tuple',
            },
        ],
        name: 'updatePersonStruct',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: 'newText',
                type: 'string',
            },
        ],
        name: 'updateText',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
] as const;

export const simpleAbi = [
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
