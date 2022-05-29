import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  shallPass,
  shallResolve,
  shallRevert,
  mintFlow,
} from "flow-js-testing";

import {
  deployZeedz,
  mintZeedle,
  setupZeedzOnAccount,
  zeedleMetadataToMint,
  getZeedleOffset,
} from "./src/zeedz_ino";

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
} from "./src/zeedz_marketplace";

import { deployNFTStorefront, setupNFTStorefrontOnAccount } from "./src/nft_storefront";

import {
  deployNonFungibleToken,
  getZeedzAdminAddress,
  toUFix64,
  deployFUSD,
  setupFUSDOnAccount,
} from "./src/common";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000);

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
    await shallPass(await deployNFTStorefront());
    await shallPass(await deployZeedzMarketplace());
  });

  it("sale reqirements shall be emtpy after contract is deployed", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployNFTStorefront();
    await deployZeedzMarketplace();

    const [requirements] = await getSaleCutRequirements();

    // Check Result
    expect(requirements).toStrictEqual({});
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

    expect(offset).toBe(69);
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

    expect(offset).toBe(69);
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

    await removeListing(parseInt(listingID));

    const [listingID2] = await getListingIDs();

    expect(listingID2.toString()).toBe(listingID.toString());
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
