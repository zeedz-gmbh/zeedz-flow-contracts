import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const deployZeedzMarketplace = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin, NFTStorefront: ZeedzAdmin };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzMarketplace", addressMap });
};

export const updateSaleCutRequirementsFLOW = async (market, offset, admin) => {
  const name = "zeedz_marketplace/update_sale_cut_FLOW";
  const args = [market, offset];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const updateSaleCutRequirementsFUSD = async (market, offset, admin) => {
  const name = "zeedz_marketplace/update_sale_cut_FUSD";
  const args = [market, offset];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const updateSaleCutRequirementsUSDC = async (market, offset, admin) => {
  const name = "zeedz_marketplace/update_sale_cut_USDC";
  const args = [market, offset];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const sellZeedzINO = async (id, price, owner) => {
  const name = "zeedz_marketplace/sell_item_FLOW";
  const args = [id, price];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

export const sellZeedzINOFUSD = async (id, price, owner) => {
  const name = "zeedz_marketplace/sell_item_FUSD_and_init";
  const args = [id, price];
  const signers = [owner];

  return sendTransaction({ name, args, signers });
};

export const buyZeedzINO = async (sender, seller, listingId, buyPrice) => {
  const name = "zeedz_marketplace/buy_item_FLOW";
  const args = [listingId, seller, buyPrice];
  const signers = [sender];

  return sendTransaction({ name, args, signers });
};

export const buyZeedzINOIncreaseOffset = async (sender, admin, seller, listingId, buyPrice) => {
  const name = "zeedz_marketplace/buy_item_offset_FLOW";
  const args = [listingId, seller, buyPrice];
  const signers = [sender, admin];

  return sendTransaction({ name, args, signers });
};

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

export const forceRemoveListing = async (admin, listingID) => {
  const name = "zeedz_marketplace/admin_remove_listing";
  const args = [listingID];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const removeListing = async (listingID) => {
  const name = "zeedz_marketplace/remove_listing";
  const args = [listingID];
  return executeScript({ name, args });
};

export const getListings = async (offset, limit) => {
  const name = "zeedz_marketplace/get_listings";
  const args = [offset, limit];
  return executeScript({ name, args });
};
