/**
 * Sympo26Reg — Symposium2026 参加申込みの集計用 Google Apps Script
 *
 * スプレッドシート「Sympo26Reg」にバインドして使います。
 * api/sympo26/register.js から JSON が POST され、シート末尾に1行追記します。
 * 設置手順は同じフォルダの README.md を参照してください。
 */

// 合言葉（空文字なら照合しません）。
// このリポジトリは公開のため、ここは空欄のままにしてあります。
// 実際の合言葉は Apps Script エディタ上でのみ入力し、同じ値を Vercel の
// 環境変数 SYMPO26_SHEET_TOKEN に登録してください（README.md 手順2・4）。
var SHARED_TOKEN = '';

var SHEET_NAME = '申込一覧';
var HEADERS = ['受付日時', 'お名前', 'お名前の読み', 'メールアドレス', '会社名・所属', '区分', '参加料', 'メッセージ'];

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (SHARED_TOKEN && data.token !== SHARED_TOKEN) {
      return json({ ok: false, error: 'unauthorized' });
    }

    var sheet = getSheet_();
    sheet.appendRow([
      data.date       || new Date(),
      data.name       || '',
      data.kana       || '',
      data.email      || '',
      data.org        || '',
      data.categories || '',
      data.feeText    || '',
      data.message    || ''
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#F2F2F2');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
