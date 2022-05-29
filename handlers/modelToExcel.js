const XLSX = require('xlsx')

const mainDirPageId = "d4a386daa319403b9bd767c6be143a86";

async function databasesModelIntoXLSX (databasesIds, workbookName) {
  var workbook = XLSX.utils.book_new()
  
  if(typeof databasesIds == "string") { // IF SINGLE DB
    const structeredModelToXLSX = await getDatabaseStructure(databasesIds).then( props => formatDatabaseStructToArray(props))
    console.log(structeredModelToXLSX);
  
    var worksheet = XLSX.utils.aoa_to_sheet(structeredModelToXLSX);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, dbData.dbName);

    var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
    XLSX.writeFile( workbook, `${workbookName}.xslx`, wopts );
  } else { // IF ARRAY OF IDS
    console.log("LIST OF IDS")


  let worksheets = await Promise.all( databasesIds.map( async (dbData, idx) => {
    let worksheet = await getDatabaseStructure(dbData.id)
      .then( props => {
        var worksheet = XLSX.utils.aoa_to_sheet(formatDatabaseStructToArray(props));
        XLSX.utils.book_append_sheet(workbook, worksheet, dbData.dbName);
        return worksheet;
      })

      return worksheet;
    })
  );
    if(worksheets.length == databasesIds.length) {
      console.log("Caiu");
      var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
      XLSX.writeFile( workbook, `${workbookName}.xlsx`, wopts );

    }
  }
}

async function arrayToExcel(dataList) {
  console.log("Será?")
  console.log(dataList)
  var workbook = XLSX.utils.book_new()
  
  var worksheet = XLSX.utils.aoa_to_sheet([...dataList]);
  console.log("Aqui foi")
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

  var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
  XLSX.writeFileXLSX( workbook, `report.xlsx`, wopts );
  console.log("Done");
}

module.exports = { arrayToExcel }