import Packer from "./packer/Packer";
import { PackDirection, RectCoord, Size } from "./packer/types";

const template = document.getElementById("rect-data-template") as HTMLTemplateElement;
const containerDiv = document.querySelector(".container") as HTMLElement;
const fullnessSpan = document.getElementById("fullness") as HTMLElement;
const rectList = document.querySelector(".rect-list") as HTMLElement;

const rectWidthInput = document.getElementById("rect-width") as HTMLInputElement;
const rectHeightInput = document.getElementById("rect-height") as HTMLInputElement;
const addRectButton = document.getElementById("add-rect-button") as HTMLElement;

const containerWidthInput = document.getElementById("container-width") as HTMLInputElement;
const containerHeightInput = document.getElementById("container-height") as HTMLInputElement;
const setupContainerButton = document.getElementById("setup-container-button") as HTMLElement;

const packingDirectionSelect = document.getElementById("packing-direction") as HTMLSelectElement;

let blocksParams: Size[] = [];
let containerSize: Size = { width: 350, height: 300 };

containerWidthInput.value = String(containerSize.width);
containerHeightInput.value = String(containerSize.height);

const packer = new Packer(containerSize.width, containerSize.height, "none");

addRectButton.onclick = event => {
  event.preventDefault();
  const rect: Size = {
    width: parseInt(rectWidthInput.value),
    height: parseInt(rectHeightInput.value)
  };
  addBlock(rect, blocksParams.length);
};

setupContainerButton.onclick = event => {
  event.preventDefault();
  resizeContainer(parseInt(containerWidthInput.value), parseInt(containerHeightInput.value));
};

packingDirectionSelect.onchange = event => {
  changeDirection(packingDirectionSelect.value as PackDirection);
};

function resizeContainer(width: number, height: number) {
  containerSize.width = width;
  containerSize.height = height;
  packer.resizeContainer(width, height);
  update();
}

function addBlocks(blocks: Size[]) {
  blocks.forEach((block, i) => {
    packer.addBox(block.width, block.height, i);
  });

  blocksParams = blocks;
  fillRectList();
  update();
}

function addBlock(block: Size, id: number) {
  packer.addBox(block.width, block.height, id);
  blocksParams.push(block);
  fillRectList();
  update();
}

function changeDirection(direction: PackDirection) {
  packer.setDirection(direction);
  update();
}

function pack() {
  const boxes = packer.pack();
  const blockCoordinates: RectCoord[] = boxes.map(({ top, left, right, bottom, id }) => ({
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
  drawBlocks(containerSize, fullness, blockCoordinates);
}

function fillRectList() {
  rectList.innerHTML = "";
  for (const block of blocksParams) {
    const rectItem = template.content.cloneNode(true) as HTMLElement;
    (<HTMLElement>rectItem.querySelector(".width")).innerHTML = block.width + "";
    (<HTMLElement>rectItem.querySelector(".height")).innerHTML = block.height + "";
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
  const colorMap = new Map<string, string>();
  const colorSet = new Set<string>();

  return function(key: string) {
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

function drawBlocks(containerSize: Size, fullness: number, blockCoordinates: RectCoord[]) {
  fullnessSpan.textContent = (fullness * 100).toFixed(2);
  containerDiv.innerHTML = "";
  containerDiv.style.minWidth = containerSize.width + "px";
  containerDiv.style.minHeight = containerSize.height + "px";

  const getColor = createColorMapGenerator();

  for (const block of blockCoordinates) {
    const rectDiv = document.createElement("div") as HTMLElement;

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

    const rectIdDiv = document.createElement("div") as HTMLElement;
    rectIdDiv.classList.add("rect-id");
    rectIdDiv.textContent = String(block.initialOrder);
    rectDiv.append(rectIdDiv);
  }
}

async function loadBlocksData() {
  try {
    const response = await fetch("./blocksData.json");

    if (!response.ok) {
      throw new Error(`Failed to load blocksData.json (HTTP ${response.status})`);
    }

    const blocksParams = await response.json();
    addBlocks(blocksParams);
    update();
  } catch (error) {
    console.error("Error loading blocksData.json:", error.message);
  }
}

loadBlocksData();
