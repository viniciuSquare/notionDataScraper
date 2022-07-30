const { Client } = require('@notionhq/client');
const XLSX = require("xlsx");
const { arrayToExcel } = require('./modelToExcel');
const notion = new Client({ auth: 'secret_3eEi2GSB2eE7oV1HDwuBSHqTGH7Dj7CzCWehqLxoiLh' });

async function getDatabaseModel(databasesId) {
  const modelStructeredToSaveXLSX = await getDatabaseStructureObject(databasesId)
    .then( props => formatDatabaseStructToArray(props));
  
  return modelStructeredToSaveXLSX;  
}

// GET DATABASE STRUCTURE INTO OBJECT
async function getDatabaseStructureObject(databaseId) {
  console.log(databaseId)
  const response = await notion.databases.retrieve({
    database_id: databaseId
  })

  const getPropsStructure = propKey => {
    let formattedProp = {
      name: propKey,
      type: response.properties[propKey].type
    }

    if(response.properties[propKey].multi_select)
      formattedProp.options = response.properties[propKey].multi_select.options
        .map(option=> [option.name, option.color])
    if(response.properties[propKey].select)
      formattedProp.options = response.properties[propKey].select.options
        .map(option=> [option.name, option.color])
    if(response.properties[propKey].relation)
      formattedProp.relation = response.properties[propKey].relation.synced_property_name

    return formattedProp
  }

  const databaseProperties = Object.keys(response.properties)
    .map( getPropsStructure )

  return databaseProperties
}

function formatDatabaseStructToArray(databaseStructureObject) { 
  let mainPropsStructureArray = [ // PROP NAME AND TYPE
    ["name", "type"],
    ...databaseStructureObject.map( prop => [prop.name, prop.type] )
  ]

  return mainPropsStructureArray
}
// UNSED ======================================================
async function getDatabaseData( databaseId ) { 
  const response = await notion.databases.query({
    database_id: databaseId
  })

  console.log(response.results.map( result => result.properties.Name.title[0]));

  return response;
}

function createDatabaseGuideInExcel( databaseId, workbookName ) {
  getDatabaseData(databaseId)
  .then( ({results}) => arrayToExcel(databaseElementsNameAndIdAOA(results), workbookName ));

  console.log("Guide done");
}

function databaseElementsNameAndIdAOA ( databaseResults ) {
  const nameAndIdArray = [
    ["ID", "Title"],
    ...databaseResults.map( page => {
      return [ page.id, page.properties.Name.title[0].plain_text]
    } )
  ]

  return nameAndIdArray;
}
// ============================================================

// END MODELING EXTRACTION ------------------------------------------------------

// GETTING NTS REPORTS INTO EXCEL

async function servicesListToArray(databaseResults) {
  console.log(databaseResults.map( res => res.properties['Created at']))

  const sheetArray = [
    [ "Page URL", "Ticket Nº", "Assunto", "Status", "Categoria", "Setor", "url", "Ultima visualização", "Criado em", "Atribuido para", ],
    ...databaseResults.map( ({properties: page, id}) => {
      let ticketNumber = 0;
      let ticketSubject = "";

      let fixedPageTitle = fixInitialChars(page.Name.title[0].plain_text);

      if (!isNaN(Number(fixedPageTitle.slice(0, 7)))) {
        // IF THERE'S A TICKET NUMBER
        // console.log("UPDATE SUBJECT AND NUMBER");
        ticketNumber = fixedPageTitle.slice(0, 7);
        ticketSubject = fixedPageTitle.slice(7);
        
        ticketSubject = fixInitialChars(ticketSubject);
      } else {
        ticketNumber = " ";
        ticketSubject = fixedPageTitle;
      }

      return [
        `notion.so/${id}`  , 
        ticketNumber,
        ticketSubject == "" && ticketNumber == "" ? fixedPageTitle : ticketSubject,
        page.State.select.name,
        page['Item category'].select.name,
        page.Setor.relation[0]?.id || "Undefined",
        page.URL.url,
        page['Last viewed'].date?.start,
        page['Created at'].created_time,
        page['Atribuído para'].date?.start,
      ]
    })
  ];
  return sheetArray
}

async function getOSsRelation(){
  const databaseId = 'bf733aac73d9415eb116c47f1a9815ed';
  let queryResult = await notion.databases.query({
    database_id: databaseId,
    filter: {
      or: [
        {
          property: 'Item category',
          select: {
            equals: 'OS - eSolution',
          },
        },
        {
          property: 'Item category',
          select: {
            equals: 'OS - Chamado interno',
          },
        },
        {
          property: 'Item category',
          select: {
            equals: 'OS - Faitec',
          },
        },
      ],
      
    },
  })

  let ossList = []
  if (!queryResult.has_more || ossList.length == 0) 
    ossList = [...queryResult.results];
  if(queryResult.has_more) {
    while ( queryResult.has_more ) {
      await notion.databases.query({
        database_id: databaseId,
        filter: {
          or: [
            {
              property: 'Item category',
              select: {
                equals: 'OS - eSolution',
              },
            },
            {
              property: 'Item category',
              select: {
                equals: 'OS - Chamado interno',
              },
            },
            {
              property: 'Item category',
              select: {
                equals: 'OS - Faitec',
              },
            },
          ],
          
        },
        start_cursor: queryResult.next_cursor
      }).then( result => {
        queryResult = result;
        ossList.push(...result.results);
      } )
    }
  }

  const ossArray = await servicesListToArray(ossList);
  
  arrayToExcel(ossArray, "Reports");
}

module.exports = {
  getDatabaseStructureObject, createDatabaseGuideInExcel,
  getOSsRelation, getDatabaseModel
}