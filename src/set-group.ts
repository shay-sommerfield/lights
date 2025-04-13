import { savePartyBulbsToGroup } from "./configuration";

async function main() {
    await savePartyBulbsToGroup();
}
Promise.resolve()
    .then(() => main())
    .catch(console.error);