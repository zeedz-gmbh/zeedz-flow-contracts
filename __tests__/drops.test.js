import path from "path";
import {
  emulator,
  init,
  shallPass,
  shallResolve,
  getAccountAddress,
  shallRevert,
} from "flow-js-testing";

import {
  deployZeedzDrops,
  getSaleCutRequirements,
  getAllProductIds,
  addProduct,
} from "../src/zeedz_drops";

import { getZeedzAdminAddress } from "../src/common";

let testProduct = {
  name: "test",
  description: "test description",
  id: 123,
  total: 99,
  saleEnabled: true,
  timeStart: "54525.000",
  timeEnd: "545750.000",
  prices: { FlowToken: "33.0" },
};

// We need to set timeout for a higher number, because some transactions might take up some time
jest.setTimeout(50000);

describe("Zeedz Drops", () => {
  // Instantiate emulator and path to Cadence files
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, "../cadence");
    const port = 8080;
    await init(basePath);
    await emulator.start(port, false);
  });

  // Stop emulator, so it could be restarted
  afterEach(async () => {
    await emulator.stop();
  });

  it("shall deploy the ZeedzDrops contract", async () => {
    // Deploy
    await shallPass(await deployZeedzDrops());
  });

  it("sale reqirements shall be emtpy after contract is deployed", async () => {
    // Deploy
    await deployZeedzDrops();

    const [requirements] = await getSaleCutRequirements();

    // Check Result
    await shallResolve(async () => {
      expect(requirements).toStrictEqual({});
    });
  });

  it("product ids shall be emtpy after contract is deployed", async () => {
    // Deploy
    await deployZeedzDrops();

    const [products] = await getAllProductIds();

    // Check Result
    await shallResolve(async () => {
      expect(products).toStrictEqual([]);
    });
  });

  it("admin shall be able to create a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Transaction Shall Pass
    const { name, description, id, total, saleEnabled, timeStart, timeEnd, prices } = testProduct;

    await shallPass(
      await addProduct(
        name,
        description,
        id,
        total,
        saleEnabled,
        timeStart,
        timeEnd,
        prices,
        ZeedzAdmin,
      ),
    );
  });
  it("non-admin shall not be able to create a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const Bob = await getAccountAddress("Bob");

    // Transaction Shall Pass
    const { name, description, id, total, saleEnabled, timeStart, timeEnd, prices } = testProduct;

    await shallRevert(
      await addProduct(name, description, id, total, saleEnabled, timeStart, timeEnd, prices, Bob),
    );
  });
});
