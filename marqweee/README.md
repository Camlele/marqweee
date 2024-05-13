# Marqweee!

Marqweee is a set of scripts meant to improve workflow and extend the capability of Photoshop's marquee tools.

## Compatibility

Photoshop v22.5.0 or newer

## Use

### Select layer bounds
- Selects the bounds of the active layer, aka the bounds of the art in a layer.
- Alt / Option clicking selects the bounds of art without effects.

- Useful for:
	- Masking a layer whose bounds is indeterminate for art asset swapping or similar.

### Find selection center
- Finds the center of a selection and marks it with one or all of the following:
	- guides
	- a colour sampler
	- a 2x2 pixel in a new layer
- Alt / Option click removes all guides and colour samplers
- Alt / Option clicking three times removes all centerpoint pixel layers. 

- Useful for:
	- A tangible reference of the center layer for positioning or asset placement.
	- Visual reference for export to other programs like Spine, especially when art is symmetric but not centered in its bounds. 

### Expand / shrink selection
- Expands or shrinks the active selection by the user's input (default is 1px).
- Alt / Option click expands or shrinks the selection by the user's input (default is 5px).

- Useful for:
	- QOL.
	- Quick padding or clipping before art export or masking.

### Halve selection
- Halves the left or top of the active selection or the canvas bounds, depending on user input. 
- Alt / Option click halves the right or bottom half.

- Useful for:
	- Dividing art into halves or quarters for mirroring

### Feather selection
- Feathers the active selection by the user's input (default is 5px).
- Alt / Option click feathers the selection by the user's input (default is 15px).

- Useful for:
	- QOL.

### Smooth selection
- Smooths the active selection by the user's input (default is 5px).
- Alt / Option click smooths the selection by the user's input (default is 15px).

- Useful for:
	- QOL.

### Guides to selection:
- When checked, new guides become a marquee selection from the position of the guide to the left or top of the canvas.
- Dragging a guide to the right / bottom of a selection adds to the selection. 
- Dragging a guide to the left / top of a selection subtracts from the original selection.
- Alt / Option click smooths the selection by the user's input (default is 15px).

- Useful for:
	- Ensuring an accurate selection on a large asset
