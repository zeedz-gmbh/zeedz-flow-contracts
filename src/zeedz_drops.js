import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const fungibleTokenAddress = "0xee82856bf20e2aa6";

export const deployZeedzDrops = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");
  const addressMap = {
    NonFungibleToken: ZeedzAdmin,
    FungibleToken: fungibleTokenAddress,
  };
  return deployContractByName({ to: ZeedzAdmin, name: "ZeedzDrops", addressMap });
};

export const getSaleCutRequirements = async () => {
  const name = "zeedz_drops/get_sale_cut_requirements";
  return executeScript({ name });
};

export const getAllProductIds = async () => {
  const name = "zeedz_drops/get_all_product_ids";
  return executeScript({ name });
};

export const getProductDetails = async (id) => {
  const name = "zeedz_drops/get_product_details";
  const args = [id];
  return executeScript({ name, args });
};

export const addProduct = async (
  productName,
  description,
  id,
  total,
  saleEnabled,
  timeStart,
  timeEnd,
  prices,
  admin,
) => {
  const name = "zeedz_drops/create_product";
  const args = [productName, description, id, total, saleEnabled, timeStart, timeEnd, prices];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const addProductTest = async (productName, description, id, total, saleEnabled, admin) => {
  const name = "zeedz_drops/create_product_test";
  const args = [productName, description, id, total, saleEnabled];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const buyProductFlow = async (id, cognito, user) => {
  const name = "zeedz_drops/buy_product_FLOW";
  const args = [id, cognito];
  const signers = [user];

  return sendTransaction({ name, args, signers });
};

export const updateSaleCutRequirementsFLOW = async (market, admin) => {
  const name = "zeedz_drops/update_sale_cut_FLOW";
  const args = [market];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const removeProduct = async (id, admin) => {
  const name = "zeedz_drops/remove_product";
  const args = [id];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const reserveProduct = async (id, amount, admin) => {
  const name = "zeedz_drops/reserve_product";
  const args = [id, amount];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const setSaleEnabledStatus = async (id, status, admin) => {
  const name = "zeedz_drops/set_sale_enabled_status";
  const args = [id, status];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const setPrices = async (id, prices, admin) => {
  const name = "zeedz_drops/set_prices";
  const args = [id, prices];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const setStartTime = async (id, startTime, admin) => {
  const name = "zeedz_drops/set_start_time";
  const args = [id, startTime];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const setEndTime = async (id, endTime, admin) => {
  const name = "zeedz_drops/set_end_time";
  const args = [id, endTime];
  const signers = [admin];

  return sendTransaction({ name, args, signers });
};

export const buyProductWithDiscountFlow = async (id, cognito, discount, user, admin) => {
  const name = "zeedz_drops/buy_product_discount_FLOW";
  const args = [id, cognito, discount];
  const signers = [user, admin];

  return sendTransaction({ name, args, signers });
};
