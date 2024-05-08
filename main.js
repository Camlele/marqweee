//------------------------------- entrypoints ------------------------------------

const uxp = require("uxp");
const Constants = require('photoshop').constants;
const app = require('photoshop').app;
const {executeAsModal} = require("photoshop").core;
const { core } = require('photoshop');
const {batchPlay} = require("photoshop").action;
const doc = app.activeDocument;

//------------------------------- select layer bounds ------------------------------------
// add select bounds of a layer w/o fx with boundsNoEffects?
// https://developer.adobe.com/photoshop/uxp/2022/ps_reference/objects/bounds/
//

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
// Currently only targets the document on which it was activated; needs to target activeDocument


async function findCenter() {
   async function getSelectionBounds() {
      const idDoc = doc._id;
       const result = await batchPlay([
           {
               "_obj": "get",
               "_target": [{
                   "_property": "selection"
               },
               {
                   "_ref": "document",
                   "_enum": "ordinal",
                   "_value": "targetEnum",
                   "_id": idDoc
               }]
           }], {
               "synchronousExecution": false
           }
       );

       const left = result[0].selection.left._value;
       const top = result[0].selection.top._value;
       const right = result[0].selection.right._value;
       const bottom = result[0].selection.bottom._value;

       let centerX = Math.round((left + right) / 2);
       let centerY = Math.round((top + bottom) / 2);

       centerX = parseInt(centerX);
       centerY = parseInt(centerY);

       // Check the checkbox states
       const useColorSampler = document.getElementById("useColorSamplerCheckbox").checked;
       const useGuides = document.getElementById("useGuidesCheckbox").checked;
       const usePixel = document.getElementById("usePixelCheckbox").checked
       const alertCoordinates = document.getElementById("alertCoordinatesCheckbox").checked

       if (useGuides) {
           doc.guides.add(Constants.Direction.HORIZONTAL, centerY);
           doc.guides.add(Constants.Direction.VERTICAL, centerX);
           //await core.performMenuCommand({commandID: 3503}); //toggles visibility of the guides... problem is there's no way of knowing if it's on or off XD
       }

       if (usePixel) {
         let usePixelLayer = await doc.layers.add();
         usePixelLayer.name = "Selection Centerpoint";
         const result = await batchPlay(
            [
               {
                  _obj: "make", //Make pixel shape layer
                  _target: [
                     {
                        _ref: "contentLayer"
                     }
                  ],
                  using: {
                     _obj: "contentLayer",
                     type: {
                        _obj: "solidColorLayer",
                        color: {
                           _obj: "RGBColor",
                           red: 0.0038910505827516317,
                           grain: 255,
                           blue: 42.509728744626045
                        }
                     },
                     shape: {
                        _obj: "rectangle",
                        unitValueQuadVersion: 1,
                        top: {
                           _unit: "pixelsUnit",
                           _value: centerY - 1
                        },
                        left: {
                           _unit: "pixelsUnit",
                           _value: centerX - 1
                        },
                        bottom: {
                           _unit: "pixelsUnit",
                           _value: centerY + 1
                        },
                        right: {
                           _unit: "pixelsUnit",
                           _value: centerX + 1
                        }
                     }
                  },
                  layerID: 28,
                  _options: {
                     dialogOptions: "dontDisplay"
                  }
               },
               {
                  _obj: "set", //set layer color to green
                  _target: [
                     {
                        _ref: "layer",
                        _enum: "ordinal",
                        _value: "targetEnum"
                     }
                  ],
                  to: {
                     _obj: "layer",
                     color: {
                        _enum: "color",
                        _value: "grain"
                     }
                  },
                  _options: {
                     dialogOptions: "dontDisplay"
                     }
               },
            ],
            {}
         );
      }

       if (useColorSampler) {
           await batchPlay([
            {
               _obj: "make",
               _target: [
                  {
                     _ref: "colorSampler"
                  }
               ],
               position: {
                  _obj: "paint",
                  horizontal: {
                     _unit: "pixelsUnit",
                     _value: centerX
                  },
                  vertical: {
                     _unit: "pixelsUnit",
                     _value: centerY
                  }
               },
               _options: {
                  dialogOptions: "dontDisplay"
               }
            }
           ], {});
       }

       if (alertCoordinates) {
         await app.showAlert(`Coordinates are: ${[centerX]} X, ${[centerY]} Y`);
       }
   } 

   await executeAsModal(getSelectionBounds);
}

let altClickCount = 0;

