# aids-to-navigation
Compile a JSON file of Canadian and US Aids to Marine Navigation (buoys, lights, etc...)

## Usage
```text
 aids-to-navigation --help            usage message
 aids-to-navigation [us | ca | all]   do USA, Canada, or both
 aids-to-navigation reg1 reg2...      do only certain regions (see below)
```
(You could also use `node CLI.js ...`)

### Regions

#### Canada
```text
 ca -> all of these
 newfoundland
 atl
 inland-waters
 pac
```

#### USA

 -[Details of Light Lists](https://navcen.uscg.gov/?pageName=lightListWeeklyUpdates)
 -[Map of US Regions](https://navcen.uscg.gov/images/map.jpg)

```text
 us -> all of these
 us1   District 1  (New England)
 us2   District 5  (Mid Atlantic)
 us3   District 7  (Southeast)
 us4   District 8  (Gulf of Mexico)
 us5   District 8  (Western)
 us6   District 11 (Southwest)
 us7   District 13 (Northwest)
 us8   District 14 (Hawaii)
 us9   District 17 (Alaska)
 us10  District 9  (Great Lakes)
```

## Implementation

### Canada

First, the HTML at https://www.notmar.gc.ca/list-lights is parsed to find all relevant HTML urls by region.  _e.g._ https://www.notmar.gc.ca/publications/list-lights/pac/p1-en
Parse that HTML ("List of lights, Buoys and Fog Signals") to get the data for the navigational aids

### USA

For each region requested, get the XML from https://navcen.uscg.gov/?Do=weeklyLLCXML&id=${region}
Parse the XML to get the data for the navigational aids

### Data for each Navigational Aid

 - id: Identification Code, prefixed by "CA_" or "US_"
 - type: F, Fl, Oc, etc...  Fixed, Flashing, Occulting etc...
  - a.k.a. "Characteristic", [Details here](https://en.wikipedia.org/wiki/Light_characteristic) [or here](https://www.ccg-gcc.gc.ca/publications/maritime-security-surete-maritime/aids-aides-navigation/page09-eng.html)
 - color: W white, R red, G green, Y yellow, Or Orange or Bu blue
 - period: the time in seconds needed for one complete cycle of changes
 - positionDMS: { lat, lon } in Degrees Minutes Seconds (a string)
 - lat: latitude in degrees
 - lon: longitude in degrees
 - height: height _in meters_
 - range: nominal range _in kilometers_
 - description
 - remarks (US only)

#### Example Data:

```json
{
  "id": "CA_1",
  "name": "Two Mile Point",
  "type": "Fl",
  "color": "R",
  "period": "4s",
  "positionDMS": {
    "lat": "49 31 14.1N",
    "lon": "117 15 41.8W"
  },
  "lat": 49.52058,
  "lon": -117.26161,
  "height": 9.4,
  "range": 5,
  "description": "On 3-pile dolphin, red and white triangular daymark."
}
```

## What might you do with this?

The data doesn't change often, so you needn't run this all that often.  On my 6 year old budget laptop it takes about 1 minute.

`db/all.json` contains _all_ the navigational aids, as of 30 January 2022.
One thing you might do is use [json-server](https://github.com/typicode/json-server) 

 1. json-server --ro path/to/db/all.json
 2. then `http://localhost:3000/aids/?lat_lte=-0.1` brings up 18 navigational aids that are south of the Equator.

## TODOs

 1. I haven't yet tried it yet with [json-graphql-server](https://github.com/marmelab/json-graphql-server/issues)
 2. Some of the positions parse to `0 or NaN`, need to debug that.
 3. Some of the description or remark fields contain `\n` or other cruft.  (A lot of cruft is removed!)
 4. Add a little more meta data to the results - a count, time elapsed, ???

