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
