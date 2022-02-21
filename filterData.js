
import { readFileSync } from "fs";

import { toJSON } from "./utils.js";


/*
  filters and sorts data for use in another project, aids-map
    filters so only lights are kept, and removes duplicates
    sorts so that longer range lights come first.

  usage: node filterData [inputfile]
*/


const args = process.argv.slice(2);

const rawString = readFileSync(args[0] || 'db/all.json', "utf8");
const rawData = JSON.parse(rawString);

const filtered = rawData.aids.filter(filterFn);
const sorted = filtered.sort((a,b) => b.range - a.range)

rawData.meta.filteredDate = new Date().toISOString();

let json = toJSON(sorted, rawData.meta);

console.log("export const alldata = " + json);


function filterFn(a) {
  return a.color &&
         !a.name.endsWith("(C)") &&      // remove Canadian lights from the US list
         !a.name.endsWith("(U.S.)") &&   // remove US lights from the Canadaian list
         !a.type.endsWith("..")
}







