export { cleanText, dmsToDecimal, findAll, toJSON };

/**
 * Cleanup spaces and crap from within an Cheerio HTML tag
 * @param ch
 * @returns {Function}
 */
function cleanText(ch) {
  return function(_i, _el) {
    let text = ch(this).text();
    return text.replaceAll(/\s{2,}/g, ' ').trim();
  }
}


function findAll(str, grail) {
  let found = [];
  let pos = str.indexOf(grail);
  while (pos >= 0) {
    found.push(pos);
    pos = str.indexOf(grail, pos+1)
  }
  return found;
}


/**
 * Convert Degrees Minutes Seconds format to decimal
 * @param dms      DD MM SS[NSEW]
 * @param digits   resolution
 * @returns {number}
 */
function dmsToDecimal(dms, digits = 5) {
  if (!dms)
    return NaN;

  let NSEW = dms[dms.length-1].toUpperCase();  // save then remove final NSEW
  dms = dms.substring(0, dms.length-1);

  let [d,m,s] = dms.split(' ').map((n) => Number(n) || 0.0);

  let decS = (d + m/60.0 + s/3600.0).toFixed(digits);         // a String
  return ((NSEW === 'S') || (NSEW === 'W')) ? -decS : +decS;  // back to a number
}


/**
 * Convert array of aids to nice JSON
 * @param list
 * @param meta
 * @param listKey
 * @returns {string}
 */
function toJSON(list, meta, listKey = "aids") {
  meta = meta || {};
  meta.date = meta.date || new Date().toISOString();
  let ob = {
    meta,
  };
  ob[listKey] = list;

  return JSON.stringify(ob, null, 2)
}
