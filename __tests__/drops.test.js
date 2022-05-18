import path from "path";
import {
  emulator,
  init,
  shallPass,
  shallResolve,
  getAccountAddress,
  shallRevert,
  mintFlow,
} from "flow-js-testing";

import {
  deployZeedzDrops,
  getSaleCutRequirements,
  getAllProductIds,
  addProduct,
  getProductDetails,
  addProductTest,
  buyProductFlow,
  updateSaleCutRequirementsFLOW,
} from "../src/zeedz_drops";

import { getZeedzAdminAddress } from "../src/common";

let testProduct = {
  name: "test",
  description: "test description",
  id: 123,
  total: 99,
  saleEnabled: true,
  timeStart: "1652722543.00000000",
  timeEnd: "1652922543.00000000",
  prices: { "A.0ae53cb6e3f42a79.FlowToken.Vault": "33.0" },
};

let testCognitoID = "test-1233-cognito-aws";

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

  it("anyone shall be able to get product details", async () => {
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

    const [products] = await getAllProductIds();

    const [details] = await getProductDetails(products[0]);

    await shallResolve(async () => {
      expect(details.name).toBe(testProduct.name);
    });
  });

  it("anyone shall not be able to get product details of a prodact that doesn't exist", async () => {
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

    const [products] = await getAllProductIds();

    await shallRevert(await getProductDetails(products[0]));
  });

  it("admin shall be able to update FLOW sale cut requirements", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));
  });

  it("anyone shall not be able to buy a product without the salecuts being set", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    // Transaction Shall Pass
    const { name, description, id, total, saleEnabled } = testProduct;

    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob));
  });

  it("anyone shall be able to buy a product with the salecuts being set and start & end time set", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallPass(await buyProductFlow(products[0], testCognitoID, Bob));
  });
  it("anyone shall not be able to buy a product with less than enough money", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const offsetCut = await getAccountAddress("offsetCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "19.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, offsetCut, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob));
  });
});
