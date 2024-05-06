const uxp = require("uxp");


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




//------------------------------------------------------------------------------------------------------------------------


//select layer bounds
// async function selectLayerBounds() {
// const executeAsModalFunction = async (executionContext) => {

// const { app } = require('photoshop');
// const { BatchPlay } = require("photoshop");

//     const doc = app.activeDocument;
//     const layer = doc.activeLayers[0]; // Getting the first active layer

//     // Checks if the layer is empty
//     if (layer.bounds.left === layer.bounds.right && layer.bounds.top === layer.bounds.bottom) {
//         await doc.selectAll();
//     } else {
//         // Gets dimensions of the layer
//         let layerX = layer.bounds.left;
//         let layerY = layer.bounds.top;
//         let layerWidth = layer.bounds.right - layer.bounds.left;
//         let layerHeight = layer.bounds.bottom - layer.bounds.top;

//         // UXP selection using batchPlay (similar to action manager code)
//         await BatchPlay(
//             [
//                 {
//                     "_obj": "set",
//                     "_target": [
//                         {
//                             "_ref": "channel",
//                             "_property": "selection"
//                         }
//                     ],
//                     "to": {
//                         "_obj": "rectangle",
//                         "top": { "_unit": "pixels", "_value": layerY },
//                         "left": { "_unit": "pixels", "_value": layerX },
//                         "bottom": { "_unit": "pixels", "_value": layerY + layerHeight },
//                         "right": { "_unit": "pixels", "_value": layerX + layerWidth }
//                     }
//                 }
//             ],
//             { "synchronousExecution": false }
//         );
//     }
// }
// await core.executeAsModal(executeAsModalFunction, {commandName: "Select Layer Bounds"});

// }


// document
//   .getElementById("SelectLayerBounds")
//   .addEventListener("click", selectLayerBounds);



//------------------------------------------------------------------------------------------------------------------------



// const { entrypoints } = require("uxp");

// entrypoints.setup({

//   panels: {
//     "o_SelectLayerBounds": {
//       show(body) {
//         let content = document.querySelector("o_SelectLayerBounds");
//         body.appendChild(content);
//       },
//     },
//     "mainContent": {
//       show(body) {
//         let content = document.querySelector("mainContent");
//         body.appendChild(content);
//       },
//     },
//   }
// });



//expand selection
const {executeAsModal} = require("photoshop").core;
const {batchPlay} = require("photoshop").action;


//different input on alt-click
async function expandSelection() {
let expandAmount = await document.getElementById("o_clickExpandAmount").value;
document.getElementById("o_clickExpandAmount").addEventListener("input", evt => {expandAmount = evt.target.value;});

// if (event.altKey) {
//   console.log('altKey');
//   expandAmount = document.getElementById("o_altClickExpandAmount").value;
// }

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
                _value: 5
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


//------------------------------------------------------------------------------------------------------------------------


//Find selection center
// const { app } = require("photoshop");

// async function addGuides() {
//     // Save current ruler units and set to PIXELS
//     // const initialUnits = app.preferences.rulerUnits;
//     // app.preferences.rulerUnits = "pixels";

//     try {
//         const doc = app.activeDocument;
//         const layer = doc.activeLayers[0];
//         const bounds = layer.bounds;

//         const hor = bounds.right - bounds.left;
//         const ver = bounds.bottom - bounds.top;
//         const hCentre = hor / 2 + bounds.left;
//         const vCentre = ver / 2 + bounds.top;

//         // Add horizontal and vertical guides
//         await doc.guides.add("horizontal", vCentre);
//         await doc.guides.add("vertical", hCentre);

//     } catch (err) {
//         console.error('Failed to execute:', err);
//     } finally {
//         // Restore original units
//         // app.preferences.rulerUnits = initialUnits;
//     }
// }



// document
//   .getElementById("FindCenter")
//   .addEventListener("click", addGuides);


//----------------------------------- Options Dialogs -------------------------------------------------------------------------------------


//Find Center

const openDialog = async (dialogSelector, title, width, height) => {
	const res = await document.querySelector(dialogSelector).uxpShowModal({
		title: title,
		resize: "both", // "horizontal", "vertical", "none"
		size: {
			width: width,
			height: height
		}
	})
	console.log(`The dialog closed with: ${res}`)
}
document
    .getElementById("o_findCenterButton")
    .addEventListener("click", () => {openDialog("#o_findCenter", "Find selection center", 100, 400);});

document
	.getElementById("o_expandShrinkButton")
	.addEventListener("click", () => {openDialog("#o_expandShrink", "Expand / shrink selection", 100, 480);});
// document
// 	.getElementById("o_clickExpandAmount")
// 	.addEventListener("input", evt => {
// 		console.log('New Value: ${evt.target.value}');});

//make the id "o_clickExpandAmount" able to be altered by the user and store the result in a variable



