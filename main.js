//------------------------------- entrypoints ------------------------------------

const uxp = require("uxp");
const storage = require("uxp").storage;
const { entrypoints } = require("uxp");

const Constants = require('photoshop').constants;
const app = require('photoshop').app;
const {executeAsModal} = require("photoshop").core;
const { core } = require('photoshop');
const {batchPlay} = require("photoshop").action;

//------------------------------- select layer bounds ------------------------------------
// add select bounds of a layer w/o fx with boundsNoEffects?
// https://developer.adobe.com/photoshop/uxp/2022/ps_reference/objects/bounds/

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
// same goes for clearing elements, including the pixel layer


async function findCenter() {
   async function getSelectionBounds() {
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
                   "_id": app.activeDocument._id
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
         // if (guidesVisibility(result)) {
         // console.log(guidesVisibility(result));
         // await core.performMenuCommand({commandID: 3503}); //toggles visibility of the guides... problem is there's no way of knowing if it's on or off XD
         // }  
         app.activeDocument.guides.add(Constants.Direction.HORIZONTAL, centerY);
         app.activeDocument.guides.add(Constants.Direction.VERTICAL, centerX);
           
      //    async function guidesVisibility() {
      //       const result = await batchPlay(
      //          [
      //             {
      //                _obj: 'uiInfo',
      //                _target: {
      //                  _ref: 'application',
      //                  _enum: 'ordinal',
      //                  _value: 'targetEnum',
      //                },
      //                command: 'getCommandEnabled',
      //                commandID: 3503,
      //              }
      //          ]
      //       )
      //      await executeAsModal(guidesVisibility, {"commandName": "Get guide visibility"});
      //      return result;
      //  }
      //  const result = await guidesVisibility();
      //  console.log(result);
      }

       if (usePixel) {
         let usePixelLayer = await app.activeDocument.layers.add();
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
         const allLayers = await app.activeDocument.layers;
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
      const right = app.activeDocument.width;
      const top = 0;
      const bottom = app.activeDocument.width;
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

    if (featherCanvasBoundsBoolCheckbox) {
      featherCanvasBoundsBool = true;
    } else {
      featherCanvasBoundsBool = false;
    }

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

    if (smoothCanvasBoundsBoolCheckbox) {
      smoothCanvasBoundsBool = true;
    } else {
      smoothCanvasBoundsBool = false;
    }

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

//------------------------------- Create selection from guides ------------------------------------

// async function getGuideHorizontal() {
//       const result = await batchPlay(
//          [
//             {
//                _obj: "get",
//                new: {
//                   _obj: "good",
//                   position: {
//                      _unit: "pixelsUnit",
//                      _value: 967.3493585925512
//                   },
//                   orientation: {
//                      _enum: "orientation",
//                      _value: "vertical"
//                   },
//                   kind: {
//                      _enum: "kind",
//                      _value: "document"
//                   },
//                   _target: [
//                      {
//                         _ref: "document",
//                         _id: 134
//                      },
//                      {
//                         _ref: "good",
//                         _index: 2
//                      }
//                   ],
//                   $GdCA: 0,
//                   $GdCR: 74,
//                   $GdCG: 255,
//                   $GdCB: 255
//                },
//                _target: [
//                   {
//                      _ref: "good"
//                   }
//                ],
//                guideTarget: {
//                   _enum: "guideTarget",
//                   _value: "guideTargetCanvas"
//                },
//                _options: {
//                   dialogOptions: "dontDisplay"
//                }
//             }
//          ],
//          {}
//       );
// } console.log(getGuideHorizontal());


// Logic

// MakeSelectionFromGuide(guide[value]); {
//    if (guideToggleOn) {
//       if (guide.HORIZONTAL) {
//          get.guide.HORIZONTAL.value;
//          if (selectionExists) {
//             subtractFromSelection(guide.HORIZONTAL.value);
//          } else {
//             makeSelectionFrom(guide.HORIZONTAL.value);
//          }
//       } else if (guide.VERTICAL) {
//          get.VERTICAL.value;
//          if (selectionExists) {
//             subtractFromSelection(guide.VERTICAL.value);
//          } else {
//             makeSelectionFrom(guide.VERTICAL.value);
//          }
//       }
//    }
// }


//------------------------------- options dialogs ------------------------------------

let savedFindCenterSettings = JSON.parse(localStorage.getItem("findCenterSettings")) || {
   useGuides: false,
   usePixel: true,
   useColorSampler: false,
   alertCoordinates: false};

let savedExpandShrinkSettings = JSON.parse(localStorage.getItem("expandShrinkSettings")) || {
   expandAmount: 1,
   altExpandAmount: 5,
   shrinkAmount: 1,
   altShrinkAmount: 5
};
let savedHalveSelectionSettings = JSON.parse(localStorage.getItem("halveSelectionSettings")) || {
   selectionBounds: true};
let savedFeatherAmountSettings = JSON.parse(localStorage.getItem("featherAmountSettings")) || {
   featherAmount: 5,
   altFeatherAmount: 15,
   featherCanvasBounds: true};
let savedSmoothAmountSettings = JSON.parse(localStorage.getItem("smoothAmountSettings")) || {
   smoothAmount: 5, 
   altSmoothAmount: 15, 
   smoothCanvasBounds: true 
};


const openDialog = async (dialogSelector, title, width, height) => {

document.getElementById("useColorSamplerCheckbox").checked = savedFindCenterSettings.useColorSampler;
document.getElementById("useGuidesCheckbox").checked = savedFindCenterSettings.useGuides; 
document.getElementById("usePixelCheckbox").checked = savedFindCenterSettings.usePixel;
document.getElementById("alertCoordinatesCheckbox").checked = savedFindCenterSettings.alertCoordinates;

document.getElementById("o_click_expandAmount").value = savedExpandShrinkSettings.expandAmount;
document.getElementById("o_altClick_expandAmount").value = savedExpandShrinkSettings.altExpandAmount;
document.getElementById("o_click_contractAmount").value = savedExpandShrinkSettings.shrinkAmount;
document.getElementById("o_altClick_contractAmount").value = savedExpandShrinkSettings.altShrinkAmount;

document.getElementById("selectionBoundsCheckbox").checked = savedHalveSelectionSettings.selectionBounds;
document.getElementById("canvasBoundsCheckbox").checked = !savedHalveSelectionSettings.selectionBounds;

document.getElementById("o_click_smoothAmount").value = savedSmoothAmountSettings.smoothAmount;
document.getElementById("o_altClick_smoothAmount").value = savedSmoothAmountSettings.altSmoothAmount;
document.getElementById("smoothCanvasBoundsBool").checked = savedSmoothAmountSettings.smoothCanvasBounds;

document.getElementById("o_click_featherAmount").value = savedFeatherAmountSettings.featherAmount;
document.getElementById("o_altClick_featherAmount").value = savedFeatherAmountSettings.altFeatherAmount;
document.getElementById("featherCanvasBoundsBool").checked = savedFeatherAmountSettings.featherCanvasBounds;



const res = await document.querySelector(dialogSelector).uxpShowModal({
		title: title,
		resize: "none", // "horizontal", "vertical", "none", "both"
		size: {
			width: width,
			height: height
		}
	})
	console.log(`The dialog closed with: ${res}`);
}



document
    .getElementById("o_findCenterButton")
    .addEventListener("click", () => {openDialog("#o_findCenter", "Find selection center", 320, 360);});

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
okButton.forEach(button => button.addEventListener("click", () => {

      savedFindCenterSettings.useColorSampler = document.getElementById("useColorSamplerCheckbox").checked;
      savedFindCenterSettings.useGuides = document.getElementById("useGuidesCheckbox").checked;
      savedFindCenterSettings.usePixel = document.getElementById("usePixelCheckbox").checked;
      savedFindCenterSettings.alertCoordinates = document.getElementById("alertCoordinatesCheckbox").checked;
      localStorage.setItem('findCenterSettings', JSON.stringify(savedFindCenterSettings));
      
      savedExpandShrinkSettings.expandAmount = document.getElementById("o_click_expandAmount").value;
      savedExpandShrinkSettings.altExpandAmount = document.getElementById("o_altClick_expandAmount").value;
      savedExpandShrinkSettings.shrinkAmount = document.getElementById("o_click_contractAmount").value;
      savedExpandShrinkSettings.altShrinkAmount = document.getElementById("o_altClick_contractAmount").value;
      localStorage.setItem('expandShrinkSettings', JSON.stringify(savedExpandShrinkSettings));
   
      savedHalveSelectionSettings.selectionBounds = document.getElementById("selectionBoundsCheckbox").checked;
      localStorage.setItem('halveSelectionSettings', JSON.stringify(savedHalveSelectionSettings));

      savedSmoothAmountSettings.smoothAmount = document.getElementById("o_click_smoothAmount").value;
      savedSmoothAmountSettings.altSmoothAmount = document.getElementById("o_altClick_smoothAmount").value;
      savedSmoothAmountSettings.smoothCanvasBounds = document.getElementById("smoothCanvasBoundsBool").checked;
      localStorage.setItem('smoothAmountSettings', JSON.stringify(savedSmoothAmountSettings));

      savedFeatherAmountSettings.featherAmount = document.getElementById("o_click_featherAmount").value;
      savedFeatherAmountSettings.altFeatherAmount = document.getElementById("o_altClick_featherAmount").value;
      savedFeatherAmountSettings.featherCanvasBounds = document.getElementById("featherCanvasBoundsBool").checked;
      localStorage.setItem('featherAmountSettings', JSON.stringify(savedFeatherAmountSettings));


   document.getElementById('o_findCenter').close("Ok");
   document.getElementById('o_expandShrink').close("Ok");
   document.getElementById('o_halveSelection').close("Ok");
   document.getElementById('o_feather').close("Ok");
   document.getElementById('o_smoothSelection').close("Ok");
}));

const cancelButton = document.querySelectorAll(".cancelButton");
cancelButton.forEach(button => button.addEventListener("click", () => {

      document.getElementById("useColorSamplerCheckbox").checked = savedFindCenterSettings.useColorSampler;
      document.getElementById("useGuidesCheckbox").checked = savedFindCenterSettings.useGuides;
      document.getElementById("usePixelCheckbox").checked = savedFindCenterSettings.usePixel;
      document.getElementById("alertCoordinatesCheckbox").checked = savedFindCenterSettings.alertCoordinates;

      document.getElementById("o_click_expandAmount").value = savedExpandShrinkSettings.expandAmount;
      document.getElementById("o_altClick_expandAmount").value = savedExpandShrinkSettings.altExpandAmount;
      document.getElementById("o_click_contractAmount").value = savedExpandShrinkSettings.shrinkAmount;
      document.getElementById("o_altClick_contractAmount").value = savedExpandShrinkSettings.altShrinkAmount;

      document.getElementById("selectionBoundsCheckbox").checked = savedHalveSelectionSettings.selectionBounds;
      document.getElementById("canvasBoundsCheckbox").checked = !savedHalveSelectionSettings.selectionBounds;

      document.getElementById("o_click_smoothAmount").value = savedSmoothAmountSettings.smoothAmount;
      document.getElementById("o_altClick_smoothAmount").value = savedSmoothAmountSettings.altSmoothAmount;
      document.getElementById("smoothCanvasBoundsBool").checked = savedSmoothAmountSettings.smoothCanvasBounds;

      document.getElementById("o_click_featherAmount").value = savedFeatherAmountSettings.featherAmount;
      document.getElementById("o_altClick_featherAmount").value = savedFeatherAmountSettings.altFeatherAmount;
      document.getElementById("featherCanvasBoundsBool").checked = savedFeatherAmountSettings.featherCanvasBounds;

   document.getElementById('o_findCenter').close("Cancel");
   document.getElementById('o_expandShrink').close("Cancel");
   document.getElementById('o_halveSelection').close("Cancel");
   document.getElementById('o_feather').close("Cancel");
   document.getElementById('o_smoothSelection').close("Cancel");
}));

// entrypoints.setup({
//    commands: {resetPreferences: () => resetPreferences()
//    },
//    panels: {
//       main: {
//          menuItems: [
//             {id: "resetPreferences", 
//             label: "Reset to default settings", 
//             checked: false, 
//             enabled: true,
//             function: () => resetPreferences()}
//             ]
//          }
//       }
//    }
// );

// async function resetPreferences() {
//    await localStorage.delete();
//    await location.reload();
// }