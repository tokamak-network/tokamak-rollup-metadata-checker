export const SYSTEM_CONFIG_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "version",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "enum SystemConfig.UpdateType",
          "name": "updateType",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "ConfigUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint8",
          "name": "version",
          "type": "uint8"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "BATCH_INBOX_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "L1_CROSS_DOMAIN_MESSENGER_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "L1_ERC_721_BRIDGE_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "L1_STANDARD_BRIDGE_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "L2_OUTPUT_ORACLE_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "OPTIMISM_MINTABLE_ERC20_FACTORY_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "OPTIMISM_PORTAL_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "UNSAFE_BLOCK_SIGNER_SLOT",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "VERSION",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "batchInbox",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "batcherHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "gasLimit",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_overhead",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_scalar",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "_batcherHash",
          "type": "bytes32"
        },
        {
          "internalType": "uint64",
          "name": "_gasLimit",
          "type": "uint64"
        },
        {
          "internalType": "address",
          "name": "_unsafeBlockSigner",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "maxResourceLimit",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "elasticityMultiplier",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "baseFeeMaxChangeDenominator",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "minimumBaseFee",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "systemTxMaxGas",
              "type": "uint32"
            },
            {
              "internalType": "uint128",
              "name": "maximumBaseFee",
              "type": "uint128"
            }
          ],
          "internalType": "struct ResourceMetering.ResourceConfig",
          "name": "_config",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "_startBlock",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_batchInbox",
          "type": "address"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "l1CrossDomainMessenger",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "l1ERC721Bridge",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "l1StandardBridge",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "l2OutputOracle",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "optimismPortal",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "optimismMintableERC20Factory",
              "type": "address"
            }
          ],
          "internalType": "struct SystemConfig.Addresses",
          "name": "_addresses",
          "type": "tuple"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l1CrossDomainMessenger",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l1ERC721Bridge",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l1StandardBridge",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "l2OutputOracle",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minimumGasLimit",
      "outputs": [
        {
          "internalType": "uint64",
          "name": "",
          "type": "uint64"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "optimismMintableERC20Factory",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "optimismPortal",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "overhead",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "resourceConfig",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "maxResourceLimit",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "elasticityMultiplier",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "baseFeeMaxChangeDenominator",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "minimumBaseFee",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "systemTxMaxGas",
              "type": "uint32"
            },
            {
              "internalType": "uint128",
              "name": "maximumBaseFee",
              "type": "uint128"
            }
          ],
          "internalType": "struct ResourceMetering.ResourceConfig",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "scalar",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_batcherHash",
          "type": "bytes32"
        }
      ],
      "name": "setBatcherHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_overhead",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_scalar",
          "type": "uint256"
        }
      ],
      "name": "setGasConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint64",
          "name": "_gasLimit",
          "type": "uint64"
        }
      ],
      "name": "setGasLimit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "maxResourceLimit",
              "type": "uint32"
            },
            {
              "internalType": "uint8",
              "name": "elasticityMultiplier",
              "type": "uint8"
            },
            {
              "internalType": "uint8",
              "name": "baseFeeMaxChangeDenominator",
              "type": "uint8"
            },
            {
              "internalType": "uint32",
              "name": "minimumBaseFee",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "systemTxMaxGas",
              "type": "uint32"
            },
            {
              "internalType": "uint128",
              "name": "maximumBaseFee",
              "type": "uint128"
            }
          ],
          "internalType": "struct ResourceMetering.ResourceConfig",
          "name": "_config",
          "type": "tuple"
        }
      ],
      "name": "setResourceConfig",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_unsafeBlockSigner",
          "type": "address"
        }
      ],
      "name": "setUnsafeBlockSigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "startBlock",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unsafeBlockSigner",
      "outputs": [
        {
          "internalType": "address",
          "name": "addr_",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "version",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]