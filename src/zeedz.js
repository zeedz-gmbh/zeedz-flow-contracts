import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const zeedleMetadataToMint = {
  name: "Ginger Zeedle",
  url: "https://zeedlz.io/images/ino/zeedle123.jpg",
  serialNumber: "123",
  editions: "3000",
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
export const mintZeedle = async (recipient, typeID, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz/mint_zeedle";
  const args = [recipient, typeID, metadata];
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
  const name = "Zeedz/burn_zeedle";
  const args = [zeedleId];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

export const levelUpZeedle = async (owner, admin, zeedleId) => {
  const name = "Zeedz/admin_levelup_zeedle";
  const args = [zeedleId];
  const signers = [owner, admin];

  return sendTransaction({ name, args, signers });
};

export const getZeedleLevel = async (account, zeedleID) => {
  const name = "zeedz/get_zeedle_level";
  const args = [account, zeedleID];

  return executeScript({ name, args });
};

export const getZeedzMintedPerType = async () => {
  const name = "zeedz/get_minted_per_type";

  return executeScript({ name });
};
