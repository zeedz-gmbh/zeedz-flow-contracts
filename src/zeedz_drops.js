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
