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

/*
 * Deploys NonFungibleToken and Zeedz contracts to ZeedzAdmin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployZeedz = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzINO", addressMap });
};

/*
 * Setups Zeedz collection on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupZeedzOnAccount = async (account) => {
  const name = "zeedz/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};

/*
 * Returns Zeedz supply.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64} - number of NFT minted so far
 * */
export const getZeedzSupply = async () => {
  const name = "zeedz/get_zeedz_supply";

  return executeScript({ name });
};

/*
 * Mints a Zeedle and sends it to **recipient**.
 * @param {string} recipient - recipient account address
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const mintZeedle = async (recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz/mint_zeedle";
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

/*
 * Mints a Zeedle and sends it to **recipient**.
 * @param {string} recipient - recipient account address
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const batchMintZeedle = async (recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz/batch_mint_zeedles";
  const args = [recipient, [metadata]];
  const signers = [ZeedzAdmin];

  return sendTransaction({ name, args, signers });
};

/*
 * Transfers A Zeedle NFT with id equal **zeedleId** from **sender** account to **recipient**.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {UInt64} zeedleId - id of the zeedle to transfer
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const transferZeedle = async (sender, recipient, zeedleId) => {
  const name = "zeedz/transfer_zeedle";
  const args = [recipient, zeedleId];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

/*
 * Returns the Zeedle NFT metadata with the provided **id** from an account collection.
 * @param {string} account - account address
 * @param {UInt64} zeedleID - NFT id
 * @throws Will throw an error if execution will be halted
 * @returns {String: String}
 * */
export const getZeedleMetadata = async (account, zeedleID) => {
  const name = "zeedz/get_zeedle_metadata";
  const args = [account, zeedleID];

  return executeScript({ name, args });
};

/*
 * Returns the number of Zeedz in an account's collection.
 * @param {string} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getZeedleCount = async (account) => {
  const name = "zeedz/get_collection_length";
  const args = [account];

  return executeScript({ name, args });
};

/*
 * Burns a Zeedle NFT with id equal **zeedleId** from **owner** account
 * @param {string} owner - sender address
 * @param {UInt64} zeedleId - id of the zeedle to burn
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const burnZeedle = async (owner, zeedleId) => {
  const name = "zeedz/burn_zeedle";
  const args = [zeedleId];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

/**
 * Gets the number of inted Zeedle's per each minted typeId
 * @returns
 */
export const getZeedzMintedPerType = async () => {
  const name = "zeedz/get_minted_per_type";

  return executeScript({ name });
};

/**
 * Increases a Zeedle's carbon offset field by the given amount
 * @param {account} owner zeedle owner
 * @param {account} admin zeedle adminclient
 * @param {UInt64} zeedleId zeedleId
 * @param {UInt64} amount amount to increase the offset by
 * @returns
 */
export const increaseOffset = async (owner, admin, zeedleId, amount) => {
  const name = "zeedz/admin_increase_zeedle_offset";
  const args = [zeedleId, amount];
  const signers = [owner, admin];

  return sendTransaction({ name, args, signers });
};

/**
 * Gets a Zeedle's carbon offset
 * @param {*} account zeedle owner account
 * @param {*} zeedleID zeedle id
 * @returns
 */
export const getZeedleOffset = async (account, zeedleID) => {
  const name = "zeedz/get_zeedle_offset";
  const args = [account, zeedleID];

  return executeScript({ name, args });
};

/*
 * Setups ZeedzItems & ZeedzINO collections on account and exposes public capabilites.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupZeedzItemsAndZeedzINOOnAccount = async (account) => {
  const name = "shared/setup_account_all";
  const signers = [account];

  return sendTransaction({ name, signers });
};
