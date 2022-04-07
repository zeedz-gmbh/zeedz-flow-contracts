import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

// emulator contract address for FungibleToken

export const fungibleTokenAddress = "0xee82856bf20e2aa6";

/*
 * Deploys NFTStorefront contracts to ZeedzAdmin.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployNFTStorefront = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "10.0");

  const addressMap = {
    NonFungibleToken: ZeedzAdmin,
    FungibleToken: fungibleTokenAddress,
  };
  return deployContractByName({
    to: ZeedzAdmin,
    name: "NFTStorefront",
    addressMap,
  });
};

/*
 * Setups NFTStorefront collection on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupNFTStorefrontOnAccount = async (account) => {
  const name = "nft_storefront/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};
