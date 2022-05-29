import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const zeedleMetadataToMint = {
  name: "Ginger Zeedle",
  description: "A wild ginger with a wild imagination",
  typeID: 1,
  serialNumber: "Test123",
  edition: 1,
  editionCap: 3000,
  evolutionStage: 2,
  rarity: "RARE",
  imageURI: "https://zeedlz.io/images/ino/zeedle123.jpg",
};

export const zeedleMetadataToMint2 = {
  name: "Mint Zeedle",
  description: "A wild mint with a wild imagination",
  typeID: 2,
  serialNumber: "Test323",
  edition: 1,
  editionCap: 1000,
  evolutionStage: 2,
  rarity: "RARE",
  imageURI: "https://zeedlz.io/images/ino/zeedle223.jpg",
};

export const zeedleMetadataToMint3 = {
  name: "Aloe Zeedle",
  description: "A wild aloe with a wild imagination",
  typeID: 3,
  serialNumber: "Test423",
  edition: 1,
  editionCap: 2000,
  evolutionStage: 2,
  rarity: "LEGENDARY",
  imageURI: "https://zeedlz.io/images/ino/zeedle323.jpg",
};

export const zeedleMetadataToMint4 = {
  name: "Aloe Zeedle",
  description: "A wild aloe with a wild imagination",
  typeID: "3",
  serialNumber: "Test423",
  edition: "100",
  editionCap: "2000",
  evolutionStage: "20",
  rarity: "LEGENDARY",
  imageURI: "https://zeedlz.io/images/ino/zeedle323.jpg",
};

export const zeedleTypeIDToMint = 1;

export const deployZeedz = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzINO", addressMap });
};

export const setupZeedzOnAccount = async (account) => {
  const name = "zeedz_ino/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};

export const getZeedzSupply = async () => {
  const name = "zeedz_ino/get_zeedz_supply";

  return executeScript({ name });
};

export const mintZeedle = async (recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz_ino/mint_zeedle";
  const args = [
    recipient,
    metadata.name,
    metadata.description,
    metadata.typeID,
    metadata.serialNumber,
    metadata.edition,
    metadata.editionCap,
    metadata.evolutionStage,
    metadata.rarity,
    metadata.imageURI,
  ];
  const signers = [ZeedzAdmin];

  return sendTransaction({ name, args, signers });
};

export const batchMintZeedle = async (recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz_ino/batch_mint_zeedles";
  const args = [recipient, [metadata]];
  const signers = [ZeedzAdmin];

  return sendTransaction({ name, args, signers });
};

export const transferZeedle = async (sender, recipient, zeedleId) => {
  const name = "zeedz_ino/transfer_zeedle";
  const args = [recipient, zeedleId];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

export const getZeedleMetadata = async (account, zeedleID) => {
  const name = "zeedz_ino/get_zeedle_metadata";
  const args = [account, zeedleID];

  return executeScript({ name, args });
};

export const getZeedleCount = async (account) => {
  const name = "zeedz_ino/get_collection_length";
  const args = [account];

  return executeScript({ name, args });
};

export const burnZeedle = async (owner, zeedleId) => {
  const name = "zeedz_ino/burn_zeedle";
  const args = [zeedleId];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

export const getZeedzMintedPerType = async () => {
  const name = "zeedz_ino/get_minted_per_type";

  return executeScript({ name });
};

export const increaseOffset = async (owner, admin, zeedleId, amount) => {
  const name = "zeedz_ino/admin_increase_zeedle_offset";
  const args = [zeedleId, amount];
  const signers = [owner, admin];

  return sendTransaction({ name, args, signers });
};

export const getZeedleOffset = async (account, zeedleID) => {
  const name = "zeedz_ino/get_zeedle_offset";
  const args = [account, zeedleID];

  return executeScript({ name, args });
};

export const setupZeedzItemsAndZeedzINOOnAccount = async (account) => {
  const name = "shared/setup_account_all";
  const signers = [account];

  return sendTransaction({ name, signers });
};

export const claimZeedles = async (signer, admin, claimIDs) => {
  const name = "zeedz_ino/claim";
  const args = [claimIDs];
  const signers = [signer, admin];

  return sendTransaction({ name, args, signers });
};

export const getCollectionMetadata = async (account) => {
  const name = "zeedz_ino/get_collection_metadata";
  const args = [account];

  return executeScript({ name, args });
};
