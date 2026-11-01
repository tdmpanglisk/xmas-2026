function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'No data received' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        });
    }
    
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Handle delete action
    if (data.action === 'delete' && data.email) {
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const emailColIndex = headers.indexOf('Email');
      
      if (emailColIndex === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Email column not found' }))
          .setMimeType(ContentService.MimeType.JSON)
          .setHeaders({ "Access-Control-Allow-Origin": "*" });
      }
      
      // Find row with matching email (search from bottom to top for efficiency)
      const rows = allData.slice(1);
      for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i][emailColIndex]?.toLowerCase() === data.email.toLowerCase()) {
          // Sheet rows are 1-indexed, plus 1 for header row
          sheet.deleteRow(i + 2);
          return ContentService
            .createTextOutput(JSON.stringify({ success: true, deleted: true }))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeaders({ "Access-Control-Allow-Origin": "*" });
        }
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Email not found' }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({ "Access-Control-Allow-Origin": "*" });
    }
    
    // Regular RSVP submission
    const foods = (data.foodSelections || []).map(f => `${f.name} (serves ${f.serves}) [${f.category || 'unknown'}]`).join(', ') || 'None';
    const dietary = (data.dietaryRestrictions || []).join(', ') || 'None';
    
    sheet.appendRow([
      new Date(),           
      data.name,            
      data.email,           
      data.phone || '',     
      data.attendance === 'yes' ? 'Attending' : data.attendance === 'maybe' ? 'Maybe' : 'Not Attending',
      data.partySize,       
      foods,                
      dietary,              
      data.specialRequests || ''  
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With"
    });
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          "Access-Control-Allow-Origin": "*"
        });
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const rsvps = rows.map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify(rsvps))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*"
      });
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*"
      });
  }
}