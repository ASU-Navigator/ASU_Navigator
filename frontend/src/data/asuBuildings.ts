export type Campus = "tempe" | "west" | "polytechnic" | "downtown";

export type Building = {
  code: string;
  name: string;
  campus: Campus;
  lat: number;
  lng: number;
};

export const ASU_BUILDINGS: Building[] = [
  // === TEMPE CAMPUS ===
  { code: "WGHL",    name: "Wrigley Hall",                          campus: "tempe",       lat: 33.4172, lng: -111.9336 },
  { code: "ENGRC",   name: "Engineering Research Center",           campus: "tempe",       lat: 33.4215, lng: -111.9278 },
  { code: "COOR",    name: "Coor Hall",                             campus: "tempe",       lat: 33.4185, lng: -111.9340 },
  { code: "PSY",     name: "Psychology Building",                   campus: "tempe",       lat: 33.4189, lng: -111.9350 },
  { code: "LSE",     name: "Life Sciences E",                       campus: "tempe",       lat: 33.4210, lng: -111.9315 },
  { code: "LSC",     name: "Life Sciences Center",                  campus: "tempe",       lat: 33.4209, lng: -111.9321 },
  { code: "FULTN",   name: "Fulton Center",                         campus: "tempe",       lat: 33.4213, lng: -111.9330 },
  { code: "ECG",     name: "Engineering Center G-Wing",             campus: "tempe",       lat: 33.4222, lng: -111.9295 },
  { code: "BYENG",   name: "Brickyard Engineering",                 campus: "tempe",       lat: 33.4229, lng: -111.9285 },
  { code: "BRICKYARD", name: "Brickyard",                           campus: "tempe",       lat: 33.4228, lng: -111.9285 },
  { code: "MU",      name: "Memorial Union",                        campus: "tempe",       lat: 33.4199, lng: -111.9370 },
  { code: "NOBLE",   name: "Noble Library",                         campus: "tempe",       lat: 33.4168, lng: -111.9315 },
  { code: "HAYDEN",  name: "Hayden Library",                        campus: "tempe",       lat: 33.4182, lng: -111.9352 },
  { code: "MCLL",    name: "Modern Languages",                      campus: "tempe",       lat: 33.4180, lng: -111.9362 },
  { code: "LSN",     name: "Life Sciences North",                   campus: "tempe",       lat: 33.4213, lng: -111.9328 },
  { code: "ISTB4",   name: "Interdisciplinary Science & Tech 4",    campus: "tempe",       lat: 33.4239, lng: -111.9257 },
  { code: "BATMN",   name: "Batman Building (ISTB4)",               campus: "tempe",       lat: 33.4239, lng: -111.9257 },
  { code: "SANCA",   name: "Santan A",                              campus: "tempe",       lat: 33.4175, lng: -111.9295 },
  { code: "ARTS",    name: "Arts Building",                         campus: "tempe",       lat: 33.4162, lng: -111.9340 },
  { code: "FA",      name: "Fine Arts",                             campus: "tempe",       lat: 33.4155, lng: -111.9342 },
  { code: "NEEB",    name: "Neeb Hall",                             campus: "tempe",       lat: 33.4166, lng: -111.9373 },
  { code: "SS",      name: "Social Sciences",                       campus: "tempe",       lat: 33.4173, lng: -111.9349 },
  { code: "SOSSB",   name: "Social Sciences South B",              campus: "tempe",       lat: 33.4170, lng: -111.9348 },
  { code: "BAC",     name: "Business Administration C",             campus: "tempe",       lat: 33.4197, lng: -111.9320 },
  { code: "BUSA",    name: "Business Administration A",             campus: "tempe",       lat: 33.4203, lng: -111.9326 },
  { code: "BUSN",    name: "Business Administration N",             campus: "tempe",       lat: 33.4200, lng: -111.9325 },
  { code: "TYLER",   name: "Tyler Mall",                            campus: "tempe",       lat: 33.4196, lng: -111.9363 },
  { code: "GWC",     name: "Goldwater Center",                      campus: "tempe",       lat: 33.4219, lng: -111.9312 },
  { code: "SCOB",    name: "SCAI Building",                         campus: "tempe",       lat: 33.4217, lng: -111.9280 },
  { code: "ECA",     name: "Engineering Center A",                  campus: "tempe",       lat: 33.4218, lng: -111.9300 },
  { code: "ECF",     name: "Engineering Center F",                  campus: "tempe",       lat: 33.4221, lng: -111.9290 },
  { code: "CAVC",    name: "Career & Professional Development",     campus: "tempe",       lat: 33.4194, lng: -111.9360 },
  { code: "CPCOM",   name: "Cronkite School",                       campus: "tempe",       lat: 33.4232, lng: -111.9241 },
  { code: "HLTH",    name: "Health North",                          campus: "tempe",       lat: 33.4167, lng: -111.9330 },
  { code: "LAGUNA",  name: "Laguna Hall",                           campus: "tempe",       lat: 33.4165, lng: -111.9280 },
  { code: "MOEUR",   name: "Moeur Hall",                            campus: "tempe",       lat: 33.4157, lng: -111.9380 },
  { code: "PAYNE",   name: "Payne Hall",                            campus: "tempe",       lat: 33.4179, lng: -111.9388 },
  { code: "FQST",    name: "Farmer Education Building",             campus: "tempe",       lat: 33.4187, lng: -111.9305 },
  { code: "CHEM",    name: "Chemistry Building",                    campus: "tempe",       lat: 33.4197, lng: -111.9305 },
  { code: "PHYX",    name: "Physical Sciences F Wing",              campus: "tempe",       lat: 33.4202, lng: -111.9310 },
  { code: "WXLR",    name: "Walton Center for Planetary Health",    campus: "tempe",       lat: 33.4176, lng: -111.9358 },
  { code: "CIDSE",   name: "Computing & Informatics Design",        campus: "tempe",       lat: 33.4226, lng: -111.9270 },
  { code: "SEMTE",   name: "SEMTE Building",                        campus: "tempe",       lat: 33.4211, lng: -111.9288 },
  // === WEST CAMPUS ===
  { code: "CLCC",    name: "Classroom Central West",               campus: "west",        lat: 33.6065, lng: -112.1534 },
  { code: "CAVC_W",  name: "Community Collaboration Area",         campus: "west",        lat: 33.6059, lng: -112.1530 },
  { code: "CCTC",    name: "Classroom & Technology Center",        campus: "west",        lat: 33.6072, lng: -112.1542 },
  { code: "UACB",    name: "University Academic Center B",         campus: "west",        lat: 33.6077, lng: -112.1547 },
  { code: "UACA",    name: "University Academic Center A",         campus: "west",        lat: 33.6082, lng: -112.1553 },
  { code: "LLAC",    name: "Liberal Arts and Sciences",            campus: "west",        lat: 33.6055, lng: -112.1525 },
  // === POLYTECHNIC CAMPUS ===
  { code: "AAMU",    name: "Academic Advising & Memorial Union",   campus: "polytechnic", lat: 33.3053, lng: -111.6784 },
  { code: "ALTEC",   name: "ALTEC Building",                       campus: "polytechnic", lat: 33.3061, lng: -111.6770 },
  { code: "SANTAN",  name: "Santan Hall Polytechnic",              campus: "polytechnic", lat: 33.3048, lng: -111.6792 },
  { code: "POLY",    name: "Polytechnic Academic Center",          campus: "polytechnic", lat: 33.3060, lng: -111.6783 },
  { code: "WANNER",  name: "Wanner Engineering Center",           campus: "polytechnic", lat: 33.3045, lng: -111.6800 },
  // === DOWNTOWN PHOENIX CAMPUS ===
  { code: "UCENT",   name: "University Center Building",          campus: "downtown",    lat: 33.4502, lng: -112.0667 },
  { code: "TCOM",    name: "Technology Center",                   campus: "downtown",    lat: 33.4496, lng: -112.0672 },
  { code: "CITYSQ",  name: "City Square",                         campus: "downtown",    lat: 33.4498, lng: -112.0660 },
  { code: "UNION",   name: "University Center North",             campus: "downtown",    lat: 33.4505, lng: -112.0663 },
];

export const CAMPUS_CENTERS: Record<Campus, { lat: number; lng: number; zoom: number }> = {
  tempe:       { lat: 33.4195, lng: -111.9335, zoom: 15 },
  west:        { lat: 33.6065, lng: -112.1534, zoom: 15 },
  polytechnic: { lat: 33.3053, lng: -111.6784, zoom: 15 },
  downtown:    { lat: 33.4500, lng: -112.0667, zoom: 15 },
};

export const CAMPUS_LABELS: Record<Campus, string> = {
  tempe:       "Tempe",
  west:        "West",
  polytechnic: "Polytechnic",
  downtown:    "Downtown Phoenix",
};
