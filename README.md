# Introduction

v1.0.0

This is a set of scripts meant to improve workflow or extend the capability of Photoshop's marquee tools.

## Compatibility

Photoshop v22.0.0 or newer

## Use

##### Select layer bounds:
- Selects the bounds of the active layer, aka the bounds of the art in a layer.

- Useful for:
	- Masking a layer whose bounds is indeterminate for art asset swapping or similar.

##### Find selection center:
- Finds the center of a selection and marks it with one or all of the following:
	- guides
	- a colour sampler
	- a 2x2 pixel in a new layer
- Alt/Option click removes all guides and colour samplers
- Alt/Option clicking twice removes all centerpoint pixel layers. 

- Useful for:
	- A tangible reference of the center layer for positing or asset placement.
	- Visual reference for export to other programs like Spine, especially when art is symmetric but not centered in its bounds. 

##### Expand / shrink selection
- Expands or shrinks the active selection by the user's input (default is 1px).
- Alt/Option click expands or shrinks the selection by the user's input (default is 5px).

- Useful for:
	- QOL.
	- Quick padding or clipping before art export or masking.

##### Halve selection
- Halves the left or top of the active selection or the canvas bounds, depending on user input. 
- Alt/option click halves the right or bottom half.

- Useful for:
	- Dividing art into halves or quarters for mirroring

##### Feather selection
- Feathers the active selection by the user's input (default is 5px).
- Alt/Option click feathers the selection by the user's input (default is 15px).

- Useful for:
	- QOL.

##### Smooth selection
- Smooths the active selection by the user's input (default is 5px).
- Alt/Option click smooths the selection by the user's input (default is 15px).

- Useful for:
	- QOL.
