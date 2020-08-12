## Comunas de Chile

Super simple JS scraper to generate YAML file with communes data extracted from Wikipedia

https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile

## Usage

`npm run start` or `yarn run start`

It will output a single YAML file `communes_chile.yaml` in project's root folder

## Modifying fields

In `index.js` there's an array defined that looks like this:

```javascript
const fields = [
  { name: "name", idx: 1, type: ["string"] },
  { name: "province", idx: 3, type: ["string"] },
  { name: "region", idx: 4, type: ["string"] },
  { name: "lat", idx: 10, type: ["string"] },
  { name: "lng", idx: 11, type: ["string"] },
];
```

- `name` corresponds to the attribute name in YAML file
- `idx` is the `<td>` index (as children of `<tr>`) where the data we want to retrieve is in the table
- `type` is an array of strings defining in priority order what data type the scraper should test for and try to convert. This is useful for example if you are parsing a column of integer type values but there is also a string (e.g `N/A` when data not available) once in a while. This way, the scraper knows what to expect and how to convert data.

You can add or remove items from `fields` to generate different YAML, for example:

```javascript
  { name: 'population', idx: 6, type: ["integer"]}
```
