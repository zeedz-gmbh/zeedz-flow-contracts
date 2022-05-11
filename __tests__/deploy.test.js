import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  shallPass,
  shallResolve,
  shallRevert,
  mintFlow,
  getFlowBalance,
} from "flow-js-testing";

import {
  burnZeedle,
  deployZeedz,
  getZeedleCount,
  getZeedleMetadata,
  getZeedzSupply,
  mintZeedle,
  batchMintZeedle,
  setupZeedzOnAccount,
  transferZeedle,
  zeedleMetadataToMint,
  zeedleMetadataToMint2,
  zeedleMetadataToMint3,
  zeedleMetadataToMint4,
  getZeedzMintedPerType,
  getZeedleOffset,
  increaseOffset,
  claimZeedles,
  getCollectionMetadata,
} from "../src/zeedz";

import {
  deployZeedzMarketplace,
  updateSaleCutRequirementsFLOW,
  updateSaleCutRequirementsFUSD,
  getSaleCutRequirements,
  sellZeedzINO,
  sellZeedzINOFUSD,
  getListingIDs,
  buyZeedzINO,
  buyZeedzINOIncreaseOffset,
  forceRemoveListing,
  removeListing,
  getListings,
} from "../src/zeedz_marketplace";

import { deployNFTStorefront, setupNFTStorefrontOnAccount } from "../src/nft_storefront";

import {
  deployNonFungibleToken,
  getZeedzAdminAddress,
  toUFix64,
  deployFUSD,
  deployUSDC,
  setupFUSDOnAccount,
} from "../src/common";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000);

describe("Zeedz INO", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;
    await init(basePath);
    await emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });

  it("shall deploy the ZeedzINO contract", async () => {
    // Deploy
    await deployNonFungibleToken();
    await shallPass(await deployZeedz());
  });

  it("supply shall be 0 after contract is deployed", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    await shallPass(await setupZeedzOnAccount(ZeedzAdmin));

    await shallResolve(async () => {
      const [supply] = await getZeedzSupply();
      expect(supply).toBe(0);
    });
  });

  it("admin shall be able to mint a Zeedle", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));
  });

  it("admin shall be able to batch mint a Zeedle", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallPass(await batchMintZeedle(Alice, zeedleMetadataToMint4));
  });

  it("shall be able to create a new empty ZeedzINO NFT Collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);

    // Shall be able te read Bob's collection and ensure it's empty
    await shallResolve(async () => {
      const [zeedleCount] = await getZeedleCount(Bob);
      expect(zeedleCount).toBe(0);
    });
  });

  it("shall be able to read Zeedle NFT's metadata from an accounts collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    const [metadata] = await getZeedleMetadata(Bob, 0);

    // Check if it's the correct name
    await shallResolve(async () => {
      expect(metadata.name).toBe(zeedleMetadataToMint.name);
    });
  });

  it("shall be able to withdraw an NFT and deposit to another accounts collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transfer transaction shall pass
    await shallPass(transferZeedle(Alice, Bob, 0));
  });

  it("shall not be able to withdraw and transfer a Zeedle NFT that doesn't exist in a collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Transfer transaction shall fail for non-existent
    await shallRevert(transferZeedle(Alice, Bob, 1337));
  });

  it("account owner shall be able to burn a Zeedle NFT from his collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    // Burn transaction shall pass
    await shallPass(burnZeedle(Bob, 0));
  });

  it("account owner shall not be able to burn a Zeedle NFT that doesn't exist in his collection", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Bob & Alice accounts shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Burn transaction shall revert -> id doesn't exist in the account's collection
    await shallRevert(burnZeedle(Bob, 1));
  });

  it("shall be able to get minted zeedles per type", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint2));
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint3));
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint2));
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    const [mintedPerType] = await getZeedzMintedPerType();

    // Check if mintedPerType returnes the right values
    await shallResolve(async () => {
      expect(mintedPerType.toString()).toBe({ 1: 3, 2: 2, 3: 1 }.toString());
    });
  });

  it("account owner and admin should be able to cosign and increase a zeedle's carbon offset", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    // Increase offset for Bob's Zeedle shall be resolved
    await shallPass(await increaseOffset(Bob, ZeedzAdmin, 0, 1000));
  });

  it("account owner and admin should not be able to cosign and increase a zeedle's carbon offset a zeedle he doesnt own", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    // Increase offset instruction for Bob's Zeedle shall be reverted
    await shallRevert(await increaseOffset(Bob, ZeedzAdmin, 1, 1000));
  });

  it("account owner should not be able to increase a zeedle's carbon offset without an admin's signature", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    // Increase offset instruction for Bob's Zeedle shall be reverted
    await shallRevert(await increaseOffset(Bob, Alice, 1, 1000));
  });

  it("shall be able to get a zeedle's current carbon offset", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleMetadataToMint));

    // Increase offset for Bob's Zeedle shall be resolved
    await shallPass(await increaseOffset(Bob, ZeedzAdmin, 0, 1000));

    let [offset] = await getZeedleOffset(Bob, 0);

    // Check the Zeedle's offset
    await shallResolve(async () => {
      expect(offset).toBe(1000);
    });

    // Increase offset for Bob's Zeedle shall be resolved
    await shallPass(await increaseOffset(Bob, ZeedzAdmin, 0, 1500));

    [offset] = await getZeedleOffset(Bob, 0);

    // Check the Zeedle's offset
    await shallResolve(async () => {
      expect(offset).toBe(2500);
    });
  });
});

