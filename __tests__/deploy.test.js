import path from "path";
import {
  emulator,
  init,
  getAccountAddress,
  shallPass,
  shallResolve,
  shallRevert,
  shallThrow,
} from "flow-js-testing";

import {
  burnZeedle,
  deployZeedz,
  getZeedleCount,
  getZeedleMetadata,
  getZeedzSupply,
  mintZeedle,
  setupZeedzOnAccount,
  transferZeedle,
  zeedleMetadataToMint,
  zeedleTypeIDToMint,
  getZeedzMintedPerType,
  checkIfUserHasAdmin,
  promoteToAdmin,
  mintZeedleViaAdminClient,
} from "../src/zeedz";

import { deployNonFungibleToken, getZeedzAdminAddress, toUFix64 } from "../src/common";

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000);

describe("Zeedz", () => {
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
    await deployZeedz();
  });

  it("supply shall be 0 after contract is deployed", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    await shallPass(setupZeedzOnAccount(ZeedzAdmin));

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
    await shallPass(await mintZeedle(Alice, zeedleTypeIDToMint, zeedleMetadataToMint));
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
    await shallPass(await mintZeedle(Bob, zeedleTypeIDToMint, zeedleMetadataToMint));

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
    await shallPass(await mintZeedle(Alice, zeedleTypeIDToMint, zeedleMetadataToMint));

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
    await shallPass(await mintZeedle(Bob, zeedleTypeIDToMint, zeedleMetadataToMint));

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

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, zeedleTypeIDToMint, zeedleMetadataToMint));

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

    // Mint instruction for Bob account shall be resolved
    await shallPass(await mintZeedle(Bob, 1, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, 1, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, 2, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, 3, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, 2, zeedleMetadataToMint));
    await shallPass(await mintZeedle(Bob, 1, zeedleMetadataToMint));

    const [mintedPerType] = await getZeedzMintedPerType();

    // Check if mintedPerType returnes the right values
    await shallResolve(async () => {
      expect(mintedPerType.toString()).toBe({ 1: 3, 2: 2, 3: 1 }.toString());
    });
  });

  it("shall be able check if an user is an admin", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);

    // Run script to check if the user is an admin
    const [check] = await checkIfUserHasAdmin(Bob);

    // Check if checkIfUserHasAdmin has returned the right value
    await shallResolve(async () => {
      expect(check).toBe(false);
    });
  });

  it("shall be able to promote an user to admin", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Promote to admin instruction for Bob's account  shall be resolved
    await shallPass(await promoteToAdmin(Bob, ZeedzAdmin));

    // Run script to check if the user is an admin
    const [check] = await checkIfUserHasAdmin(Bob);

    // Check if checkIfUserHasAdmin has returned the right value
    await shallResolve(async () => {
      expect(check).toBe(true);
    });
  });

  it("shall be not able to promote an user to admin without admin signature", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Promote to admin instruction for Bob's account  shall be revet
    await shallResolve(await promoteToAdmin(Bob, Alice));

    // Run script to check if the user is an admin
    const [check] = await checkIfUserHasAdmin(Bob);

    // Check if checkIfUserHasAdmin has returned the right value
    await shallResolve(async () => {
      expect(check).toBe(false);
    });
  });

  it("user promoted to admin shall be able to mint a Zeedle", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const ZeedzAdmin = await getZeedzAdminAddress();
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Promote to admin instruction for Bob's account  shall be resolved
    await shallPass(await promoteToAdmin(Bob, ZeedzAdmin));

    // Mint instruction for Alice account shall be resolved
    await shallPass(
      await mintZeedleViaAdminClient(Alice, Bob, zeedleTypeIDToMint, zeedleMetadataToMint),
    );
  });

  it("user not promoted to admin shall not be able to mint a Zeedle", async () => {
    // Deploy
    await deployNonFungibleToken();
    await deployZeedz();

    // Setup
    const Bob = await getAccountAddress("Bob");
    await setupZeedzOnAccount(Bob);
    const Alice = await getAccountAddress("Alice");
    await setupZeedzOnAccount(Alice);

    // Mint instruction for Alice account shall be resolved
    await shallRevert(
      await mintZeedleViaAdminClient(Alice, Bob, zeedleTypeIDToMint, zeedleMetadataToMint),
    );
  });
});
