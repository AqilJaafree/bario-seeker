/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bario_seeker_program.json`.
 */
export type BarioSeekerProgram = {
  "address": "7aTL3mhtrRg57Jr3dBmTgHYHufmsepzhPqbYMhioV5Yc",
  "metadata": {
    "name": "barioSeekerProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Bario Seeker — soulbound provenance, grading and geotagged journey checkpoints for Bario rice"
  },
  "instructions": [
    {
      "name": "addCheckpoint",
      "docs": [
        "Append a geotagged, priced stop. Distributor or Retailer role required."
      ],
      "discriminator": [
        19,
        64,
        146,
        133,
        55,
        216,
        49,
        46
      ],
      "accounts": [
        {
          "name": "actorAuthority",
          "writable": true,
          "signer": true
        },
        {
          "name": "actor",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "actorAuthority"
              }
            ]
          }
        },
        {
          "name": "producer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "producer.authority",
                "account": "producer"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "account",
                "path": "batch.batch_code",
                "account": "batch"
              }
            ]
          }
        },
        {
          "name": "checkpoint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "arg",
                "path": "args.index"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "addCheckpointArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Create the platform config and the global producer Collection.",
        "Runs once per deployment."
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "producerCollection",
          "docs": [
            "The `Bario Seeker Producers` Metaplex Core Collection.",
            "",
            "A PDA rather than a fresh keypair, so its address is derivable by any",
            "client without being told — the verification page can find every",
            "producer certificate from the program ID alone.",
            "",
            "constrained by these seeds and it must not already exist."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "collectionUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "rateBatch",
      "docs": [
        "Rate a batch 1-5 stars. One rating per wallet per batch."
      ],
      "discriminator": [
        129,
        90,
        117,
        25,
        216,
        244,
        119,
        31
      ],
      "accounts": [
        {
          "name": "reviewer",
          "writable": true,
          "signer": true
        },
        {
          "name": "producer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "producer.authority",
                "account": "producer"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "account",
                "path": "batch.batch_code",
                "account": "batch"
              }
            ]
          }
        },
        {
          "name": "review",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  118,
                  105,
                  101,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "account",
                "path": "reviewer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rating",
          "type": "u8"
        },
        {
          "name": "reviewCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "recordAudit",
      "docs": [
        "Record an independent lab audit. Auditor role required.",
        "Re-audits append; they never overwrite."
      ],
      "discriminator": [
        50,
        115,
        90,
        228,
        160,
        190,
        231,
        179
      ],
      "accounts": [
        {
          "name": "auditor",
          "docs": [
            "Must hold the Auditor role. This is the check the whole trust chain",
            "rests on, so it lives here rather than in a backend that could be",
            "bypassed or misconfigured."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "actor",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "auditor"
              }
            ]
          }
        },
        {
          "name": "producer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "producer.authority",
                "account": "producer"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "account",
                "path": "batch.batch_code",
                "account": "batch"
              }
            ]
          }
        },
        {
          "name": "batchAsset",
          "writable": true
        },
        {
          "name": "batchCollection",
          "writable": true
        },
        {
          "name": "checkpoint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "arg",
                "path": "args.index"
              }
            ]
          }
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "recordAuditArgs"
            }
          }
        }
      ]
    },
    {
      "name": "recordScan",
      "docs": [
        "Record a consumer scan at ~1 km precision. Permissionless; a relayer pays."
      ],
      "discriminator": [
        84,
        105,
        74,
        98,
        184,
        80,
        165,
        253
      ],
      "accounts": [
        {
          "name": "payer",
          "docs": [
            "The relayer. Pays rent and fees on the consumer's behalf."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "producer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "producer.authority",
                "account": "producer"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "account",
                "path": "batch.batch_code",
                "account": "batch"
              }
            ]
          }
        },
        {
          "name": "scan",
          "docs": [
            "Scans live under their own seed namespace so they never interleave with",
            "the supply-chain journey — the route line and the heat layer are",
            "separate readings of the same primitive."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  99,
                  97,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "arg",
                "path": "args.index"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "recordScanArgs"
            }
          }
        }
      ]
    },
    {
      "name": "registerActor",
      "docs": [
        "Grant a wallet the Auditor, Distributor or Retailer role. Admin only."
      ],
      "discriminator": [
        113,
        25,
        196,
        156,
        92,
        79,
        15,
        151
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "actor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "actorAuthority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "actorAuthority",
          "type": "pubkey"
        },
        {
          "name": "role",
          "type": {
            "defined": {
              "name": "actorRole"
            }
          }
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "registerBatch",
      "docs": [
        "Register a harvest lot: mints its soulbound certificate into the",
        "producer's Collection and writes checkpoint #0 at the farm."
      ],
      "discriminator": [
        255,
        186,
        59,
        153,
        95,
        233,
        143,
        171
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "producer"
          ]
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "producer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "arg",
                "path": "args.batch_code"
              }
            ]
          }
        },
        {
          "name": "batchAsset",
          "docs": [
            "The Batch SBT.",
            ""
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "arg",
                "path": "args.batch_code"
              }
            ]
          }
        },
        {
          "name": "batchCollection",
          "writable": true
        },
        {
          "name": "farmCheckpoint",
          "docs": [
            "Checkpoint #0 — the farm. Written in the same transaction as the batch",
            "so that no batch can ever exist without an origin."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "const",
                "value": [
                  0,
                  0,
                  0,
                  0
                ]
              }
            ]
          }
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "registerBatchArgs"
            }
          }
        }
      ]
    },
    {
      "name": "registerProducer",
      "docs": [
        "Register a Bario producer: validates the farm is in the highlands,",
        "mints their soulbound identity, and creates their harvest Collection."
      ],
      "discriminator": [
        63,
        216,
        96,
        99,
        81,
        129,
        193,
        245
      ],
      "accounts": [
        {
          "name": "authority",
          "docs": [
            "The farmer's wallet. Pays for its own registration and ends up owning",
            "the Producer SBT — though it will never be able to move it."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "producer",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "producerAsset",
          "docs": [
            "The Producer SBT.",
            ""
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114,
                  95,
                  97,
                  115,
                  115,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "batchCollection",
          "docs": [
            "This producer's own Collection, which will hold their batch SBTs.",
            "Creating it here is what makes \"batch is a child of producer\"",
            "structural rather than a claim we ask people to believe.",
            ""
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104,
                  95,
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              }
            ]
          }
        },
        {
          "name": "producerCollection",
          "writable": true
        },
        {
          "name": "mplCoreProgram",
          "address": "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "registerProducerArgs"
            }
          }
        }
      ]
    },
    {
      "name": "reportCounterfeit",
      "docs": [
        "File a counterfeit report against a batch. One per wallet per batch."
      ],
      "discriminator": [
        227,
        169,
        21,
        169,
        94,
        155,
        115,
        54
      ],
      "accounts": [
        {
          "name": "reporter",
          "docs": [
            "The reporter, or a relayer acting for a consumer with no wallet."
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "producer",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  100,
                  117,
                  99,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "producer.authority",
                "account": "producer"
              }
            ]
          }
        },
        {
          "name": "batch",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  99,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "producer"
              },
              {
                "kind": "account",
                "path": "batch.batch_code",
                "account": "batch"
              }
            ]
          }
        },
        {
          "name": "report",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  112,
                  111,
                  114,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "batch"
              },
              {
                "kind": "account",
                "path": "reporter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lat",
          "type": "i32"
        },
        {
          "name": "lon",
          "type": "i32"
        },
        {
          "name": "evidenceCid",
          "type": "string"
        }
      ]
    },
    {
      "name": "setActorActive",
      "docs": [
        "Withdraw or restore an actor's accreditation. Their existing",
        "checkpoints are deliberately left in place."
      ],
      "discriminator": [
        138,
        255,
        115,
        223,
        191,
        207,
        208,
        217
      ],
      "accounts": [
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "actor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  99,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "actor.authority",
                "account": "actor"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "active",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "actor",
      "discriminator": [
        46,
        77,
        47,
        204,
        204,
        54,
        34,
        88
      ]
    },
    {
      "name": "batch",
      "discriminator": [
        156,
        194,
        70,
        44,
        22,
        88,
        137,
        44
      ]
    },
    {
      "name": "checkpoint",
      "discriminator": [
        199,
        62,
        186,
        186,
        98,
        119,
        211,
        139
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
    {
      "name": "producer",
      "discriminator": [
        192,
        54,
        217,
        4,
        116,
        24,
        153,
        196
      ]
    },
    {
      "name": "report",
      "discriminator": [
        232,
        246,
        229,
        227,
        242,
        105,
        190,
        2
      ]
    },
    {
      "name": "review",
      "discriminator": [
        124,
        63,
        203,
        215,
        226,
        30,
        222,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notAdmin",
      "msg": "Only the platform admin may perform this action"
    },
    {
      "code": 6001,
      "name": "actorNotRegistered",
      "msg": "Signer is not registered as an actor on this platform"
    },
    {
      "code": 6002,
      "name": "actorInactive",
      "msg": "This actor's registration has been deactivated"
    },
    {
      "code": 6003,
      "name": "wrongRole",
      "msg": "Signer does not hold the role required for this action"
    },
    {
      "code": 6004,
      "name": "notAuditor",
      "msg": "Only a registered auditor may record a grade"
    },
    {
      "code": 6005,
      "name": "outsideBarioBounds",
      "msg": "Farm coordinates fall outside the Bario highlands"
    },
    {
      "code": 6006,
      "name": "elevationTooLow",
      "msg": "Farm elevation is below the 1,100 m highland threshold for Bario rice"
    },
    {
      "code": 6007,
      "name": "invalidCoordinates",
      "msg": "Coordinates are not a valid point on Earth"
    },
    {
      "code": 6008,
      "name": "textTooLong",
      "msg": "Text field exceeds its maximum length"
    },
    {
      "code": 6009,
      "name": "textEmpty",
      "msg": "Text field must not be empty"
    },
    {
      "code": 6010,
      "name": "invalidQuantity",
      "msg": "Quantity must be greater than zero"
    },
    {
      "code": 6011,
      "name": "invalidBagCount",
      "msg": "Bag count must be greater than zero"
    },
    {
      "code": 6012,
      "name": "invalidPrice",
      "msg": "Price must be greater than zero for this checkpoint kind"
    },
    {
      "code": 6013,
      "name": "invalidRating",
      "msg": "Rating must be between 1 and 5"
    },
    {
      "code": 6014,
      "name": "invalidGrade",
      "msg": "Grade must be A1, A2 or B — Pending cannot be recorded by an audit"
    },
    {
      "code": 6015,
      "name": "invalidCheckpointKind",
      "msg": "This checkpoint kind cannot be submitted through this instruction"
    },
    {
      "code": 6016,
      "name": "batchProducerMismatch",
      "msg": "Batch does not belong to the producer account provided"
    },
    {
      "code": 6017,
      "name": "checkpointBatchMismatch",
      "msg": "Checkpoint does not belong to the batch account provided"
    },
    {
      "code": 6018,
      "name": "invalidHarvestDate",
      "msg": "Harvest date is implausible"
    },
    {
      "code": 6019,
      "name": "counterOverflow",
      "msg": "A counter overflowed — this batch or producer has reached its limit"
    }
  ],
  "types": [
    {
      "name": "actor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "role",
            "type": {
              "defined": {
                "name": "actorRole"
              }
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "active",
            "docs": [
              "Accreditation can be withdrawn without erasing the actor's history."
            ],
            "type": "bool"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "actorRole",
      "docs": [
        "Supply-chain participants other than producers and consumers.",
        "",
        "Roles are checked on-chain rather than in the backend, because the trust",
        "claim in the PRD (\"only an accredited auditor sets a grade\") is only worth",
        "making if a rogue backend cannot forge it."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "auditor"
          },
          {
            "name": "distributor"
          },
          {
            "name": "retailer"
          }
        ]
      }
    },
    {
      "name": "addCheckpointArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "docs": [
              "Must equal the batch's current `checkpoint_count`."
            ],
            "type": "u32"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "checkpointKind"
              }
            }
          },
          {
            "name": "lat",
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          },
          {
            "name": "label",
            "docs": [
              "e.g. \"Tesco Pavilion, Kuala Lumpur\"."
            ],
            "type": "string"
          },
          {
            "name": "priceSen",
            "docs": [
              "Sen per kg at this stop."
            ],
            "type": "u32"
          },
          {
            "name": "noteCid",
            "docs": [
              "IPFS CID for a delivery note or shelf photo. May be empty."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "batch",
      "docs": [
        "One harvest lot, certified as a child of its producer."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "producer",
            "docs": [
              "The `Producer` PDA this batch belongs to."
            ],
            "type": "pubkey"
          },
          {
            "name": "asset",
            "docs": [
              "Batch SBT — a frozen Metaplex Core asset in the producer's Collection."
            ],
            "type": "pubkey"
          },
          {
            "name": "batchCode",
            "type": "string"
          },
          {
            "name": "variety",
            "type": "string"
          },
          {
            "name": "grade",
            "docs": [
              "The most recent audited grade. Earlier grades are never erased — they",
              "remain readable as `Audit` checkpoints."
            ],
            "type": {
              "defined": {
                "name": "grade"
              }
            }
          },
          {
            "name": "harvestDate",
            "type": "i64"
          },
          {
            "name": "quantityKg",
            "type": "u32"
          },
          {
            "name": "bagCount",
            "type": "u32"
          },
          {
            "name": "farmgatePriceSen",
            "docs": [
              "What the farmer was paid, in sen per kg."
            ],
            "type": "u32"
          },
          {
            "name": "checkpointCount",
            "docs": [
              "Next index in the journey checkpoint sequence."
            ],
            "type": "u32"
          },
          {
            "name": "auditCount",
            "docs": [
              "How many audits this batch has had. >1 means it was re-audited."
            ],
            "type": "u16"
          },
          {
            "name": "scanCount",
            "docs": [
              "Next index in the consumer scan sequence."
            ],
            "type": "u32"
          },
          {
            "name": "ratingSum",
            "type": "u32"
          },
          {
            "name": "ratingCount",
            "type": "u32"
          },
          {
            "name": "reportCount",
            "type": "u32"
          },
          {
            "name": "registeredAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "checkpoint",
      "docs": [
        "One append-only, geotagged event in a batch's life.",
        "",
        "This is the single primitive behind four features: the consumer journey map,",
        "the price journey, the audit history, and the scan-anomaly signal. No",
        "instruction in this program mutates or closes a checkpoint once written."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batch",
            "docs": [
              "The `Batch` PDA this checkpoint belongs to."
            ],
            "type": "pubkey"
          },
          {
            "name": "index",
            "docs": [
              "Position in its sequence. Journey checkpoints and consumer scans are",
              "numbered separately and live under different seeds."
            ],
            "type": "u32"
          },
          {
            "name": "kind",
            "type": {
              "defined": {
                "name": "checkpointKind"
              }
            }
          },
          {
            "name": "actor",
            "docs": [
              "The wallet that submitted this checkpoint. For consumer scans this is",
              "the relayer, not the consumer — consumers never hold a wallet."
            ],
            "type": "pubkey"
          },
          {
            "name": "lat",
            "docs": [
              "Micro-degrees."
            ],
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          },
          {
            "name": "label",
            "type": "string"
          },
          {
            "name": "priceSen",
            "docs": [
              "Sen per kg. Zero where the kind carries no price."
            ],
            "type": "u32"
          },
          {
            "name": "grade",
            "docs": [
              "Set on `Audit` checkpoints only."
            ],
            "type": {
              "option": {
                "defined": {
                  "name": "grade"
                }
              }
            }
          },
          {
            "name": "noteCid",
            "docs": [
              "IPFS CID for photos or the audit report. Empty where there is none."
            ],
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "checkpointKind",
      "docs": [
        "What happened at a checkpoint.",
        "",
        "The kind determines who is allowed to submit it and how the verification",
        "page draws it — journey kinds form the route line, `ConsumerScan` forms the",
        "heat layer underneath it."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "farm"
          },
          {
            "name": "collection"
          },
          {
            "name": "audit"
          },
          {
            "name": "distribution"
          },
          {
            "name": "retail"
          },
          {
            "name": "consumerScan"
          }
        ]
      }
    },
    {
      "name": "config",
      "docs": [
        "Platform-wide singleton. Owns the global producer Collection and acts as the",
        "update authority for every Metaplex Core asset the program mints, which is",
        "what makes the soulbound guarantee hold: the freeze authority is this PDA,",
        "and no private key controls it."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "docs": [
              "May register actors and hand over admin."
            ],
            "type": "pubkey"
          },
          {
            "name": "producerCollection",
            "docs": [
              "The `Bario Seeker Producers` Metaplex Core Collection."
            ],
            "type": "pubkey"
          },
          {
            "name": "producerCount",
            "type": "u32"
          },
          {
            "name": "batchCount",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "grade",
      "docs": [
        "Audited quality classification.",
        "",
        "`Pending` is the state between registration and the first audit. It is a",
        "real state, not a null: a bag can legitimately be in the supply chain before",
        "its lab result comes back, and the verification page must say so plainly",
        "rather than implying a grade the batch has not earned."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "a1"
          },
          {
            "name": "a2"
          },
          {
            "name": "b"
          }
        ]
      }
    },
    {
      "name": "producer",
      "docs": [
        "A registered Bario farmer or cooperative.",
        "",
        "One per wallet, enforced by the PDA seeds. Mirrors the on-chain state that",
        "backs the Producer SBT, and holds the running reputation aggregate so the",
        "verification page can render a score without replaying every review."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "The producer's wallet. Owns both SBTs but cannot move them."
            ],
            "type": "pubkey"
          },
          {
            "name": "asset",
            "docs": [
              "Producer SBT — a frozen Metaplex Core asset."
            ],
            "type": "pubkey"
          },
          {
            "name": "batchCollection",
            "docs": [
              "This producer's own Core Collection, holding their batch SBTs."
            ],
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "farmLat",
            "docs": [
              "Farm location in micro-degrees, validated against the Bario bounding box."
            ],
            "type": "i32"
          },
          {
            "name": "farmLon",
            "type": "i32"
          },
          {
            "name": "farmElevationM",
            "type": "u16"
          },
          {
            "name": "identityHash",
            "docs": [
              "Digest standing in for an off-chain identity verification record.",
              "No personally identifying data is ever written on-chain."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "joinedAt",
            "type": "i64"
          },
          {
            "name": "batchCount",
            "type": "u32"
          },
          {
            "name": "ratingSum",
            "docs": [
              "Quantity-weighted reputation: sum of (stars x batch kg) over all reviews."
            ],
            "type": "u64"
          },
          {
            "name": "ratingWeight",
            "docs": [
              "Sum of batch kg over all reviews. Score = rating_sum / rating_weight."
            ],
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "recordAuditArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "docs": [
              "Must equal the batch's current `checkpoint_count`. Passing it explicitly",
              "makes a concurrent write fail loudly instead of overwriting a stop."
            ],
            "type": "u32"
          },
          {
            "name": "grade",
            "type": {
              "defined": {
                "name": "grade"
              }
            }
          },
          {
            "name": "lat",
            "docs": [
              "Where the audit was carried out, in micro-degrees."
            ],
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          },
          {
            "name": "label",
            "docs": [
              "e.g. \"Sarawak Rice Laboratory, Miri\"."
            ],
            "type": "string"
          },
          {
            "name": "reportCid",
            "docs": [
              "IPFS CID of the full audit report."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "recordScanArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "docs": [
              "Must equal the batch's current `scan_count`."
            ],
            "type": "u32"
          },
          {
            "name": "lat",
            "docs": [
              "Approximate consumer location in micro-degrees. Clients must truncate to",
              "~1 km before sending; the program snaps to the same grid regardless."
            ],
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          },
          {
            "name": "label",
            "docs": [
              "Coarse place name, e.g. \"Kuala Lumpur\". Never a street address."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "registerBatchArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batchCode",
            "docs": [
              "Human-readable lot code, e.g. \"2026-11-001\". Part of the PDA seeds, so",
              "it is unique per producer and cannot be reused."
            ],
            "type": "string"
          },
          {
            "name": "variety",
            "type": "string"
          },
          {
            "name": "harvestDate",
            "type": "i64"
          },
          {
            "name": "quantityKg",
            "type": "u32"
          },
          {
            "name": "bagCount",
            "type": "u32"
          },
          {
            "name": "farmgatePriceSen",
            "docs": [
              "What the farmer was paid, in sen per kg."
            ],
            "type": "u32"
          },
          {
            "name": "assetUri",
            "type": "string"
          },
          {
            "name": "noteCid",
            "docs": [
              "IPFS CID for harvest photos. May be empty."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "registerProducerArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "farmLat",
            "docs": [
              "Farm location in micro-degrees."
            ],
            "type": "i32"
          },
          {
            "name": "farmLon",
            "type": "i32"
          },
          {
            "name": "farmElevationM",
            "type": "u16"
          },
          {
            "name": "identityHash",
            "docs": [
              "Digest of an off-chain identity verification record. No PII on-chain."
            ],
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "assetUri",
            "docs": [
              "Metadata URI for the Producer SBT."
            ],
            "type": "string"
          },
          {
            "name": "collectionUri",
            "docs": [
              "Metadata URI for this producer's batch Collection."
            ],
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "report",
      "docs": [
        "A counterfeit report against one batch.",
        "",
        "Recording a report on-chain makes the signal tamper-evident and gives the",
        "regulator a spatial feed. It is deliberately *not* a public accusation: the",
        "PRD requires every report to route to a human, and the producer to have a",
        "right of reply, before anything is shown to consumers."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batch",
            "type": "pubkey"
          },
          {
            "name": "reporter",
            "type": "pubkey"
          },
          {
            "name": "lat",
            "docs": [
              "Coarsened to the same ~1 km grid as consumer scans."
            ],
            "type": "i32"
          },
          {
            "name": "lon",
            "type": "i32"
          },
          {
            "name": "evidenceCid",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "review",
      "docs": [
        "A consumer rating of one batch.",
        "",
        "Seeded by (batch, reviewer) so one wallet can rate a batch exactly once.",
        "Review prose lives off-chain; only its CID is anchored here."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "batch",
            "type": "pubkey"
          },
          {
            "name": "reviewer",
            "type": "pubkey"
          },
          {
            "name": "rating",
            "docs": [
              "1..=5 stars."
            ],
            "type": "u8"
          },
          {
            "name": "reviewCid",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "constants": [
    {
      "name": "actorSeed",
      "type": "bytes",
      "value": "[97, 99, 116, 111, 114]"
    },
    {
      "name": "batchAssetSeed",
      "type": "bytes",
      "value": "[98, 97, 116, 99, 104, 95, 97, 115, 115, 101, 116]"
    },
    {
      "name": "batchCollectionSeed",
      "type": "bytes",
      "value": "[98, 97, 116, 99, 104, 95, 99, 111, 108, 108, 101, 99, 116, 105, 111, 110]"
    },
    {
      "name": "batchSeed",
      "type": "bytes",
      "value": "[98, 97, 116, 99, 104]"
    },
    {
      "name": "checkpointSeed",
      "type": "bytes",
      "value": "[99, 104, 101, 99, 107, 112, 111, 105, 110, 116]"
    },
    {
      "name": "configSeed",
      "type": "bytes",
      "value": "[99, 111, 110, 102, 105, 103]"
    },
    {
      "name": "producerAssetSeed",
      "type": "bytes",
      "value": "[112, 114, 111, 100, 117, 99, 101, 114, 95, 97, 115, 115, 101, 116]"
    },
    {
      "name": "producerCollectionSeed",
      "type": "bytes",
      "value": "[112, 114, 111, 100, 117, 99, 101, 114, 95, 99, 111, 108, 108, 101, 99, 116, 105, 111, 110]"
    },
    {
      "name": "producerSeed",
      "type": "bytes",
      "value": "[112, 114, 111, 100, 117, 99, 101, 114]"
    },
    {
      "name": "reportSeed",
      "type": "bytes",
      "value": "[114, 101, 112, 111, 114, 116]"
    },
    {
      "name": "reviewSeed",
      "type": "bytes",
      "value": "[114, 101, 118, 105, 101, 119]"
    },
    {
      "name": "scanSeed",
      "type": "bytes",
      "value": "[115, 99, 97, 110]"
    }
  ]
};