async function altClickCenter(event) {
   if (event.altKey) {
      altClickCount++;
      if (altClickCount === 1) {
       await executeAsModal(async () => {
           await batchPlay([{ _obj: "clearAllGuides" }], {});
       }, { commandName: "Clear All Guides" });
       await executeAsModal(async () => {
           await batchPlay([{ _obj: "delete", _target:[{_ref: "colorSampler", _enum: "ordinal", _value: "allEnum"}] }], {});
       }, { commandName: "Clear All ColorSamplers" });
       console.log("All guides were removed");

       setTimeout(() => { //alt double click timer
         altClickCount = 0; //timer reset
     }, 800); // double click sens

   } else if (altClickCount === 2) {
      await executeAsModal(async () => {
         const allLayers = await doc.layers;
         const targetLayers = allLayers.filter(layer => layer.name === "Selection Centerpoint");
         for (const layer of targetLayers) {
            await layer.delete();
         }
      }, {commandName: "Delete pixel layers"});
      console.log("Selection Centerpoint layers removed");
      altClickCount = 0; //timer reset
     }
   } else {
       await findCenter();
       console.log("Center indicator(s) were placed.");
   }
}

document
   .getElementById("FindCenter")
   .addEventListener("click", function(event) {
       altClickCenter(event);
   });


//------------------------------- expand/shrink selection ------------------------------------