describe("Zeedz Marketplace", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;
    await init(basePath);
    await emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });

  it("shall deploy the ZeedzMarketplace contract", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployFUSD();
    await deployNFTStorefront();
    await shallPass(await deployZeedzMarketplace());
  });

  it("sale reqirements shall be emtpy after contract is deployed", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    const [requirements] = await getSaleCutRequirements();

    // Check Result
    await shallResolve(async () => {
      expect(requirements).toStrictEqual({});
    });
  });

  it("shall be able to update FLOW sale cut requirements", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));
  });

  it("shall be able to update FUSD sale cut requirements", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployFUSD();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();
    await shallPass(await setupFUSDOnAccount(offsetCut));
    await shallPass(await setupFUSDOnAccount(zeedzCut));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFUSD(zeedzCut, offsetCut, ZeedzAdmin));
  });

  it("shall be able to update FUSD & FLOW sale cut requirements", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployFUSD();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();
    await shallPass(await setupFUSDOnAccount(offsetCut));
    await shallPass(await setupFUSDOnAccount(zeedzCut));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFUSD(zeedzCut, offsetCut, ZeedzAdmin));
    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));
    const [requirements] = await getSaleCutRequirements();
  });

  it("shall be able to update sale cut requirements after they have been set", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Setup
    const zeedzCutTwo = await getAccountAddress("zeedzCutTwo");

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCutTwo, offsetCut, ZeedzAdmin));
  });

  it("shall not be able to update sale cut requirements without admin rights", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const Bob = await getAccountAddress("Bob");

    // Transaction Shall Revert
    await shallRevert(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, Bob));
  });
  it("shall be able to list a ZeedzINO NFT for sale", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));
  });
  it("shall be able to list a ZeedzINO NFT for sale for FUSD without initializing vault", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployFUSD();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();
    await shallPass(await setupFUSDOnAccount(offsetCut));
    await shallPass(await setupFUSDOnAccount(zeedzCut));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFUSD(zeedzCut, offsetCut, ZeedzAdmin));

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINOFUSD(0, toUFix64(20), Alice));
  });
  it("shall be able to buy a listed for sale a ZeedzINO NFT", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    await setupNFTStorefrontOnAccount("Bob");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    // Buy Item from listingId shallPass
    await shallPass(await buyZeedzINO(Bob, Alice, parseInt(listingID), toUFix64(20)));
  });
  it("shall be able to buy a listed for sale a ZeedzINO NFT without initializing", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const Bob = await getAccountAddress("Bob");
    await setupNFTStorefrontOnAccount("Bob");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    // Buy Item from listingId shallPass
    await shallPass(await buyZeedzINO(Bob, Alice, parseInt(listingID), toUFix64(20)));
  });
  it("shall be able to buy a listed for sale a ZeedzINO NFT and have it's offset increased by using admin cosign", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const Bob = await getAccountAddress("Bob");
    await setupNFTStorefrontOnAccount("Bob");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    // Buy Item from listingId shallPass
    await shallPass(
      await buyZeedzINOIncreaseOffset(Bob, ZeedzAdmin, Alice, parseInt(listingID), toUFix64(20)),
    );

    let [offset] = await getZeedleOffset(Bob, 0);

    await shallResolve(async () => {
      expect(offset).toBe(20 * 420);
    });
  });
  it("shall be able to buy a listed for sale a ZeedzINO NFT and have it's offset increased by using admin cosign with initializing previously", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    await setupNFTStorefrontOnAccount("Bob");
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    // Buy Item from listingId shallPass
    await shallPass(
      await buyZeedzINOIncreaseOffset(Bob, ZeedzAdmin, Alice, parseInt(listingID), toUFix64(20)),
    );

    let [offset] = await getZeedleOffset(Bob, 0);

    await shallResolve(async () => {
      expect(offset).toBe(20 * 420);
    });
  });
  it("admin shall be able to forecfully delist an NFT from the marketplace", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Forceremove instruction for Admin account shall be resolved
    await shallPass(await forceRemoveListing(ZeedzAdmin, parseInt(listingID)));
  });
  it("anyone shall not be able to delist an NFT from the marketplace if it hasn't been purchased or delisted", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listingID] = await getListingIDs();

    // Forceremove instruction for Admin account shall be resolved
    await shallRevert(await removeListing(parseInt(listingID)));
  });
  it("anyone shall be able to get listings", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();
    await deployZeedz();

    // Setup
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);
    await setupNFTStorefrontOnAccount("Alice");
    const ZeedzAdmin = await getZeedzAdminAddress();

    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));

    // Sell instruction for Alice account shall be resolved
    await shallPass(await sellZeedzINO(0, toUFix64(20), Alice));

    const [listings] = await getListings(0, 10);
  });
});

