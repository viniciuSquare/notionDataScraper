const { Client } = require('@notionhq/client');

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
  // console.log(databaseStructureObject);
  let mainPropsStructureArray = [ // PROP NAME AND TYPE
    ["name", "type"],
    ...databaseStructureObject.map( prop => [prop.name, prop.type] )
  ]

  // MAP OTHER PROPS
  databaseStructureObject.forEach( prop => {
    if(prop.options) {
      mainPropsStructureArray.push(["-","-"]);
      mainPropsStructureArray.push([prop.name, prop.type]);
      mainPropsStructureArray.push(...prop.options);
    }
  } )

  console.log(mainPropsStructureArray);

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

function databaseElementsNameAndIdAOA ( databaseResults ) {
  const nameAndIdArray = [
    ["ID", "Title"],
    ...databaseResults.map( page => {
      return [ page.id, getPageTitle(page)]
    } )
  ]

  return nameAndIdArray;
}

// ============================================================

// END MODELING EXTRACTION ------------------------------------------------------

// GETTING NTS REPORTS INTO EXCEL

async function idPropsToArray(databaseResults) {
  // console.log(databaseResults.map( res => res.properties['Created at']))

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

async function getDomainControllersList() {
  const tasksDomainControllersFilter = {
    property: 'Item category',
    select: {
      equals: 'Domain controller',
    },
  }
  const tasksDatabaseId = 'f1abd3b9a124474aa43c5a6478ce9057';

  let tasksDomainControllers = await getPagesList(tasksDatabaseId, tasksDomainControllersFilter);
  let tasksDomainControllersMeta = tasksDomainControllers.map(getRelationsData);

  console.log(tasksDomainControllersMeta);

  return(tasksDomainControllersMeta);
}

/**
 * Get all pages from database query
 * */ 
 async function getPagesList(databaseId, notionApiFilter){
  let queryResult = await notion.databases.query({
    database_id: databaseId,
    filter: notionApiFilter
  })

  let notionPagesList = []
  if (!queryResult.has_more || notionPagesList.length == 0) 
    notionPagesList = [...queryResult.results];
    
  if(queryResult.has_more) {
    while ( queryResult.has_more ) {
      await notion.databases.query({
        database_id: databaseId,
        filter: notionApiFilter,
        start_cursor: queryResult.next_cursor
      }).then( result => {
        queryResult = result;
        notionPagesList.push(...result.results);
      } )
    }
  }

  return notionPagesList;
}


const getPageTitle = (page) => {
  return page.properties.Name.title[0].plain_text
}

const idFromRelation = (relationsArray) => {
  return [ ...relationsArray.map( each => each.id ) ]
}

const getRelationsData = ( notionPage ) => {
  return {
    id: notionPage.id, 
    title: getPageTitle(notionPage),
    subTasks: idFromRelation(notionPage.properties.Subtask.relation),
    logs: idFromRelation(notionPage.properties.LOGS.relation),
    resources: idFromRelation(notionPage.properties.Resources.relation),
  }
}

module.exports = {
  getDatabaseStructureObject,
  getPagesList, getDatabaseModel, databaseElementsNameAndIdAOA,
  getDomainControllersList
}