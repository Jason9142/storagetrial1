const fs = require("fs");
const pathModule = require("path");
const PdfPrinter = require("pdfmake");
const PascalCase = require("pascal-case");
const dateFormat = require("dateformat");

module.exports = function(userID, commodities) {
  const array = [
    [
      "Customer Code",
      "Batch Number",
      "Delivery Date\n(YYYY/MM/DD)",
      "Serial No.",
      "Type",
      "Item Description",
      "Quantity",
      "Total Weight Balance",
      "Seal No."
    ]
  ];

  commodities.map(c => {
    array.push([
      c.owner.customerNum,
      c.certificateNum,
      dateFormat(
        c.date.toLocaleDateString("default", {
          timeZone: "Asia/Singapore"
        }),
        "yyyy/mm/dd"
      ),
      c.serialNum,
      PascalCase(c.type),
      c.description,
      c.quantity.toString(),
      `${c.totalWeight.toFixed(4).toString()}`,
      c.sealNum.toString()
    ]);
  });

  const date = new Date().toLocaleString("default", {
    timeZone: "Asia/Singapore"
  });

  const documentDefinition = {
    pageOrientation: "landscape",
    styles: {},
    defaultStyle: {
      font: "Nunito",
      fontSize: 11,
      alignment: "center"
    },
    footer: function(currentPage, pageCount) {
      return currentPage.toString() + " of " + pageCount;
    },
    header: function(currentPage, pageCount, pageSize) {
      return [
        {
          text: `Report generated on ${dateFormat(
            date,
            "dd mmmm yyyy"
          )} at ${dateFormat(date, "hh:MM:ss TT")} SGT (UTC +8)`,
          alignment: "right",
          margin: [0, 10, 10, 0] // Left Top Right Bottom
        }
        // {
        //   canvas: [
        //     { type: "rect", x: 170, y: 32, w: pageSize.width - 170, h: 40 }
        //   ]
        // }
      ];
    },
    content: [
      {
        image: "./uploads/template/letterhead.jpg",
        width: 760,
        height: 120,
        margin: [0, 0, 0, 5]
      },
      {
        text: "Portfolio Holdings Report",
        style: "header"
      },
      {
        table: {
          headerRows: 1,
          body: array,
          widths: ["*", "*", "*", "*", "*", "*", "*", "*", "*"]
        },
        layout: {
          fillColor: function(rowIndex, node, columnIndex) {
            return rowIndex === 0 ? "#d3d3d3" : null;
          }
        }
      }
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        marginBottom: 30
      }
    }
  };

  const printer = new PdfPrinter({
    Nunito: {
      normal: pathModule.normalize(`${__dirname}/fonts/Nunito-Regular.ttf`),
      bold: pathModule.normalize(`${__dirname}/fonts/Nunito-Bold.ttf`),
      italics: pathModule.normalize(`${__dirname}/fonts/Nunito-Italic.ttf`),
      bolditalics: pathModule.normalize(
        `${__dirname}/fonts/Nunito-BoldItalic.ttf`
      )
    },
    Symbol: {
      normal: "Symbol"
    },
    ZapfDingbats: {
      normal: "ZapfDingbats"
    }
  });

  const path = "./uploads/pdf/document.pdf";

  const pdfDoc = printer.createPdfKitDocument(documentDefinition);
  pdfDoc.pipe(fs.createWriteStream(path));
  pdfDoc.end();

  return path;
};
