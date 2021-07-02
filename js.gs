function doGet() {
  const html = HtmlService.createHtmlOutputFromFile("index")
  .setTitle('Furiganaer GAS+Vue.js')
  .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return html;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function furiganize(value){
    const data = checkWithAPI(value);
    const result = kanaKanjiSorter(data);
    return result;
}

function checkWithAPI(input) {
  const morphographics = "https://labs.goo.ne.jp/api/morph";
  const id = APP_ID;
  
  const morphPayload = {
    "app_id": id,
    "sentence": input,
    "info_filter": "form|read"
  };

  const morphOps = {
    "method": "post",
    "payload": morphPayload
  };

  const morph = UrlFetchApp.fetch(morphographics, morphOps);
  const morphJson = JSON.parse(morph.getContentText());  
  return morphJson.word_list;
}



function kanaKanjiSorter(value){  
  const sortedData = value[0].map(function(x){
      const val = {"item":x[0], "reading":toHiragana(x[1]), "katakana":x[1]}
      if(val.item === val.reading || val.item === val.katakana || !val.reading){
        return val.item
      } else {
        const original = val.item.split('');
        if(original.some(x=>x.match(/^[ぁ-んー　]*$/))){
          const concat = "[" + val.item + ":" + val.reading + "]"
          return concat;
        } else {
          const okurigana = val.reading.split('').filter((v) => {
          if(v.match(/[\u30FB-\u30FC]/g)){
            return true;
          } else {
            return original.indexOf(v) == -1
          }
        } ).join('');
        const concat = "[" + val.item + ":" + okurigana + "]";
        return concat;
        }        
      }
  })
  return sortedData;
}

function toHiragana(str) {
    return str.replace(/[\u30A1-\u30FA]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}
