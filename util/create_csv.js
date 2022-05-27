const fs = require("fs");
const path = require("path");
const { format } = require("@fast-csv/format");

const REGEXP_IMPORT = /(\s*import\s*)([\w\d]+)(\s+from\s*)([\w\d".\\/]+)/g;

const addressMap = {
  FungibleToken: "0x0",
  NonFungibleToken: "0x0",
  OnChainMultiSig: "0x0",
  NFTStorefront: "0x0",
  FUSD: "0x0",
  FlowToken: "0x0",
  FiatToken: "0x0",
  OnChainMultiSig: "0x0",
  TokenForwarding: "0x0",
  DapperUtilityCoin: "0x0",
  ZeedzINO: "0x0",
  ZeedzDrops: "0x0",
  ZeedzMarketplace: "0x0",
};

/**
 * Returns Cadence template code with replaced import addresses
 * @param {string} code - Cadence template code.
 * @param {{string:string}} [addressMap={}] - name/address map or function to use as lookup table
 * for addresses in import statements.
 * @param byName - lag to indicate whether we shall use names of the contracts.
 * @returns {*}
 */
const replaceImportAddresses = (code, addressMap, byName = true) => {
  return code.replace(REGEXP_IMPORT, (match, imp, contract, _, address) => {
    const key = byName ? contract : address;
    const newAddress = addressMap instanceof Function ? addressMap(key) : addressMap[key];

    // If the address is not inside addressMap we shall not alter import statement
    const validAddress = newAddress || address;
    return `${imp}${contract} from ${validAddress}`;
  });
};

function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

async function main() {
  const csvStream = format({ headers: ["location", "code"], escape: '"' });
  const stream = fs.createWriteStream("./contracts.csv");
  csvStream.pipe(stream).on("end", () => process.exit());

  for (const filePath of walkSync("./cadence/")) {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      let location = "";
      if (filePath.includes("contract")) {
        location = `A.0000000000000000.${
          filePath.split("\\").pop().split("/").pop().split(".")[0]
        }`;
      } else if (filePath.includes("transaction")) {
        location = `t.0000000000000000`;
      } else if (filePath.includes("script")) {
        location = `s.0000000000000000`;
      }
      const code = replaceImportAddresses(data, addressMap);
      csvStream.write({ location: location, code: code });
    });
  }
}

main().catch((e) => console.error(e));
