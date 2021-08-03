// ==UserScript==
// @name         weixin-market
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       Azeroding
// @match        https://weixin-market.vip.com/
// @icon         https://www.google.com/s2/favicons?domain=vip.com
// @updateURL    https://raw.githubusercontent.com/Azero-NG/weworkjs/master/wework.user.js
// @downloadURL  https://raw.githubusercontent.com/Azero-NG/weworkjs/master/wework.user.js
// @require https://cdn.bootcdn.net/ajax/libs/xlsx/0.17.0/xlsx.full.min.js
// @run-at      document-end
// @grant        none
// @grant unsafeWindow
// ==/UserScript==

function createElementFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

async function GetJson(batchNum, page, limit) {
  let resp = await fetch(
    `https://weixin-market.vip.com/market_api/wework_user_task/task_detail?page=${page}&batchNum=${batchNum}&limit=${limit}&api_key=6c511b5555f541f4bcea39ff2cfd8397`,
    {
      headers: {
        accept: "*/*",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        "sec-ch-ua":
          '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
      },
      referrer: "https://weixin-market.vip.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );
  return await resp.json();
}

async function ExportExcel() {
  let batchNum = window.location.href.match(/detail\/(.*)/)[1];
  let count = await GetJson(batchNum, 1, 1);
  count = count.data.total;
  let data = await GetJson(batchNum, 1, count);
  data = data.data.listData;
  let wb = XLSX.utils.book_new();
  wb.SheetNames.push("Sheet1");
  let workSheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, workSheet, "sheet1");
  //   var bin = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  // //   Blob([this._binStr2ArrBuff(bin)], { type: "" });
  // //   return data;
  XLSX.writeFile(wb, "book.xlsx");
}

(function () {
  "use strict";
  let injected = false;
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!injected) {
          let parent = document.querySelector(
            ".ams-operations.el-form--inline.left-operations"
          );
          if (parent != null) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            script.src =
              "https://cdn.bootcdn.net/ajax/libs/xlsx/0.17.0/xlsx.full.min.js";

            document.getElementsByTagName("head")[0].appendChild(script);

            injected = true;
            let button = createElementFromHTML(`<div class="el-form-item">
  <div class="el-form-item__content">
    <div
      class="el-badge el-tooltip ams-operation"
      aria-describedby="el-tooltip-528"
      tabindex="0"
    >
      <button type="button" class="el-button el-button--primary">
        <span>导出Excel</span></button
      >
    </div>
  </div>
</div>
`);
            parent.appendChild(button);
            button.addEventListener("click", () => ExportExcel(), false);
          }
        }
      }
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true,
  });
})();
