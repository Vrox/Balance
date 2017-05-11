// const BUTTON_COLOR = '#444444';
// const BUTTON_HOVER_COLOR = '#555555';
// const BUTTON_SELECTED_COLOR = '#666600';
//
// class SidebarButton {
//   constructor(x, y, size, drawIcon, onSelect, isSelected) {
//     this.x = x;
//     this.y = y;
//     this.size = size;
//     this.drawIcon = drawIcon;
//     this.onSelect = onSelect;
//     this.isSelected = isSelected;
//   }
//
//   draw(mouseLoc) {
//     textureCtx.fillStyle = this.isSelected() ? BUTTON_SELECTED_COLOR :
//     (mouseLoc.x > this.x && mouseLoc.x < this.x + this.size && mouseLoc.y > this.y && mouseLoc.y < this.y + this.size) ?
//       BUTTON_HOVER_COLOR : BUTTON_COLOR;
//     textureCtx.fillRect(this.x, this.y, this.size, this.size);
//     this.drawIcon();
//   }
//
//   checkPress(mouseX, mouseY) {
//     if (mouseX > this.x && mouseX < this.x + this.size && mouseY > this.y && mouseY < this.y + this.size) {
//       this.onSelect();
//     }
//   }
// }
//
// export default SidebarButton;
