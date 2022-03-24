import {
  getAccountAddress,
  deployContractByName,
  sendTransaction,
  mintFlow,
} from "flow-js-testing";

const UFIX64_PRECISION = 8;

// UFix64 values shall be always passed as strings
export const toUFix64 = (value) => value.toFixed(UFIX64_PRECISION);

export const getZeedzAdminAddress = async () => getAccountAddress("ZeedzAdmin");

export const deployNonFungibleToken = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await deployContractByName({ to: ZeedzAdmin, name: "NonFungibleToken" });
};

export const deployFUSD = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  await mintFlow(ZeedzAdmin, "10.0");
  await deployContractByName({ to: ZeedzAdmin, name: "FUSD", addressMap });
};

export const deployUSDC = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await mintFlow(ZeedzAdmin, "20.0");
  const addressMap = { NonFungibleToken: ZeedzAdmin };
  await deployContractByName({ to: ZeedzAdmin, name: "OnChainMultiSig" });
  return deployContractByName({ to: ZeedzAdmin, name: "FiatToken", addressMap });
};

/*
 * Setups a FUSD vault on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupFUSDOnAccount = async (account) => {
  const name = "fusd/setup_account";
  const signers = [account];

  return sendTransaction({ name, signers });
};
