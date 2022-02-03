import { readFileSync } from "fs";
import { test } from "tape";
import * as canada from "../canada.js";
import * as usa from "../usa.js";
import * as utils from "../utils.js";

test('canada', async function(t) {
  const html = readFileSync('test/data/CA_pac_p1.html', "utf8");
  let aids = await canada.getAids_CA1(html);
  t.equal(aids.length, 29);
  t.end();
});


test('canada-findPaths', async function(t) {
  const html = readFileSync('test/data/CA_list-lights.html', "utf8");
  let paths = await canada.findPaths("", html);
  t.equal(Object.keys(paths).length, 4);
  t.equal(paths.newfoundland.length, 15);
  t.equal(paths.pac[2], "pac/p26-en");
  t.end();
});


test('usa', async function(t) {
  const html = readFileSync('test/data/V6D14.xml', "utf8");
  let aids = await usa.getAids_US1(html);
  t.equal(aids.length, 718);
  t.end();
});


test('utils-toJSON', function(t) {
  const inJSON = readFileSync('test/data/canada-expected.test.json', "utf8");
  let ob = JSON.parse(inJSON);
  let outJSON = utils.toJSON(ob.aids, ob.meta) + "\n";  // my editors put a CR and end of file
  t.equal(outJSON, inJSON);
  t.end();
});

