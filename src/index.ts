import bloks from "./blocksData.json";
import Packer from "./packer/Packer";
import { RectCoord, Size } from "./types";

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

addRectButton.onclick = event => {
  event.preventDefault();
  const rect: Size = {
    width: parseInt(rectWidthInput.value),
    height: parseInt(rectHeightInput.value)
  };
  blocksParams.push(rect);
  update();
};

setupContainerButton.onclick = event => {
  event.preventDefault();
  containerSize.width = parseInt(containerWidthInput.value);
  containerSize.height = parseInt(containerHeightInput.value);
  update();
};

function update() {
  fillRectList(blocksParams);
  updateContainer(blocksParams, containerSize);
}

function fillRectList(blocksParams: Size[]) {
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
  containerDiv.style.width = containerSize.width + "px";
  containerDiv.style.height = containerSize.height + "px";

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

function updateContainer(blocksParams: Size[], containerSize: Size) {
  const packer = new Packer(containerSize.width, containerSize.height);
  blocksParams.forEach((rect, i) => {
    packer.addBox(rect.width, rect.height, i + 1);
  });
  const boxes = packer.pack();
  const blockCoordinates = boxes.map(({ top, left, right, bottom, id }) => ({
    top,
    left,
    right,
    bottom,
    initialOrder: id
  }));
  const fullness = packer.getFullness();

  drawBlocks(containerSize, fullness, blockCoordinates);
}

const blocksParams: Size[] = bloks;
const containerSize: Size = { width: 350, height: 300 };

containerWidthInput.value = String(containerSize.width);
containerHeightInput.value = String(containerSize.height);

update();
