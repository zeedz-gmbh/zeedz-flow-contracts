import path from "path";
import {
  emulator,
  init,
  shallPass,
  shallResolve,
  getAccountAddress,
  shallRevert,
  mintFlow,
  getFlowBalance,
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
  removeProduct,
  reserveProduct,
  setSaleEnabledStatus,
  setPrices,
  setStartTime,
  setEndTime,
  buyProductWithDiscountFlow,
} from "./src/zeedz_drops";

import { getZeedzAdminAddress } from "./src/common";

let testProduct = {
  name: "test",
  description: "test description",
  id: "123-object-id",
  total: 2,
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
    expect(requirements).toStrictEqual({});
  });

  it("product ids shall be emtpy after contract is deployed", async () => {
    // Deploy
    await deployZeedzDrops();

    const [products] = await getAllProductIds();

    // Check Result
    expect(products).toStrictEqual([]);
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

    expect(details.name).toBe(testProduct.name);
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

    await shallRevert(await getProductDetails(products[323]));
  });

  it("admin shall be able to update FLOW sale cut requirements", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const zeedzCut = await getAccountAddress("zeedzCut");
    const ZeedzAdmin = await getZeedzAdminAddress();

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));
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

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob, ZeedzAdmin));
  });

  it("anyone shall be able to buy a product with admin cosign the salecuts being set and start & end time set", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallPass(await buyProductFlow(products[0], testCognitoID, Bob, ZeedzAdmin));
  });

  it("anyone shall not be able to buy a product with less than enough money and admin cosign", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "19.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob, ZeedzAdmin));
  });

  it("admin shall be able to remove a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const [products] = await getAllProductIds();

    await shallPass(await removeProduct(products[0], ZeedzAdmin));

    const [newProducts] = await getAllProductIds();

    // Check Result
    expect(newProducts).toStrictEqual([]);
  });

  it("admin shall be able to reserve a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const reserveAmount = 2;

    const [products] = await getAllProductIds();

    await shallPass(await reserveProduct(products[0], reserveAmount, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.reserved).toStrictEqual(reserveAmount);
  });

  it("anyone shall not be able to buy a sold out product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const reserveAmount = 2;

    const [products] = await getAllProductIds();

    await shallPass(await reserveProduct(products[0], reserveAmount, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.reserved).toStrictEqual(reserveAmount);

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob));
  });

  it("admin shall be able to set saleEnabled status of a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newStatus = false;

    const [products] = await getAllProductIds();

    await shallPass(await setSaleEnabledStatus(products[0], newStatus, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.saleEnabled).toStrictEqual(newStatus);
  });

  it("anyone shall not be able to buy product with saleEnabled set as false", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newStatus = false;

    const [products] = await getAllProductIds();

    await shallPass(await setSaleEnabledStatus(products[0], newStatus, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.saleEnabled).toStrictEqual(newStatus);

    // Transaction Shall Pass
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));

    await shallRevert(await buyProductFlow(products[0], testCognitoID, Bob));
  });

  it("admin shall be able to set the prices of a product", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newPrices = { "A.0ae53cb6e3f42a79.FlowToken.Vault": "420.00000000" };

    const [products] = await getAllProductIds();

    await shallPass(await setPrices(products[0], newPrices, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.prices).toStrictEqual(newPrices);
  });

  it("admin shall be able to set the startTime of a product if it is less than the current endTime", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newStartTime = "420.00000000";

    const [products] = await getAllProductIds();

    await shallPass(await setStartTime(products[0], newStartTime, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.timeStart).toStrictEqual(newStartTime);
  });

  it("admin shall not be able to set the endTime of a product if the given endTime is less than the current startTime", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newEndTime = "420.00000000";

    const [products] = await getAllProductIds();

    await shallRevert(await setEndTime(products[0], newEndTime, ZeedzAdmin));
  });

  it("admin shall be able to set the endTime of a product if it is greater than the current startTime", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));

    const newStartTime = "420.00000000";

    const [products] = await getAllProductIds();

    await shallPass(await setStartTime(products[0], newStartTime, ZeedzAdmin));

    const newEndTime = "460.00000000";

    await shallPass(await setEndTime(products[0], newEndTime, ZeedzAdmin));

    const [details] = await getProductDetails(products[0]);

    // Check Result
    expect(details.timeEnd).toStrictEqual(newEndTime);
  });

  it("anyone shall be able to buy a product with discount with an admin cosign", async () => {
    // Deploy
    await deployZeedzDrops();

    // Setup
    const ZeedzAdmin = await getZeedzAdminAddress();
    const zeedzCut = await getAccountAddress("zeedzCut");
    const Bob = await getAccountAddress("Bob");

    // Give Bob some money
    await mintFlow(Bob, "69.5");

    const { name, description, id, total, saleEnabled } = testProduct;

    // Transaction Shall Pass
    await shallPass(await addProductTest(name, description, id, total, saleEnabled, ZeedzAdmin));
    await shallPass(await updateSaleCutRequirementsFLOW(zeedzCut, ZeedzAdmin));

    const [products] = await getAllProductIds();

    const discount = 0.2;

    await shallPass(
      await buyProductWithDiscountFlow(products[0], testCognitoID, discount, Bob, ZeedzAdmin),
    );

    const [balance] = await getFlowBalance(Bob);

    const [details] = await getProductDetails(products[0]);

    expect(balance).toStrictEqual("43.10100000"); // 69.5 - (1.0 - discount) * 33.0;
    expect(details.sold).toStrictEqual(1);
  });
});
