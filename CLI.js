#!/usr/bin/env node

import * as canada from "./canada.js";
import * as usa from "./usa.js";
import * as utils from "./utils.js";

const USAGE = `
  usage: node CLI.js [ca | us | all | more... ] [--help]
  or see https://github.com/MorganConrad/aids-to-navigation#usage
`;

const CA = ['newfoundland', 'atl', 'inland_waters', 'pac'];

let args = process.argv.slice(2).map((a) => a.toLowerCase())

if (!args.length || args.includes('--help')) {
  console.log(USAGE);
  process.exit(0);
}

if (args.includes('all'))
  args = ["ca", "us"];

let aids = { ca: [], us: [] };

// collect requested Canadian regions
let canadaRegions = [];
if (args.includes('ca'))
  canadaRegions = CA;
else {
  for (let arg of args)
    if (CA.includes(arg))
      canadaRegions.push(arg)
}

if (canadaRegions.length) {
  let allCanadaPaths = await canada.findPaths();
  let requestedPaths = canadaRegions.map((r) => allCanadaPaths[r]);
  aids.ca = await canada.getAids_CA(requestedPaths.flat())
}

let usaRegions = []
if (args.includes('us')) {
  usaRegions = [1,2,3,4,5,6,7,8,9,10];
}
else {
  for (let arg of args)
    if (arg.startsWith('us'))
      usaRegions.push(arg.substring(2));
}

aids.us = await usa.getAids_US(usaRegions)

let allAids = Object.values(aids).flat();

let outputS = utils.toJSON(allAids, { args });

console.log(outputS);
