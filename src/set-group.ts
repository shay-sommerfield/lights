import { savePartyBulbsToGroup } from "./configuration";

/**
 * A wrapper that turns the savePartyBulbsToGroup method into
 * a script.
 */
async function main() {
  await savePartyBulbsToGroup();
}
Promise.resolve()
  .then(() => main())
  .catch(console.error);
