// Paste this file into the Google Apps Script project attached to the spreadsheet.
function getSheet(name, createIfMissing) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  return spreadsheet.getSheetByName(name || 'Sheet1') || (createIfMissing ? spreadsheet.insertSheet(name) : null);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.customData) return saveCustomData(payload.customData);
    const tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    const sheet = getSheet('Sheet1');
    if (!sheet) throw new Error('Sheet1 was not found.');

    const headers = [
      'ID', 'Tool', 'Scope', 'Design', 'Maker', 'Written Date', 'Target',
      'Planned Activities', 'Done', 'Completed On', 'Remarks'
    ];

    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    if (tasks.length) {
      const rows = tasks.map(task => [
        String(task.id || ''), task.tool || '', task.scope || '', task.design || '',
        task.maker || '', task.writtenDate || '', task.targetDate || '',
        task.planned || '', task.done ? 'TRUE' : 'FALSE',
        task.completedDate || '', task.remark || ''
      ]);
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    return jsonResponse({ success: true, message: `Saved ${tasks.length} rows.` });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function doGet(e) {
  try {
    if (e && e.parameter && e.parameter.mode === 'custom') return getCustomData();
    const sheet = getSheet('Sheet1');
    if (!sheet) throw new Error('Sheet1 was not found.');

    const data = sheet.getDataRange().getValues();
    const timeZone = Session.getScriptTimeZone();
    const formatDate = value => value instanceof Date
      ? Utilities.formatDate(value, timeZone, 'yyyy-MM-dd')
      : String(value || '');

    const tasks = data.slice(1).map(row => ({
      id: String(row[0] || `${Date.now()}-${Math.random()}`),
      tool: row[1] || '', scope: row[2] || 'Newtool', design: row[3] || '',
      maker: row[4] || '', writtenDate: formatDate(row[5]),
      targetDate: formatDate(row[6]), planned: row[7] || '',
      done: row[8] === true || row[8] === 'TRUE',
      completedDate: formatDate(row[9]), remark: row[10] || ''
    }));

    return jsonResponse({ success: true, tasks });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function saveCustomData(customData) {
  try {
    const sheet = getSheet('Sheet2', true);
    if (!sheet) throw new Error('Sheet2 was not found.');
    const headers = ['Record Type', 'ID', 'Template ID', 'Name', 'Payload', 'Updated At'];
    const templates = Array.isArray(customData.templates) ? customData.templates : [];
    const instances = Array.isArray(customData.instances) ? customData.instances : [];
    const rows = [
      ...templates.map(t => ['template', String(t.id), '', t.title || '', JSON.stringify(t), t.createdAt || '']),
      ...instances.map(i => ['checksheet', String(i.id), String(i.templateId || ''), i.name || '', JSON.stringify(i), i.updatedAt || ''])
    ];
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    return jsonResponse({ success: true, message: `Saved ${rows.length} custom-list records.` });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function getCustomData() {
  try {
    const sheet = getSheet('Sheet2', true);
    if (!sheet) throw new Error('Sheet2 was not found.');
    const rows = sheet.getDataRange().getValues().slice(1);
    const customData = { templates: [], instances: [] };
    rows.forEach(row => {
      if (!row[4]) return;
      const record = JSON.parse(row[4]);
      if (row[0] === 'template') customData.templates.push(record);
      if (row[0] === 'checksheet') customData.instances.push(record);
    });
    return jsonResponse({ success: true, customData: customData });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