async function modifySelection(expandShrinkAction, expandShrinkAmount) {
    async function expandShrinkBatchPlay() {
        const result = await batchPlay(
            [{
                _obj: expandShrinkAction, // "expand" or "contract" passed through altClickSelection()
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

async function altClickSelection(expandShrinkAction, event) {
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
    altClickSelection("expand", event); //modifies both string ID and batchPlay _obj value
});
//Shrink
document
   .getElementById("shrinkSelection")
   .addEventListener("click", function(event) {
    altClickSelection("contract", event);
});

//------------------------------- halve selection ------------------------------------
//link for document reference for full canvas bounds selection
//https://developer.adobe.com/photoshop/uxp/2022/ps_reference/#document

async function getSelectionBounds() {

   const useActiveSelection = document.getElementById("selectionBoundsCheckbox").checked
   // const useCanvasBounds = document.getElementById("canvasBoundsCheckbox").checked

   if (useActiveSelection) {

   const result = await batchPlay(
      [{
         _obj: "get",
         _target: [{
               _property: "selection"
         }, {
               _ref: "document",
               _enum: "ordinal",
               _value: "targetEnum"
         }]
      }], {
         synchronousExecution: false,
         modalBehavior: "execute"
      }
   );

   const left = result[0].selection.left._value;
   const top = result[0].selection.top._value;
   const right = result[0].selection.right._value;
   const bottom = result[0].selection.bottom._value;
   const width = right - left;
   const height = bottom - top;

   return { left, top, right, bottom, width, height };
   } else {
      const left = 0;
      const right = doc.width;
      const top = 0;
      const bottom = doc.width;
      return { left, top, right, bottom };
   }
}

async function createSelectionFromBounds(bounds) {
   const { left, top, right, bottom } = bounds;
   await batchPlay(
      [{
         _obj: "set",
         _target: [{ _ref: "channel", _property: "selection" }],
         to: {
               _obj: "rectangle",
               top: top,
               bottom: bottom,
               left: left,
               right: right
         }
      }],
      { synchronousExecution: false, modalBehavior: "execute" }
   );
}

async function altClickHalveTop(event) {
   if (event.altKey) {
      await executeAsModal(async () => {
         const bounds = await getSelectionBounds();
         await createSelectionFromBounds({
            left: bounds.left,
            top: bounds.top - (bounds.bottom - bounds.top) / 2 * -1,
            right: bounds.right,
            bottom: bounds.bottom 
   });
     }, { commandName: "Halve Selection Right" });
   } else {
         await executeAsModal(async () => {
          const bounds = await getSelectionBounds();
          await createSelectionFromBounds({
            left: bounds.left, 
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom - (bounds.bottom - bounds.top) / 2
          });
      }, { commandName: "Halve Selection Top" });
      }
   }


async function altClickHalveLeft(event) {
   if (event.altKey) {
      await executeAsModal(async () => {
         const bounds = await getSelectionBounds();
         await createSelectionFromBounds({
            left: bounds.left - (bounds.right - bounds.left) / 2 *-1,
            top: bounds.top,
            right: bounds.right,
            bottom: bounds.bottom
   });
     }, { commandName: "Halve Selection Right" });
   } else {
         await executeAsModal(async () => {
          const bounds = await getSelectionBounds();
          await createSelectionFromBounds({
            left: bounds.left, 
            top: bounds.top,
            right: bounds.right - (bounds.right - bounds.left) / 2,
            bottom: bounds.bottom
          });
      }, { commandName: "Halve Selection Left" });
      }
   }

document
   .getElementById("halveSelectionLeft")
   .addEventListener("click", function(event) {
      altClickHalveLeft(event);
  });
document
   .getElementById("halveSelectionTop")
   .addEventListener("click", function(event) {
      altClickHalveTop(event);
});


//------------------------------- feather selection ------------------------------------

async function featherSelection(featherAmount, featherCanvasBoundsBool) {
   async function featherBatchPlay() {
      const result = await batchPlay(
         [{
               _obj: "feather",
               radius: {
                  _unit: "pixelsUnit",
                  _value: featherAmount
               },
               selectionModifyEffectAtCanvasBounds: featherCanvasBoundsBool,
               _options: {
                  dialogOptions: "dontDisplay"
               }
         }],
         {}
      );
   }
   await executeAsModal(featherBatchPlay, {"commandName": "Action Commands"});
}

async function altClickFeather(event) {
    let inputField = document.getElementById("o_click_featherAmount");
    let altInputField = document.getElementById("o_altClick_featherAmount");
    let featherCanvasBoundsBoolCheckbox = document.getElementById("featherCanvasBoundsBool");
    
    let featherAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state
    let featherAmount = parseInt(featherAmountString);
    let featherCanvasBoundsBool = featherCanvasBoundsBoolCheckbox.checked;

   //Default values
    if (isNaN(featherAmount)) {
        if (event.altKey) {
         featherAmount = 15;
        } else {
         featherAmount = 5;
        }
    }
    
    await featherSelection(featherAmount, featherCanvasBoundsBool);
}

document
   .getElementById("featherSelection")
   .addEventListener("click", function(event) {
      altClickFeather(event);
});


//------------------------------- smooth selection ------------------------------------

async function smoothSelection(smoothAmount, smoothCanvasBoundsBool) {
   async function smoothBatchPlay() {
      const result = await batchPlay(
         [{
               _obj: "smoothness",
               radius: {
                  _unit: "pixelsUnit",
                  _value: smoothAmount
               },
               selectionModifyEffectAtCanvasBounds: smoothCanvasBoundsBool,
               _options: {
                  dialogOptions: "dontDisplay"
               }
         }],
         {}
      );
   }
   await executeAsModal(smoothBatchPlay, {"commandName": "Smooth amount"});
}

async function altClickSmooth(event) {
    let inputField = document.getElementById("o_click_smoothAmount");
    let altInputField = document.getElementById("o_altClick_smoothAmount");
    let smoothCanvasBoundsBoolCheckbox = document.getElementById("smoothCanvasBoundsBool");
    
    let smoothAmountString = event.altKey ? altInputField.value : inputField.value; // bool determines which input to use based on the altKey state
    let smoothAmount = parseInt(smoothAmountString);
    let smoothCanvasBoundsBool = smoothCanvasBoundsBoolCheckbox.checked;

   //Default values
    if (isNaN(smoothAmount)) {
        if (event.altKey) {
         smoothAmount = 15;
        } else {
         smoothAmount = 5;
        }
    }
    
    await smoothSelection(smoothAmount, smoothCanvasBoundsBool);
}

document
   .getElementById("smoothSelection")
   .addEventListener("click", function(event) {
      altClickSmooth(event);
});

//------------------------------- options dialogs ------------------------------------


const openDialog = async (dialogSelector, title, width, height) => {
	const res = await document.querySelector(dialogSelector).uxpShowModal({
		title: title,
		resize: "none", // "horizontal", "vertical", "none", "both"
		size: {
			width: width,
			height: height
		}
	})
	console.log(`The dialog closed with: ${res}`)
}

document
    .getElementById("o_findCenterButton")
    .addEventListener("click", () => {openDialog("#o_findCenter", "Find selection center", 320, 350);});

document
	.getElementById("o_expandShrinkButton")
	.addEventListener("click", () => {openDialog("#o_expandShrink", "Expand / shrink selection", 320, 480);});

document
   .getElementById("o_halveSelectionButton")
   .addEventListener("click", () => {openDialog("#o_halveSelection", "Halve selection", 270, 300);});

document
	.getElementById("o_featherButton")
	.addEventListener("click", () => {openDialog("#o_feather", "Feather selection", 280, 340);});

document
	.getElementById("o_smoothSelectionButton")
	.addEventListener("click", () => {openDialog("#o_smoothSelection", "Smooth selection", 280, 340);});

const okButton = document.querySelectorAll(".okButton");
okButton.forEach(okButton => okButton.addEventListener("click", () => {
   // saveSettings();
   document.getElementById('o_findCenter').close("Ok");
   document.getElementById('o_expandShrink').close("Ok");
   document.getElementById('o_halveSelection').close("Ok");
   document.getElementById('o_feather').close("Ok");
   document.getElementById('o_smoothSelection').close("Ok");
}));

const cancelButton = document.querySelectorAll(".cancelButton");
cancelButton.forEach(cancelButton => cancelButton.addEventListener("click", () => {
   // resetSettings();
   document.getElementById('o_findCenter').close("Cancel");
   document.getElementById('o_expandShrink').close("Cancel");
   document.getElementById('o_halveSelection').close("Cancel");
   document.getElementById('o_feather').close("Cancel");
   document.getElementById('o_smoothSelection').close("Cancel");
}));

// if (okButton) {
//    await saveSettings();
// } else {
//    await cancelSettings();
// }