describe("Shared", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;
    await init(basePath);
    await emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });

  it("shall be able to claim NFTs from an admin account", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    await setupZeedzOnAccount(ZeedzAdmin);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint));
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint2));
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint3));

    // Claim instruction for Alice account shall be resolved
    await shallPass(await claimZeedles(Alice, ZeedzAdmin, [0, 1, 2]));
  });

  it("shall not be able to claim NFTs from an admin account without admin cosign", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    await setupZeedzOnAccount(ZeedzAdmin);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint2));
    await shallPass(await mintZeedle(Alice, zeedleMetadataToMint3));

    // Claim instruction for Alice account shall revert
    await shallRevert(await claimZeedles(Alice, Alice, [0, 1, 2]));
  });

  it("shall be able to get a collection's metdata", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    await setupZeedzOnAccount(ZeedzAdmin);

    // Mint instruction for Admin account shall be resolved
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint));
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint2));
    await shallPass(await mintZeedle(ZeedzAdmin, zeedleMetadataToMint3));

    // Get collection metadata shall pass
    await shallResolve(async () => {
      const [metadata] = await getCollectionMetadata(ZeedzAdmin);
      expect(metadata.toString()).toBe(
        [
          {
            name: "Ginger Zeedle",
            description: "A wild ginger with a wild imagination",
            typeID: 1,
            serialNumber: "Test123",
            edition: 1,
            editionCap: 3000,
            evolutionStage: 2,
            rarity: "RARE",
            imageURI: "https://zeedlz.io/images/ino/zeedle123.jpg",
            carbonOffset: 0,
          },
          {
            name: "Mint Zeedle",
            description: "A wild mint with a wild imagination",
            typeID: 2,
            serialNumber: "Test323",
            edition: 1,
            editionCap: 1000,
            evolutionStage: 2,
            rarity: "RARE",
            imageURI: "https://zeedlz.io/images/ino/zeedle223.jpg",
            carbonOffset: 0,
          },
          {
            name: "Aloe Zeedle",
            description: "A wild aloe with a wild imagination",
            typeID: 3,
            serialNumber: "Test423",
            edition: 1,
            editionCap: 2000,
            evolutionStage: 2,
            rarity: "LEGENDARY",
            imageURI: "https://zeedlz.io/images/ino/zeedle323.jpg",
            carbonOffset: 0,
          },
        ].toString(),
      );
    });
  });
});
