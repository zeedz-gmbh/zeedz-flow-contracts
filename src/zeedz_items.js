import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const typeID1 = 1;
export const itemMetadataToMint1 = {
  Name: "Secret Key",
  Url: "www.zeedz.io/test",
};

export const deployZeedzItems = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzItems", addressMap });
};

export const setupZeedzItemsOnAccount = async (account) => {
  const name = "zeedz_items/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};

export const getZeedzItemSupply = async () => {
  const name = "zeedz_items/get_zeedz_items_supply";

  return executeScript({ name });
};

export const mintZeedzItem = async (itemType, recipient, metadata) => {
  const ZeedzAdmin = await getZeedzAdminAddress();

  const name = "zeedz_items/mint_zeedz_item";
  const args = [recipient, itemType, metadata];
  const signers = [ZeedzAdmin];

  return sendTransaction({ name, args, signers });
};

export const transferZeedzItem = async (sender, recipient, itemId) => {
  const name = "zeedz_items/transfer_zeedz_item";
  const args = [recipient, itemId];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

export const getZeedzItemMetadata = async (account, itemID) => {
  const name = "zeedz_items/get_zeedz_item_metadata";
  const args = [account, itemID];

  return executeScript({ name, args });
};

export const getZeedzItemCount = async (account) => {
  const name = "zeedz_items/get_collection_length";
  const args = [account];

  return executeScript({ name, args });
};

export const burnZeedzItem = async (owner, itemId) => {
  const name = "zeedz_items/burn_zeedz_item";
  const args = [itemId];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};
