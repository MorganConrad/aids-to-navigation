
import cheerio from "cheerio";
import got from "got";

import { cleanText, dmsToDecimal, findAll } from "./utils.js";

export { getAids_CA, getAids_CA1, findPaths }

const LIST_ROOT = 'https://www.notmar.gc.ca/list-lights';
const AIDS_ROOT = 'https://www.notmar.gc.ca/publications/list-lights/';


/**
 * Main entry.  Get aids from an array of paths
 * @param paths [string]
 * @returns {Promise<Array[aid]>}
 */
async function getAids_CA(paths) {
  let promises = paths.map(function(path) {
    return got(AIDS_ROOT + path).text()
      .then((htmlText) => getAids_CA1(htmlText))
  });

  return Promise.all(promises)
    .then((results) => results.flat());
}


/**
 * Parse all aids from a single html file
 * @param htmlText: string
 * @returns {Promise<Array[aid]>}
 */
async function getAids_CA1(htmlText) {

  let ch = cheerio.load(htmlText);
  let rows = ch('table tr')

  let aids = [];

  for (let i = 2; i < rows.length; i++) {
    let rawTDs = ch(rows[i]).find('td');
    let cleanTDs = rawTDs.map(cleanText(ch));

    let aid = parseAid(cleanTDs);
    if (aid && aid.positionDMS.lat) // some have no position, skip them
      aids.push(aid);
  }

  return aids;
}


/**
 * Parse a single Canadian CG aid from its TDs within a table row
 * @param tds
 * @returns null if unnamed
 *          or {{id: string, name: *, type: string, color: string, period: string, positionDMS: {lat: *|string, lon: *|string}, lat, lon, height: number, range: number, description: *|string}}
 */
function parseAid(tds)
{
  let name = tds[1];

  if (name) {  // there are some unnamed "comment" kinds of objects, ignore

    let positionDMS = getLatLonDMS(tds[3]);

    return {
      id: 'CA_' + tds[0],  // graphql doesn't like floats, so force to a String
      name,
      type: tds[4],
      color: tds[5],
      period: tds[6],
      positionDMS,
      lat: dmsToDecimal(positionDMS.lat),
      lon: dmsToDecimal(positionDMS.lon),
      height: Number(tds[7]) || 0,
      range: Number(tds[8]) || 0,
      description: tds[9] || ''
    }
  }
  else {
    return null;
  }
}

// find and parse position information
function getLatLonDMS(s) {
  let start6 = s.search(/[4-8]\d.*$/);  // could be more robust?
  if (start6 >= 0) {
    s = s.substring(start6)
    let allSpaces = findAll(s, ' ');
    let thirdSpace = allSpaces[2];

    // Note, Canada doesn't include N or W at the end
    return {
      lat: s.substring(0, thirdSpace) + 'N',
      lon: s.substring(thirdSpace + 1) + 'W'
    }
  }
  else
    return { lat: '', lon: ''}
}


const NEWFOUNDLAND_R = /newfoundland\/n(\d*?)-en"/gm;
const ATL_R = /atl\/a(\d*?)-en"/gm;
const INLAND_WATERS_R = /inland-waters\/i(\d*?)-en"/gm;
const PAC_R = /pac\/p(\d*?)-en"/gm;


async function findPaths(url = LIST_ROOT, useThisText) {

  let html = useThisText || await got(url).text();

  return {
    newfoundland:
      Array.from(html.matchAll(NEWFOUNDLAND_R))
           .map((m) => `newfoundland/n${m[1]}-en`),
    atl:
      Array.from(html.matchAll(ATL_R))
           .map((m) => `atl/a${m[1]}-en`),
    inland_waters:
      Array.from(html.matchAll(INLAND_WATERS_R))
           .map((m) => `inland-waters/i${m[1]}-en`),
    pac:
      Array.from(html.matchAll(PAC_R))
           .map((m) => `pac/p${m[1]}-en`)
  }
}
