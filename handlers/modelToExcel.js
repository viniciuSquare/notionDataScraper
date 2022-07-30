const XLSX = require('xlsx');

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

module.exports = { arrayToExcel }