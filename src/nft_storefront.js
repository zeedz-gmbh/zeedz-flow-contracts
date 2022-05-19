import { deployContractByName, executeScript, mintFlow, sendTransaction } from "flow-js-testing";

import { getZeedzAdminAddress } from "./common";

export const fungibleTokenAddress = "0xee82856bf20e2aa6";

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

export const setupNFTStorefrontOnAccount = async (account) => {
  const name = "nft_storefront/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};
