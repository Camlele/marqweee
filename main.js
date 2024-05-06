//------------------------------- entrypoints ------------------------------------

const uxp = require("uxp");
const { app } = require('photoshop');
const {executeAsModal} = require("photoshop").core;
const {batchPlay} = require("photoshop").action;

//------------------------------- select layer bounds ------------------------------------

async function selectLayerBounds() {
   async function getActiveLayerBounds() {
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
   
   async function modifyDocument() {
      const bounds = await getActiveLayerBounds();
      console.log("Bounds of the active layer:", bounds);
      await createSelectionFromBounds(bounds);
      console.log("Selection has been created based on layer bounds.");
   };
   
   executeAsModal(modifyDocument);
}

document
   .getElementById("selectLayerBounds")
   .addEventListener("click", selectLayerBounds);

//------------------------------- find selection center ------------------------------------


//------------------------------- expand/shrink selection ------------------------------------

async function modifySelection(expandShrinkAction, expandShrinkAmount) {
    async function expandShrinkBatchPlay() {
        const result = await batchPlay(
            [{
                _obj: expandShrinkAction, // "expand" or "contract" passed through handleSelection()
                by: {
                    _unit: "pixelsUnit",
                    _value: expandShrinkAmount
                },
                selectionModifyEffectAtCanvasBounds: false,
                _options: {
                    dialogOptions: "dontDisplay"
                }
            }],
            {}
        );
    }
    await executeAsModal(expandShrinkBatchPlay, {"commandName": "Action Commands"});
}

async function handleSelection(expandShrinkAction, event) {
    let inputField = document.getElementById(`o_click_${expandShrinkAction}Amount`);
    let altInputField = document.getElementById(`o_altClick_${expandShrinkAction}Amount`);
    
    let expandShrinkAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state

    let expandShrinkAmount = parseInt(expandShrinkAmountString);

   //Default values
    if (isNaN(expandShrinkAmount)) {
        if (event.altKey) {
         expandShrinkAmount = 5;
        } else {
         expandShrinkAmount = 1;
        }
    }
    
    await modifySelection(expandShrinkAction, expandShrinkAmount);
}

//Expand
document
   .getElementById("expandSelection")
   .addEventListener("click", function(event) {
    handleSelection("expand", event); //modifies both string ID and batchPlay _obj value
});
//Shrink
document
   .getElementById("shrinkSelection")
   .addEventListener("click", function(event) {
    handleSelection("contract", event);
});

//------------------------------- halve selection ------------------------------------



//------------------------------- feather selection ------------------------------------

async function featherSelection(featherAmount) {
   async function featherBatchPlay() {
      const result = await batchPlay(
         [{
               _obj: "feather",
               radius: {
                  _unit: "pixelsUnit",
                  _value: featherAmount
               },
               selectionModifyEffectAtCanvasBounds: false,
               _options: {
                  dialogOptions: "dontDisplay"
               }
         }],
         {}
      );
   }
   await executeAsModal(featherBatchPlay, {"commandName": "Action Commands"});
}

async function handleFeather(event) {
    let inputField = document.getElementById("o_click_featherAmount");
    let altInputField = document.getElementById("o_altClick_featherAmount");
    
    let featherAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state

    let featherAmount = parseInt(featherAmountString);

   //Default values
    if (isNaN(featherAmount)) {
        if (event.altKey) {
         featherAmount = 15;
        } else {
         featherAmount = 5;
        }
    }
    
    await featherSelection(featherAmount);
}

document
   .getElementById("featherSelection")
   .addEventListener("click", function(event) {
      handleFeather(event);
});


//------------------------------- smooth selection ------------------------------------


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


//------------------------------- options dialogs ------------------------------------


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

document
   .getElementById("o_halveSelectionButton")
   .addEventListener("click", () => {openDialog("#o_halveSelection", "Halve selection", 100, 400);});

document
	.getElementById("o_featherButton")
	.addEventListener("click", () => {openDialog("#o_feather", "Feather selection", 100, 480);});

// document
// 	.getElementById("o_smoothSelectionButton")
// 	.addEventListener("click", () => {openDialog("#o_smoothSelection", "Smooth selection", 100, 480);});


