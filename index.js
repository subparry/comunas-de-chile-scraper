const cheerio = require("cheerio");
const got = require("got");
const yaml = require("js-yaml");
const fs = require("fs");

const url = "https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile";

const communes = [];

// An array containing indexes, name, and type of <td>s we are interested in
const fields = [
  { name: "name", idx: 1, type: ["string"] },
  { name: "province", idx: 3, type: ["string"] },
  { name: "region", idx: 4, type: ["string"] },
  { name: "lat", idx: 10, type: ["string"] },
  { name: "lng", idx: 11, type: ["string"] },
];

const dataConverters = {
  boolean: (data) => {
    if (/si?/i.test(data)) {
      return true;
    } else if (/no?/i.test(data)) {
      return false;
    } else {
      return null;
    }
  },
  integer: (data) => {
    int = parseInt(data);
    return isNaN(int) ? null : int;
  },
  string: (data) => data.trim().replace(/( {2,}|[\n\r]+)/g, " "),
};

const applyTypeConverters = ({ data, types }) => {
  if (!types || types.length === 0) {
    console.warn(
      `WARNING: Element without data type detected: "${data}". Proceeding without applying transformations. If possible, assign its data type explicitly to silence this warning.`
    );
    return data;
  }
  let result = null;

  types.forEach((type) => {
    if (!dataConverters[type]) {
      throw new Error(`Data converter not found for data type: "${type}"`);
    }
    if (result !== null && result !== undefined) {
      // If we have successfully applied a data transformation, skip remaining data types
      return;
    } else {
      try {
        result = dataConverters[type](data);
      } catch (error) {
        result = null;
      }
    }
  });

  if (result === null || result === undefined) {
    // None of the transformations worked!
    throw new Error(
      `Could not successfully convert "${data}" with any converter! 
      Tried with: "${types.join(",")}"`
    );
  }
  return result;
};

got(url).then((response) => {
  const $ = cheerio.load(response.body);
  $(".wikitable tbody tr").each((index, tr) => {
    if (index === 0) return;
    const newCommune = {};
    const tds = $(tr).find("td");
    fields.forEach((f) => {
      const td = tds[f.idx];
      let text = applyTypeConverters({
        data: $(td).text(),
        types: f.type,
      });
      newCommune[f.name] = text;
    });
    communes.push(newCommune);
  });

  fs.writeFileSync("communes_chile.yaml", yaml.dump(communes));
  console.log('File "communes_chile.yaml" created successfully!');
});
