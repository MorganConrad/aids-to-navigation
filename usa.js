import got from "got";
import parseXml from '@rgrove/parse-xml';

import { dmsToDecimal } from "./utils.js";

export { getAids_US, getAids_US1 }


/**
 * Main entry, parse aids from an array of regions (1-10)
 * @param regions Array[r]  r in 1-10
 * @returns {Promise<Array[aid]>}
 */
async function getAids_US(regions) {
  let promises = regions.map(function(r) {
    return got(`https://navcen.uscg.gov/?Do=weeklyLLCXML&id=${r}`).text()
      .then((xmlText) => getAids_US1(xmlText));
  });

  return Promise.all(promises)
    .then((results) => results.flat());
}


/**
 * Parse an array of aids from a single XML file
 * @param xmlText
 * @returns {Promise<Array[aid]>}
 */
async function getAids_US1(xmlText) {
  // let text = await got(`https://navcen.uscg.gov/?Do=weeklyLLCXML&id=${index}`).text();
  const xmlDoc = parseXml(xmlText, "application/xml");
  let useful = xmlDoc.children[0].children[1];

  let aids = [];
  for (let aidXML of useful.children) {
    let aid = parseAidUS(aidXML);
    if (aid && aid.positionDMS.lat)  // some have no position, skip them
      aids.push(aid);
  }

  return aids;
}

/**
 * Parse a single USCG aid from it's XML element
 * @param el  XML
 * @returns {{id: string, name: *, type: string, color: string, period: string, positionDMS: {lat: *|string, lon: *|string}, lat, lon, height: number, range: number, description: *|string, remarks: *|string}}
 */
function parseAidUS(el) {

  let raw = {};  // collect named XML fields
  for (let c of el.children) {
    let key = c.name;
    if (key)
      raw[key] = c.text;
  }

  let characteristic = raw.Characteristic || '   ';
  let [type, color, period] = characteristic.split(' ');

  // Buoys have nothing, Fixed have no period, paranoid cleanup
  type = type || '';
  color = color || '';
  period = period || '';

  // USCG uses '-' instead of space as delimiters, replace with spaces
  // DMS = "degree minute second" format
  let positionDMS = {
    lat: raw.Position_x0020__x0028_Latitude_x0029_.replaceAll('-', ' ') || '',
    lon: raw.Position_x0020__x0028_Longitude_x0029_.replaceAll('-', ' ') || ''
  };

  let aid = {
    id: 'US_' + raw.LLNR,  // Force to string because graphql doesn't like floats
    name: raw.Aid_x0020_Name,
    type,
    color,
    period,
    positionDMS,
    lat: dmsToDecimal(positionDMS.lat),
    lon: dmsToDecimal(positionDMS.lon),
    height: +(raw.Height*0.3048).toFixed(1),  // convert feet to meters
    range : +raw.Range,                       // nautical miles
    description: raw.Structure || '',
    remarks: raw.Remarks || ''
  }

  return aid;
}

