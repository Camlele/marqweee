// const { entrypoints } = require("uxp");

//   showAlert = () => {
//     alert("This is an alert message");
//   }

//   entrypoints.setup({
//     commands: {
//       showAlert,
//     },
//     panels: {
//       vanilla: {
//         show(node ) {
//         }
//       }
//     }
//   });

// function showLayerNames() {
//     const app = require("photoshop").app;
//     const allLayers = app.activeDocument.layers;
//     const allLayerNames = allLayers.map(layer => layer.name);
//     const sortedNames = allLayerNames.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
//     document.getElementById("layers").innerHTML = `
//       <ul>${
//         sortedNames.map(name => `<li>${name}</li>`).join("")
//       }</ul>`;
// }

// document.getElementById("btnPopulate").addEventListener("click", showLayerNames);


const { entrypoints } = require("uxp");

entrypoints.setup({

  panels: {
    "o_SelectLayerBounds": {
      show(body) {
        let content = document.querySelector("o_SelectLayerBounds");
        body.appendChild(content);
      },
    },
    "mainContent": {
      show(body) {
        let content = document.querySelector("mainContent");
        body.appendChild(content);
      },
    },
  }
});



//expand selection
const {executeAsModal} = require("photoshop").core;
const {batchPlay} = require("photoshop").action;

//different input on alt-click
async function expandSelection(event) {
let expandAmount = 1;

if (event.altKey) {
  console.log('altKey');
  expandAmount = 5;
}

async function actionCommands() {
   const result = await batchPlay(
      [
         {
            _obj: "expand",
            by: {
               _unit: "pixelsUnit",
               _value: expandAmount
            },
            selectionModifyEffectAtCanvasBounds: false,
            _options: {
               dialogOptions: "dontDisplay"
            }
         }
      ],
      {}
   );
}

async function runModalFunction() {
   await executeAsModal(actionCommands, {"commandName": "Action Commands"});
}

await runModalFunction();
}

document
  .getElementById("expandSelection")
  .addEventListener("click", expandSelection);

//shrink selection
  
async function shrinkSelection() {
async function actionCommands() {
    const result = await batchPlay(
       [
          {
             _obj: "contract",
            by: {
               _unit: "pixelsUnit",
                _value: 30
             },
             selectionModifyEffectAtCanvasBounds: false,
             _options: {
               dialogOptions: "dontDisplay"
            }
          }
       ],
       {}
    );
  }
  
async function runModalFunction() {
   await executeAsModal(actionCommands, {"commandName": "Action Commands"});
}
  
await runModalFunction();
}

document
.getElementById("shrinkSelection")
.addEventListener("click", shrinkSelection);
