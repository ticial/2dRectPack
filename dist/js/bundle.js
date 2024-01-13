(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  var bloks = [
  	{
  		width: 90,
  		height: 90
  	},
  	{
  		width: 60,
  		height: 115
  	},
  	{
  		width: 50,
  		height: 90
  	},
  	{
  		width: 80,
  		height: 60
  	},
  	{
  		width: 70,
  		height: 70
  	},
  	{
  		width: 20,
  		height: 50
  	},
  	{
  		width: 20,
  		height: 30
  	},
  	{
  		width: 20,
  		height: 50
  	},
  	{
  		width: 30,
  		height: 70
  	},
  	{
  		width: 60,
  		height: 50
  	},
  	{
  		width: 40,
  		height: 50
  	},
  	{
  		width: 20,
  		height: 20
  	},
  	{
  		width: 60,
  		height: 50
  	},
  	{
  		width: 40,
  		height: 50
  	},
  	{
  		width: 20,
  		height: 20
  	},
  	{
  		width: 30,
  		height: 50
  	},
  	{
  		width: 20,
  		height: 20
  	},
  	{
  		width: 30,
  		height: 50
  	},
  	{
  		width: 20,
  		height: 20
  	},
  	{
  		width: 30,
  		height: 50
  	},
  	{
  		width: 60,
  		height: 50
  	},
  	{
  		width: 360,
  		height: 350
  	},
  	{
  		width: 60,
  		height: 0
  	},
  	{
  		width: 40,
  		height: 50
  	},
  	{
  		width: 60,
  		height: 120
  	}
  ];

  class Box {
      constructor(width = 0, height = 0, left = 0, top = 0, right = 0, bottom = 0, id = 0, mark = 0) {
          this.needRemove = false;
          this._width = width;
          this._height = height;
          this._top = top;
          this._left = left;
          this._right = right;
          this._bottom = bottom;
          this._id = id;
          this._mark = mark;
      }
      get width() {
          return this._width;
      }
      get height() {
          return this._height;
      }
      get top() {
          return this._top;
      }
      get left() {
          return this._left;
      }
      get right() {
          return this._right;
      }
      get bottom() {
          return this._bottom;
      }
      get id() {
          return this._id;
      }
      set id(value) {
          this._id = value;
      }
      get mark() {
          return this._mark;
      }
      set mark(value) {
          this._mark = value;
      }
      static createFromSize(width, height, id = 0, mark = 0) {
          return new Box(width, height, 0, 0, width, height, id, mark);
      }
      static createFromCoord(left, top, right, bottom, id = 0, mark = 0) {
          return new Box(right - left, bottom - top, left, top, right, bottom, id, mark);
      }
      clone() {
          return new Box(this.width, this.height, this.left, this.top, this.right, this.bottom, this.id, 0);
      }
      setSize(width, height) {
          this._width = width;
          this._height = height;
          this._right = this.left + width;
          this._bottom = this.top + height;
      }
      setCoord(left, top, right, bottom) {
          this._width = right - left;
          this._height = bottom - top;
          this._top = top;
          this._left = left;
          this._right = right;
          this._bottom = bottom;
      }
      square() {
          return this.width * this.height;
      }
      static isContained(a, b) {
          return a.left >= b.left && a.top >= b.top && a.right <= b.right && a.bottom <= b.bottom;
      }
      static isTouched(a, b) {
          return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
      }
      static isSeparated(a, b) {
          return !(b.left >= a.right || b.right <= a.left || b.top >= a.bottom || b.bottom <= a.top);
      }
  }
  //# sourceMappingURL=Box.js.map

  const BOTTOM_RIGHT_MARK = Number.MAX_SAFE_INTEGER;
  /**
   * Packer class for efficiently packing boxes into a container.
   */
  class Packer {
      constructor(containerWidth, containerHeight) {
          this.containerWidth = containerWidth;
          this.containerHeight = containerHeight;
          this.boxes = [];
          this.packedBoxes = [];
          this.freeBoxes = [];
          this.badBoxes = [];
          this.notPlacedBoxes = [];
          this.isPrepared = false;
          this._fullness = -1;
      }
      /**
       * Resizes the container dimensions for the Packer instance.
       *
       * @param width - The new width of the container.
       * @param height - The new height of the container.
       */
      resizeContainer(width, height) {
          this.containerWidth = width;
          this.containerHeight = height;
      }
      /**
       * Clears all data, resetting the state of the packing algorithm.
       */
      clear() {
          this.boxes.length = 0;
          this.reset();
      }
      /**
       * Resets the state of the packing algorithm, clearing various lists and resetting variables.
       * This method is called internally during the preparation phase.
       */
      reset() {
          this.packedBoxes.length = 0;
          this.freeBoxes.length = 0;
          this.badBoxes.length = 0;
          this.notPlacedBoxes.length = 0;
          this._fullness = -1;
          this.isPrepared = false;
      }
      /**
       * Adds a box to the list of boxes, automatically rotating it if the width is greater than the height.
       *
       * @param width - The width of the box.
       * @param height - The height of the box.
       * @param id - The identifier for the box (optional, default is 0).
       */
      addBox(width, height, id = 0) {
          const box = Box.createFromSize(Math.min(width, height), Math.max(width, height), id);
          this.boxes.push(box);
          this.isPrepared = false;
      }
      /**
       * Prepares the algorithm for packing by filtering out bad boxes, sorting them, and adding an initial free box.
       * This method should be called before packing the boxes.
       */
      prepare() {
          this.reset();
          this.boxes = this.filterBadBoxes(this.boxes);
          this.boxes.sort((a, b) => (a.width === b.width ? b.height - a.height : b.width - a.width));
          this.addFreeBox(0, 0, this.containerWidth, this.containerHeight);
          this.isPrepared = true;
      }
      /**
       * Filters out oversized and undersized boxes, adding them to the list of bad boxes.
       *
       * @param boxes - An array of boxes to be filtered.
       * @returns An array of filtered boxes that meet the size criteria.
       */
      filterBadBoxes(boxes) {
          return boxes.filter(box => {
              if ((box.width > this.containerWidth && box.width > this.containerHeight) ||
                  (box.height > this.containerWidth && box.height > this.containerHeight) ||
                  (box.width <= 0 || box.height <= 0)) {
                  this.badBoxes.push(box);
                  return false;
              }
              return true;
          });
      }
      /**
       * Packs the available boxes into containers using a specific algorithm.
       * The method first prepares the data if not already prepared.
       * It then iterates through the boxes, finding the best position for each,
       * and adds the packed boxes to the list of packedBoxes.
       * Finally, it collects the boxes that couldn't be placed into notPlacedBoxes.
       *
       * @returns An array containing the packed boxes.
       */
      pack() {
          // Prepare data if not already prepared
          if (!this.isPrepared)
              this.prepare();
          const boxes = this.boxes;
          const packedBoxes = this.packedBoxes;
          const testBox = new Box();
          // Iterate through the remaining unpacked boxes
          while (boxes.length !== packedBoxes.length) {
              let bestScore = 0;
              let bestBoxIndex = -1;
              let bestBox;
              // Find the best position for each box
              for (let i = 0, total = boxes.length; i < total; i++) {
                  if (boxes[i].needRemove)
                      continue;
                  this.findBoxPosition(boxes[i], testBox);
                  if (testBox.mark > bestScore) {
                      bestScore = testBox.mark;
                      bestBox = testBox.clone();
                      bestBoxIndex = i;
                  }
              }
              // Check if a valid position was found
              if (bestBoxIndex === -1 || !bestBox) {
                  break;
              }
              // Add the bestBox to the list of packed boxes and mark the original box as removed
              this.addPackedBox(bestBox);
              boxes[bestBoxIndex].needRemove = true;
          }
          // Collect the boxes that couldn't be placed into notPlacedBoxes
          for (const box of boxes) {
              if (!box.needRemove) {
                  this.notPlacedBoxes.push(box);
              }
              box.needRemove = false;
          }
          return this.packedBoxes;
      }
      /**
       * Finds the best position for a given box within the available free boxes.
       *
       * @param box - The box to be positioned.
       * @param testBox - The test box to store the final coordinates and score.
       */
      findBoxPosition(box, testBox) {
          let bestScore = -1;
          testBox.mark = 0;
          for (const freeBox of this.freeBoxes) {
              // Check if the box can fit horizontally
              if (freeBox.width >= box.width && freeBox.height >= box.height) {
                  let score = this.calculateScore(freeBox.left, freeBox.top, freeBox.left + box.width, freeBox.top + box.height);
                  if (score > bestScore) {
                      testBox.setCoord(freeBox.left, freeBox.top, freeBox.left + box.width, freeBox.top + box.height);
                      bestScore = score;
                  }
              }
              // Check if the box can fit vertically
              if (freeBox.width >= box.height && freeBox.height >= box.width) {
                  let score = this.calculateScore(freeBox.left, freeBox.top, freeBox.left + box.height, freeBox.top + box.width);
                  if (score > bestScore) {
                      testBox.setCoord(freeBox.left, freeBox.top, freeBox.left + box.height, freeBox.top + box.width);
                      bestScore = score;
                  }
              }
          }
          testBox.mark = bestScore;
          testBox.id = box.id;
      }
      /**
       * Calculates a score based on the specified coordinates, considering the placement of existing packed boxes.
       * The score is determined by the length of common intervals with existing boxes.
       *
       * @param left - The left coordinate of the box.
       * @param top - The top coordinate of the box.
       * @param right - The right coordinate of the box.
       * @param bottom - The bottom coordinate of the box.
       * @returns The calculated score.
       */
      calculateScore(left, top, right, bottom) {
          let score = 0;
          if (left === 0 || right === this.containerWidth)
              score += bottom - top;
          if (top === 0 || bottom === this.containerHeight)
              score += right - left;
          for (const box of this.packedBoxes) {
              if (box.left === right || box.right === left)
                  score += this.commonIntervalLength(box.top, box.bottom, top, bottom);
              if (box.top === bottom || box.bottom === top)
                  score += this.commonIntervalLength(box.left, box.right, left, right);
          }
          return score;
      }
      /**
       * Calculates the length of the common interval between two ranges.
       *
       * @param startA - The start coordinate of the first range.
       * @param endA - The end coordinate of the first range.
       * @param startB - The start coordinate of the second range.
       * @param endB - The end coordinate of the second range.
       * @returns The length of the common interval or 0 if there is no overlap.
       */
      commonIntervalLength(startA, endA, startB, endB) {
          return endA < startB || endB < startA ? 0 : Math.min(endA, endB) - Math.max(startA, startB);
      }
      /**
       * Adds a packed box to the list of packed boxes, updating the list of free boxes by splitting and removing intersecting boxes.
       *
       * @param box - The box to be added to the list of packed boxes.
       */
      addPackedBox(box) {
          const freeBoxes = this.freeBoxes;
          // Split and mark intersecting free boxes
          for (const freeBox of this.freeBoxes) {
              if (Box.isSeparated(freeBox, box)) {
                  this.splitFreeBox(freeBox, box);
                  freeBox.needRemove = true;
              }
          }
          // Mark fully contained free boxes
          for (let i = 0; i < freeBoxes.length - 1; i++) {
              const box1 = freeBoxes[i];
              if (box1.needRemove)
                  continue;
              for (let j = i + 1; j < freeBoxes.length; j++) {
                  const box2 = freeBoxes[j];
                  if (box2.needRemove)
                      continue;
                  if (Box.isContained(box1, box2)) {
                      box1.needRemove = true;
                      break;
                  }
                  if (Box.isContained(box2, box1)) {
                      box2.needRemove = true;
                  }
              }
          }
          // Remove marked free boxes and add the packed box
          this.freeBoxes = this.freeBoxes.filter(box => !box.needRemove);
          this.packedBoxes.push(box);
      }
      /**
       * Splits the given free box based on the dimensions of the box.
       * Adds new free boxes created from the non-overlapping regions.
       *
       * @param freeBox - The free box to be split.
       * @param box - The box determining the split dimensions.
       */
      splitFreeBox(freeBox, box) {
          if (box.top > freeBox.top && box.top < freeBox.bottom) {
              this.addFreeBox(freeBox.left, freeBox.top, freeBox.right, box.top);
          }
          if (box.bottom < freeBox.bottom) {
              this.addFreeBox(freeBox.left, box.bottom, freeBox.right, freeBox.bottom);
          }
          if (box.left > freeBox.left && box.left < freeBox.right) {
              this.addFreeBox(freeBox.left, freeBox.top, box.left, freeBox.bottom);
          }
          if (box.right < freeBox.right) {
              this.addFreeBox(box.right, freeBox.top, freeBox.right, freeBox.bottom);
          }
      }
      /**
       * Adds a new free box to the list of free boxes based on the specified coordinates.
       *
       * @param left - The left coordinate of the new free box.
       * @param top - The top coordinate of the new free box.
       * @param right - The right coordinate of the new free box.
       * @param bottom - The bottom coordinate of the new free box.
       */
      addFreeBox(left, top, right, bottom) {
          const box = Box.createFromCoord(left, top, right, bottom);
          this.freeBoxes.push(box);
      }
      /**
       * Calculates the fullness ratio of the container based on the free and packed boxes.
       * The fullness ratio represents the occupied space in the container.
       *
       * @returns The fullness ratio, ranging from 0 to 1, where 0 means empty and 1 means fully occupied.
       */
      calculateFullness() {
          const freeBoxes = this.freeBoxes;
          let nextMark = 1;
          // Mark bottom-right corner of full-size free boxes
          for (const box of freeBoxes) {
              if (box.right === this.containerWidth && box.bottom === this.containerHeight)
                  box.mark = BOTTOM_RIGHT_MARK;
              else
                  box.mark = 0;
          }
          // Mark touched free boxes with the same mark
          for (let i = 0; i < freeBoxes.length - 1; i++) {
              const box1 = freeBoxes[i];
              for (let j = i + 1; j < freeBoxes.length; j++) {
                  const box2 = freeBoxes[j];
                  if (Box.isTouched(box1, box2)) {
                      let mark = Math.max(box1.mark, box2.mark);
                      if (mark === 0)
                          mark = nextMark++;
                      box2.mark = box1.mark = mark;
                  }
              }
          }
          const innerSquare = freeBoxes.reduce((accum, box) => (box.mark !== BOTTOM_RIGHT_MARK ? accum + box.square() : accum), 0);
          const boxSquare = this.packedBoxes.reduce((accum, box) => accum + box.square(), 0);
          // Calculate the fullness ratio
          this._fullness = 1 - innerSquare / (boxSquare + innerSquare);
      }
      /**
       * Retrieves the fullness ratio of the container. If the fullness has not been calculated yet,
       * it calculates it using the `calculateFullness` method and returns the result.
       *
       * @returns The fullness ratio, ranging from 0 to 1, where 0 means empty and 1 means fully occupied.
       */
      get fullness() {
          if (this._fullness === -1)
              this.calculateFullness();
          return this._fullness;
      }
      boxesSize() {
          return this.boxes.length;
      }
  }
  //# sourceMappingURL=Packer.js.map

  const template = document.getElementById("rect-data-template");
  const containerDiv = document.querySelector(".container");
  const fullnessSpan = document.getElementById("fullness");
  const rectList = document.querySelector(".rect-list");
  const rectWidthInput = document.getElementById("rect-width");
  const rectHeightInput = document.getElementById("rect-height");
  const addRectButton = document.getElementById("add-rect-button");
  const containerWidthInput = document.getElementById("container-width");
  const containerHeightInput = document.getElementById("container-height");
  const setupContainerButton = document.getElementById("setup-container-button");
  let blocksParams = bloks;
  let containerSize = { width: 350, height: 300 };
  containerWidthInput.value = String(containerSize.width);
  containerHeightInput.value = String(containerSize.height);
  const packer = new Packer(containerSize.width, containerSize.height);
  addBlocks(blocksParams);
  addRectButton.onclick = event => {
      event.preventDefault();
      const rect = {
          width: parseInt(rectWidthInput.value),
          height: parseInt(rectHeightInput.value)
      };
      addBlock(rect, packer.boxesSize());
  };
  setupContainerButton.onclick = event => {
      event.preventDefault();
      resizeContainer(parseInt(containerWidthInput.value), parseInt(containerWidthInput.value));
      update();
  };
  function resizeContainer(width, height) {
      containerSize.width = width;
      containerSize.height = height;
      packer.resizeContainer(width, height);
      update();
  }
  function addBlocks(blocks) {
      blocksParams = blocks;
      blocks.forEach((block, i) => {
          packer.addBox(block.width, block.height, i + 1);
      });
      update();
  }
  function addBlock(block, id) {
      blocksParams.push(block);
      packer.addBox(block.width, block.height, id);
      update();
  }
  function pack() {
      const boxes = packer.pack();
      const blockCoordinates = boxes.map(({ top, left, right, bottom, id }) => ({
          top,
          left,
          right,
          bottom,
          initialOrder: id
      }));
      const fullness = packer.fullness;
      return {
          fullness,
          blockCoordinates
      };
  }
  function update() {
      const { fullness, blockCoordinates } = pack();
      fillRectList(blocksParams);
      drawBlocks(containerSize, fullness, blockCoordinates);
  }
  function fillRectList(blocksParams) {
      rectList.innerHTML = "";
      for (const block of blocksParams) {
          const rectItem = template.content.cloneNode(true);
          rectItem.querySelector(".width").innerHTML = block.width + "";
          rectItem.querySelector(".height").innerHTML = block.height + "";
          rectList.appendChild(rectItem);
      }
  }
  function getRandomColor() {
      var letters = "0123456789ABCDEF".split("");
      var color = "#";
      for (var i = 0; i < 6; i++) {
          color += letters[Math.round(Math.random() * 15)];
      }
      return color;
  }
  function createColorMapGenerator() {
      const colorMap = new Map();
      const colorSet = new Set();
      return function (key) {
          let color = colorMap.get(key);
          if (!color) {
              do {
                  color = getRandomColor();
              } while (colorSet.has(color));
              colorSet.add(color);
              colorMap.set(key, color);
          }
          return color;
      };
  }
  function drawBlocks(containerSize, fullness, blockCoordinates) {
      fullnessSpan.textContent = (fullness * 100).toFixed(2);
      containerDiv.innerHTML = "";
      containerDiv.style.width = containerSize.width + "px";
      containerDiv.style.height = containerSize.height + "px";
      const getColor = createColorMapGenerator();
      for (const block of blockCoordinates) {
          const rectDiv = document.createElement("div");
          const width = block.right - block.left;
          const height = block.bottom - block.top;
          rectDiv.classList.add("rect");
          rectDiv.style.bottom = block.top + "px";
          rectDiv.style.left = block.left + "px";
          rectDiv.style.width = width + "px";
          rectDiv.style.height = height + "px";
          const sizeKey = Math.min(width, height) + "x" + Math.max(width, height);
          rectDiv.style.backgroundColor = getColor(sizeKey);
          containerDiv.append(rectDiv);
          const rectIdDiv = document.createElement("div");
          rectIdDiv.classList.add("rect-id");
          rectIdDiv.textContent = String(block.initialOrder);
          rectDiv.append(rectIdDiv);
      }
  }
  update();

})));
//# sourceMappingURL=bundle.js.map
