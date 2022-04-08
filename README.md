# Zeedz

This repository contains the Cadence contracts & flow-js test cases for the ZeedzINO NFT Contract and the ZeedzItem contract.

## What is Zeedz

Zeedz is the first play-for-purpose game where players reduce global carbon emissions by collecting plant-inspired creatures: Zeedles. They live as NFTs on an eco-friendly blockchain (Flow) and grow with the real-world weather.

- [Visit our website](https://www.zeedz.io)

![Zeedz Logo](https://d165cxmu8yeguz.cloudfront.net/assets/logo_temp.png)

## What is ZeedzINO?

This smart contract encompasses the main functionality for the first generation
of Zeedle NFTs.

Oriented much on the standard NFT contract, each Zeedle NFT has a certain typeID,
which is the type of Zeedle - e.g. "Baby Aloe Vera" or "Ginger Biggy". A contract-level
dictionary takes account of the different quentities that have been minted per Zeedle type.

Different types also imply different rarities, and these are also hardcoded inside
the given Zeedle NFT in order to allow the direct querying of the Zeedle's rarity
in external applications and wallets.

Each batch-minting of Zeedles is resembled by an edition number, with the community pre-sale being the first-ever edition (0). This way, each Zeedle can be traced back to the edition it was created in, and the number of minted Zeedles of that type in the specific edition.

Many of the in-game purchases lead to real-world donations to NGOs focused on climate action. The carbonOffset attribute of a Zeedle proves the impact the in-game purchases related to this Zeedle have already made with regards to reducing greenhouse gases. This value is computed by taking the current dollar-value of each purchase at the time of the purchase, and applying the dollar-to-CO2-offset formular of the current climate action partner.

## Scripts

### Testing

1. `git clone` the repository to your local machine.
2. run `npm install` to install all the dependencies.
3. run `npm test` to start elumator tests.

## Folder structure

    .
    ├── __tests__          # Jest tests
    ├── cadence            # Cadence files
    │   ├── contracts      # Cadence smart contracts
    │   ├── scripts        # Scripts used to interact with the smart contracts
    │   └── transactions   # Transactions used to intreact with their respective contracts
    ├── src                # Flow-js-testing functions used to test the smart conract
    │   ├── common.js      # Commonly used flow-js-testing functions
    │   ├── zeedz.js       # Functions for testing the ZeedzINO contract
    │   └── ...            # Functions for testing other contracts from this repo
    |   
    ├── README.md          # Repository description
    └── ...
