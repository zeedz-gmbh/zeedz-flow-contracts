import path from "path";
import { emulator, init, shallPass, shallResolve } from "flow-js-testing";

import { deployZeedzDrops, getSaleCutRequirements, getAllProductIds } from "../src/zeedz_drops";

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
});
