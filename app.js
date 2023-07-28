const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
const camelCase = (obj) => {
  var newObj = {};
  for (d in obj) {
    if (obj.hasOwnProperty(d)) {
      newObj[
        d.replace(/(\_\w)/g, function (k) {
          return k[1].toUpperCase();
        })
      ] = obj[d];
    }
  }
  return newObj;
};
let db = null;
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3006, () => {
      console.log("Server running at http://localhost:3006/");
    });
  } catch (e) {
    console.log(`${e.message}`);
  }
};
initialize();

// API 1
app.get("/states/", async (request, response) => {
  const getQuery = `SELECT * FROM state;`;
  try {
    const x = await db.all(getQuery);
    const result = x.map((each) => camelCase(each));
    response.send(result);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  try {
    const x = await db.get(getQuery);
    const result = camelCase(x);
    response.send(result);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 3
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const getQuery = `
        INSERT INTO district (district_name,state_id,cases,cured,active,deaths) 
        VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths});;`;
  try {
    const x = await db.run(getQuery);
    console.log({ x });
    response.send("District Successfully Added");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  try {
    const x = await db.get(getQuery);
    response.send(camelCase(x));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `DELETE FROM district WHERE district_id = ${districtId};`;
  try {
    const x = await db.run(getQuery);
    response.send("District Removed");
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const getQuery = `UPDATE district 
    SET
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
    WHERE
        district_id = ${districtId};`;
  try {
    const x = await db.run(getQuery);
    response.send("District Details Updated");
  } catch (e) {
    console.log(`${e.message}`);
  }
});
// API 7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `
        SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths FROM
        district WHERE state_id = ${stateId};`;
  try {
    const stats = await db.get(getQuery);
    response.send(stats);
  } catch (e) {
    console.log(`${e.message}`);
  }
});

// API 8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `
        SELECT state.state_name FROM state INNER JOIN district ON state.state_id = district.state_id
        WHERE district_id = ${districtId};`;
  try {
    const x = await db.get(getQuery);
    response.send(camelCase(x));
  } catch (e) {
    console.log(`${e.message}`);
  }
});

module.exports = app;
