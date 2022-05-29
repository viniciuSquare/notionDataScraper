// const { Client } = require("@notionhq/client");
const { getOSsRelation } = require("./handlers/handleStructure");
const { databasesModelIntoXLSX, getDatabaseStructure, formatDatabaseStructToArray } = require("./handlers/modelToExcel");

const personalDatabasesIds = [
  {
    dbName: "tasks",
    id: "f1abd3b9a124474aa43c5a6478ce9057"
  }, 
  {
    dbName: "logs",
    id: "6ccd1c56c75348ac98157e6080087276"
  }, 
  {
    dbName: "practices",
    id: "663adafd7349486b8b2b61cfdfc32ce5"
  }, 
  {
    dbName: "devdocs",
    id: "c6eccfd11ecf42a7b9a63340048d08a3"
  }, 
  {
    dbName: "resources",
    id: "4e2a410ee46b47dca21390428a9844ca"
  },
  {
    dbName: "domains",
    id: "6ddc56719e4f4e02bc522e14134abbe2"
  },
];

const workDatabasesIds = [
  {
    dbName: "Atividades",
    id: "bf733aac73d9415eb116c47f1a9815ed"
  }, 
  {
    dbName: "Logs",
    id: "1249b009ac124295a543726e46b1b2b2"
  }, 
  {
    dbName: "Projetos",
    id: "2c9c9dae2d0d4430bca30ecd39fcf44d"
  }, 
  {
    dbName: "Setores e Locais",
    id: "2e4f7fca8edd4bd18fd0d562f8cc2e34"
  }, 
  {
    dbName: "Resources",
    id: "87cb06e4f3834bdfb8a9c8b541746125"
  }
];

getOSsRelation();