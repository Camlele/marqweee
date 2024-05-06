const uxp = require("uxp");
const { app } = require('photoshop');
const {executeAsModal} = require("photoshop").core;
const {batchPlay} = require("photoshop").action;


const getActiveLayerBounds = async () => {
   const result = await batchPlay(
     [
       {
         _obj: "get",
         _target: [
           { _property: "bounds" },
           { _ref: "layer", _enum: "ordinal", _value: "targetEnum" }
         ],
         _options: { dialogOptions: "dontDisplay" }
       }
     ],
     { synchronousExecution: false, modalBehavior: "execute" }
   );
 
   return result[0].bounds;
 };
 
 const createSelectionFromBounds = async (bounds) => {
   await batchPlay(
     [
       {
         _obj: "set",
         _target: [{ _ref: "channel", _property: "selection" }],
         to: {
           _obj: "rectangle",
           top: bounds.top,
           left: bounds.left,
           bottom: bounds.bottom,
           right: bounds.right
         }
       }
     ],
     { synchronousExecution: false, modalBehavior: "execute" }
   );
 };
 
 const modifyDocument = async () => {
   const bounds = await getActiveLayerBounds();
   console.log("Bounds of the active layer:", bounds);
   await createSelectionFromBounds(bounds);
   console.log("Selection has been created based on layer bounds.");
 };
 
 executeAsModal(modifyDocument, { commandName: "Create Selection from Layer Bounds" });



// async function actionCommands() {
//    const result = await batchPlay(
//       [
//          {
//             _obj: "get",
//             _target: [
//                {
//                   _property: "bounds"
//                },
//                {
//                   _ref: "layer",
//                   _id: 3
//                },
//                {
//                   _ref: "document",
//                   _id: 59
//                }
//             ],
//             _options: {
//                dialogOptions: "dontDisplay"
//             }
//          }
//       ],
//       {}
//    );
// }

// async function runModalFunction() {
//    await executeAsModal(actionCommands, {"commandName": "Action Commands"});
// }

// await runModalFunction();




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



//-------------------------------expand/shrink selection------------------------------------

// async function modifySelection(expandShrinkAction, expandShrinkAmount) {
//     async function expandShrinkBatchPlay() {
//         const result = await batchPlay(
//             [{
//                 _obj: expandShrinkAction, // "expand" or "contract" passed through handleSelection()
//                 by: {
//                     _unit: "pixelsUnit",
//                     _value: expandShrinkAmount
//                 },
//                 selectionModifyEffectAtCanvasBounds: false,
//                 _options: {
//                     dialogOptions: "dontDisplay"
//                 }
//             }],
//             {}
//         );
//     }
//     await executeAsModal(expandShrinkBatchPlay, {"commandName": "Action Commands"});
// }

// async function handleSelection(expandShrinkAction, event) {
//     let inputField = document.getElementById(`o_click_${expandShrinkAction}Amount`);
//     let altInputField = document.getElementById(`o_altClick_${expandShrinkAction}Amount`);
    
//     let expandShrinkAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state

//     let expandShrinkAmount = parseInt(expandShrinkAmountString);

//    //Default values
//     if (isNaN(expandShrinkAmount)) {
//         if (event.altKey) {
//          expandShrinkAmount = 5;
//         } else {
//          expandShrinkAmount = 1;
//         }
//     }
    
//     await modifySelection(expandShrinkAction, expandShrinkAmount);
// }

// //Expand
// document.getElementById("expandSelection").addEventListener("click", function(event) {
//     handleSelection("expand", event); //modifies both string ID and batchPlay _obj value
// });
// //Shrink
// document.getElementById("shrinkSelection").addEventListener("click", function(event) {
//     handleSelection("contract", event);
// });


// //-------------------------------feather selection------------------------------------

// async function featherSelection(featherAmount) {
//    async function featherBatchPlay() {
//       const result = await batchPlay(
//          [{
//                _obj: "feather",
//                radius: {
//                   _unit: "pixelsUnit",
//                   _value: featherAmount
//                },
//                selectionModifyEffectAtCanvasBounds: false,
//                _options: {
//                   dialogOptions: "dontDisplay"
//                }
//          }],
//          {}
//       );
//    }
//    await executeAsModal(featherBatchPlay, {"commandName": "Action Commands"});
// }

// async function handleFeather(event) {
//     let inputField = document.getElementById("o_click_featherAmount");
//     let altInputField = document.getElementById("o_altClick_featherAmount");
    
//     let featherAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state

//     let featherAmount = parseInt(featherAmountString);

//    //Default values
//     if (isNaN(featherAmount)) {
//         if (event.altKey) {
//          featherAmount = 15;
//         } else {
//          featherAmount = 5;
//         }
//     }
    
//     await featherSelection(featherAmount);
// }

// document.getElementById("featherSelection").addEventListener("click", function(event) {
//    handleFeather(event);
// });




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

// const openDialog = async (dialogSelector, title, width, height) => {
// 	const res = await document.querySelector(dialogSelector).uxpShowModal({
// 		title: title,
// 		resize: "both", // "horizontal", "vertical", "none"
// 		size: {
// 			width: width,
// 			height: height
// 		}
// 	})
// 	console.log(`The dialog closed with: ${res}`)
// }
// document
//     .getElementById("o_findCenterButton")
//     .addEventListener("click", () => {openDialog("#o_findCenter", "Find selection center", 100, 400);});

// document
// 	.getElementById("o_expandShrinkButton")
// 	.addEventListener("click", () => {openDialog("#o_expandShrink", "Expand / shrink selection", 100, 480);});

// document
// 	.getElementById("o_featherButton")
// 	.addEventListener("click", () => {openDialog("#o_feather", "Feather selection", 100, 480);});
// document
// 	.getElementById("o_clickExpandAmount")
// 	.addEventListener("input", evt => {
// 		console.log('New Value: ${evt.target.value}');});

//make the id "o_clickExpandAmount" able to be altered by the user and store the result in a variable



