import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const typeID1 = 1;
export const itemMetadataToMint1 = {
  Name: "Secret Key",
  Url: "www.zeedz.io/test",
};

/*
 * Deploys NonFungibleToken and ZeedzItems contracts to ZeedzAdmin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployZeedzItems = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzItems", addressMap });
};

/*
 * Setups ZeedzItems collection on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupZeedzItemsOnAccount = async (account) => {
  const name = "zeedz_items/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};

/*
 * Returns ZeedzItems supply.
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64} - number of NFT minted so far
 * */
export const getZeedzItemSupply = async () => {
  const name = "zeedz_items/get_zeedz_items_supply";

  return executeScript({ name });
};

/*
 * Mints ZeedzItem of a specific **itemType** and sends it to **recipient**.
 * @param {UInt64} itemType - type of NFT to mint
 * @param {string} recipient - recipient account address
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const mintZeedzItem = async (itemType, recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz_items/mint_zeedz_item";
  const args = [recipient, itemType, metadata];
  const signers = [ZeedzAdmin];

  return sendTransaction({ name, args, signers });
};

/*
 * Transfers ZeedzItem NFT with id equal **itemId** from **sender** account to **recipient**.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {UInt64} itemId - id of the item to transfer
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const transferZeedzItem = async (sender, recipient, itemId) => {
  const name = "zeedz_items/transfer_zeedz_item";
  const args = [recipient, itemId];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

/*
 * Returns the ZeedzItem NFT metadata with the provided **id** from an account collection.
 * @param {string} account - account address
 * @param {UInt64} itemID - NFT id
 * @throws Will throw an error if execution will be halted
 * @returns {String: String}
 * */
export const getZeedzItemMetadata = async (account, itemID) => {
  const name = "zeedz_items/get_zeedz_item_metadata";
  const args = [account, itemID];

  return executeScript({ name, args });
};

/*
 * Returns the number of Zeedz Items in an account's collection.
 * @param {string} account - account address
 * @throws Will throw an error if execution will be halted
 * @returns {UInt64}
 * */
export const getZeedzItemCount = async (account) => {
  const name = "zeedz_items/get_collection_length";
  const args = [account];

  return executeScript({ name, args });
};

/*
 * Burns ZeedzItem NFT with id equal **itemId** from **owner** account
 * @param {string} owner - sender address
 * @param {UInt64} itemId - id of the item to burn
 * @throws Will throw an error if execution will be halted
 * @returns {Promise<*>}
 * */
export const burnZeedzItem = async (owner, itemId) => {
  const name = "zeedz_items/burn_zeedz_item";
  const args = [itemId];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};
