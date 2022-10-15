const XLSX = require('xlsx');
const { getDatabaseData, getDatabaseModel } = require('./handleStructure');

async function saveDatabasesModelToExcel(databasesMetadata) {
  var workbook = XLSX.utils.book_new()
  const databasesModelAOA = await Promise.all( databasesMetadata
    .map( (databaseMetadata) => getDatabaseModel(databaseMetadata.id)))
      // .then(result => console.log(result));

  console.log(databasesModelAOA);
  databasesModelAOA.forEach( (databaseModel, idx) => {
    var worksheet = XLSX.utils.aoa_to_sheet([...databaseModel]);
  
    XLSX.utils.book_append_sheet(workbook, worksheet, databasesMetadata[idx].name);
  } )

  var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
  XLSX.writeFileXLSX( workbook, `Models - ${ new Date().getDate() } ${ new Date().getMonth() }.xlsx`, wopts );
  console.log("Done");
}

function createDatabaseGuideInExcel( databaseId, workbookName ) {
  getDatabaseData(databaseId)
  .then( ({results}) => arrayToExcel(databaseElementsNameAndIdAOA(results), workbookName ));

  console.log("Guide done");
}

async function arrayToExcel(dataList, workbookName, worksheetName = "Sheet") {
  console.log("Será?")
  // console.log(dataList)
  var workbook = XLSX.utils.book_new()
  
  var worksheet = XLSX.utils.aoa_to_sheet([...dataList]);
  console.log("Aqui foi")
  
  XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

  var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
  XLSX.writeFileXLSX( workbook, `${workbookName} - ${ new Date().getDate() } ${ new Date().getMonth() }.xlsx`, wopts );
  console.log("Done");
}

module.exports = { 
  arrayToExcel, 
  saveDatabasesModelToExcel,
  createDatabaseGuideInExcel
}