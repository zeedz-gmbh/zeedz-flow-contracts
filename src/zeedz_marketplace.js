import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

/*
 * Deploys NonFungibleToken, NFTStorefront and ZeedzMarketplace contracts to ZeedzAdmin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployZeedzMarketplace = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin, NFTStorefront: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzMarketplace", addressMap });
};

/**
 * Updates the SaleCut Reqirements on the ZeedzMarketplace
 * @param {account} market market address
 * @param {account} offset offset address
 * @param {account} admin admin
 * @returns
 */
export const updateSaleCutRequirements = async (market, offset, admin) => {
  const name = "zeedz_marketplace/update_sale_cut";
  const args = [market, offset];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const sellZeedzINO = async (id, price, owner) => {
  const name = "zeedz_marketplace/sell_item";
  const args = [id, price];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

export const buyZeedzINO = async (sender, seller, listingId, buyPrice) => {
  const name = "zeedz_marketplace/buy_item";
  const args = [listingId, seller, buyPrice];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

export const buyZeedzINOIncreaseOffset = async (sender, admin, seller, listingId, buyPrice) => {
  const name = "zeedz_marketplace/buy_item_offset";
  const args = [listingId, seller, buyPrice];
  const signers = [sender, admin];

  return sendTransaction({ name, args, signers });
};

/*
 * Returns ZeedzMarketplace SaleCut Requrements
 * @throws Will throw an error if execution will be halted
 * @returns {[SaleCutRequirements]} - array of SaleCut Requirements
 * */
export const getSaleCutRequirements = async () => {
  const name = "zeedz_marketplace/get_sale_cut_requirements";

  return executeScript({ name });
};

export const getListingIDs = async () => {
  const name = "zeedz_marketplace/get_listing_ids";

  return executeScript({ name });
};

export const logMarketplace = async () => {
  const name = "zeedz_marketplace/log_marketplace";

  return executeScript({ name });
};
