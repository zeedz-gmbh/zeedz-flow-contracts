import { getAccountAddress, deployContractByName } from "flow-js-testing";

const UFIX64_PRECISION = 8;

// UFix64 values shall be always passed as strings
export const toUFix64 = (value) => value.toFixed(UFIX64_PRECISION);

export const getZeedzAdminAddress = async () => getAccountAddress("ZeedzAdmin");

export const deployNonFungibleToken = async () => {
  const ZeedzAdmin = await getZeedzAdminAddress();
  await deployContractByName({ to: ZeedzAdmin, name: "NonFungibleToken" });
};
