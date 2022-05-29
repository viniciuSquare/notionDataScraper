const { Client } = require('@notionhq/client');
const XLSX = require("xlsx");
const { arrayToExcel } = require('./modelToExcel');
const notion = new Client({ auth: 'secret_Yl3temCAn0VjVRPUCEOTkJ4XtWAygEx41iRAL36WKcl' });

async function getDatabaseStructure(database_id) {
  console.log(database_id)
  const response = await notion.databases.retrieve({
    database_id: database_id
  })

  const getPropsStructure = propKey => {
    let formattedProp = {
      name: propKey,
      type: response.properties[propKey].type
    }

    if(response.properties[propKey].multi_select)
      formattedProp.options = response.properties[propKey].multi_select.options.map(option=> [option.name, option.color])
    if(response.properties[propKey].select)
      formattedProp.options = response.properties[propKey].select.options.map(option=> [option.name, option.color])
    if(response.properties[propKey].relation)
      formattedProp.relation = response.properties[propKey].relation.synced_property_name

    return formattedProp
  }

  const databaseProperties = Object.keys(response.properties)
    .map( getPropsStructure )

  return databaseProperties
}

function formatNameNTypeStructureToArray(databaseStructure) { 
  let completeStructure = []
  let mainPropsStructureArray = [ // PROP NAME AND TYPE
    ["name", "type"],
    ...databaseStructure.map( prop => [prop.name, prop.type] )
  ]
  
  completeStructure.push(mainPropsStructureArray);

  return mainPropsStructureArray
}

async function servicesListToArray(pageList) {
  const sheetArray = [
    [ "Name", "Status", "Ultima visualização", "url", "Atribuido para" ],
    ...pageList.map( ({properties: page}) => {
      return [
        page.Name.title[0].plain_text,
        page.State.select.name,
        page['Last viewed'].date?.start,
        page.URL.url,
        page['Atribuído para'].date?.start,
      ]
    })
  ];
  return sheetArray
}

async function getOSsRelation(){
  const databaseId = 'bf733aac73d9415eb116c47f1a9815ed';
  const ossList = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: 'Item category',
          select: {
            equals: 'OS - eSolution',
          },
        },
        {
          property: 'State',
          select: {
            does_not_equal: 'Done'
          }
        }
      ],
      
    },
  })
  const ossArray = await servicesListToArray(ossList.results);
  
  arrayToExcel(ossArray);
  
}

module.exports = {
  getDatabaseStructure,
  getOSsRelation

}