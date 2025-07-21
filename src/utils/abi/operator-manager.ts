/**
 * Operator Manager 컨트랙트 ABI
 */
export const OPERATOR_MANAGER_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "AlreadySetError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientBalanceError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SameAddressError",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "TransferEthError",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "AddedOperator",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Claimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "DeletedOperator",
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
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      }
    ],
    "name": "ProcessRequest",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "n",
        "type": "uint256"
      }
    ],
    "name": "ProcessRequests",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "RequestWithdrawal",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "_additionalNotesl2Info",
        "type": "string"
      }
    ],
    "name": "SetAdditionalNotes",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_layer2Manager",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_depositManager",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_ton",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "_wton",
        "type": "address"
      }
    ],
    "name": "SetAddresses",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "previousManager",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newManager",
        "type": "address"
      }
    ],
    "name": "TransferredManager",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "acquireManager",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkL1Bridge",
    "outputs": [
      {
        "internalType": "bool",
        "name": "result",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "l1Bridge",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "portal",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "l2Ton",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_type",
        "type": "uint8"
      },
      {
        "internalType": "uint8",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "rejectedSeigs",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "rejectedL2Deposit",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "claimERC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositManager",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "name": "isOperator",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "layer2Manager",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "manager",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "operator",
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
    "name": "processRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "n",
        "type": "uint256"
      }
    ],
    "name": "processRequests",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "requestWithdrawal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rollupConfig",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_layer2Manager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_depositManager",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_ton",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_wton",
        "type": "address"
      }
    ],
    "name": "setAddresses",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ton",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newManager",
        "type": "address"
      }
    ],
    "name": "transferManager",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "wton",
    "outputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];