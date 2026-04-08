const axios = require("axios");
const fs = require("fs");

const API_KEY = "API_KEY_HERE";

const buildings = [
  // === TEMPE CAMPUS ===
  { code: "WGHL",    name: "Wrigley Hall",                          campus: "tempe"},
  { code: "ENGRC",   name: "Engineering Research Center",           campus: "tempe"},
  { code: "COOR",    name: "Coor Hall",                             campus: "tempe"},
  { code: "PSY",     name: "Psychology Building",                   campus: "tempe"},
  { code: "LSE",     name: "Life Sciences E",                       campus: "tempe"},
  { code: "LSC",     name: "Life Sciences Center",                  campus: "tempe"},
  { code: "FULTN",   name: "Fulton Center",                         campus: "tempe"},
  { code: "ECG",     name: "Engineering Center G-Wing",             campus: "tempe"},
  { code: "BYENG",   name: "Brickyard Engineering",                 campus: "tempe"},
  { code: "BRICKYARD", name: "Brickyard",                           campus: "tempe"},
  { code: "MU",      name: "Memorial Union",                        campus: "tempe"},
  { code: "NOBLE",   name: "Noble Library",                         campus: "tempe"},
  { code: "LIB",  name: "Hayden Library",                        campus: "tempe"},
  { code: "MCLL",    name: "Modern Languages",                      campus: "tempe"},
  { code: "LSN",     name: "Life Sciences North",                   campus: "tempe"},
  { code: "ISTB4",   name: "Interdisciplinary Science & Tech 4",    campus: "tempe"},
  { code: "BATMN",   name: "Batman Building (ISTB4)",               campus: "tempe"},
  { code: "SANCA",   name: "Santan A",                              campus: "tempe"},
  { code: "ARTS",    name: "Arts Building",                         campus: "tempe"},
  { code: "FA",      name: "Fine Arts",                             campus: "tempe"},
  { code: "NEEB",    name: "Neeb Hall",                             campus: "tempe"},
  { code: "SS",      name: "Social Sciences",                       campus: "tempe"},
  { code: "SOSSB",   name: "Social Sciences South B",              campus: "tempe"},
  { code: "BAC",     name: "Business Administration C",             campus: "tempe"},
  { code: "BUSA",    name: "Business Administration A",             campus: "tempe"},
  { code: "BUSN",    name: "Business Administration N",             campus: "tempe"},
  { code: "TYLER",   name: "Tyler Mall",                            campus: "tempe"},
  { code: "GWC",     name: "Goldwater Center",                      campus: "tempe"},
  { code: "SCOB",    name: "SCAI Building",                         campus: "tempe"},
  { code: "ECA",     name: "Engineering Center A",                  campus: "tempe"},
  { code: "ECF",     name: "Engineering Center F",                  campus: "tempe"},
  { code: "CAVC",    name: "Career & Professional Development",     campus: "tempe"},
  { code: "CPCOM",   name: "Cronkite School",                       campus: "tempe"},
  { code: "HLTH",    name: "Health North",                          campus: "tempe"},
  { code: "LAGUNA",  name: "Laguna Hall",                           campus: "tempe"},
  { code: "MOEUR",   name: "Moeur Hall",                            campus: "tempe"},
  { code: "PAYNE",   name: "Payne Hall",                            campus: "tempe"},
  { code: "FQST",    name: "Farmer Education Building",             campus: "tempe"},
  { code: "CHEM",    name: "Chemistry Building",                    campus: "tempe"},
  { code: "PHYX",    name: "Physical Sciences F Wing",              campus: "tempe"},
  { code: "WXLR",    name: "Walton Center for Planetary Health",    campus: "tempe"},
  { code: "CIDSE",   name: "Computing & Informatics Design",        campus: "tempe"},
  { code: "SEMTE",   name: "SEMTE Building",                        campus: "tempe"},
  { code: "WLSN",    name: "Wilson Hall",                           campus: "tempe"},
  
    // === WEST CAMPUS ===
  { code: "CLCC",    name: "Classroom Central West",               campus: "west"},
  { code: "CAVC_W",  name: "Community Collaboration Area",         campus: "west"},
  { code: "CCTC",    name: "Classroom & Technology Center",        campus: "west"},
  { code: "UACB",    name: "University Academic Center B",         campus: "west"},
  { code: "UACA",    name: "University Academic Center A",         campus: "west"},
  { code: "LLAC",    name: "Liberal Arts and Sciences",            campus: "west"},
  // === POLYTECHNIC CAMPUS ===
  { code: "AAMU",    name: "Academic Advising & Memorial Union",   campus: "polytechnic"},
  { code: "ALTEC",   name: "ALTEC Building",                       campus: "polytechnic"},
  { code: "SANTAN",  name: "Santan Hall Polytechnic",              campus: "polytechnic"},
  { code: "POLY",    name: "Polytechnic Academic Center",          campus: "polytechnic"},
  { code: "WANNER",  name: "Wanner Engineering Center",           campus: "polytechnic"},
  // === DOWNTOWN PHOENIX CAMPUS ===
  { code: "UCENT",   name: "University Center Building",          campus: "downtown"},
  { code: "TCOM",    name: "Technology Center",                   campus: "downtown"},
  { code: "CITYSQ",  name: "City Square",                         campus: "downtown"},
  { code: "UNION",   name: "University Center North",             campus: "downtown"},

];


async function findPlace(building) {
  const query = `${building.name} Arizona State University ${building.campus} campus`;

  const url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";

  const res = await axios.get(url, {
    params: {
      input: query,
      inputtype: "textquery",
      fields: "name,geometry,place_id",
      key: API_KEY
    }
  });

  const candidate = res.data.candidates[0];

  if (!candidate) {
    console.log("No result:", building.name);
    return null;
  }

  if (!candidate.name.toLowerCase().includes(building.name.toLowerCase())) {
    console.log("Mismatch:", building.name, "→", candidate.name);
  }

  return {
    ...building,
    lat: candidate.geometry.location.lat,
    lng: candidate.geometry.location.lng,
    place_id: candidate.place_id
  };
}

async function run() {
  const output = [];

  for (let i = 0; i < buildings.length; i++) {
    const building = buildings[i];

    console.log(`Processing ${i + 1}/${buildings.length}: ${building.name}`);

    const result = await findPlace(building);

    if (result) {
        console.log(`✅ Success: ${building.name}`);
        output.push(result);
    } else {
        console.log(`❌ Failed: ${building.name}`);
    }

    await new Promise(r => setTimeout(r, 200));
}

  fs.writeFileSync(
    "asu_buildings.json",
    JSON.stringify(output, null, 2)
  );


  console.log(JSON.stringify(output, null, 2));
}

run();