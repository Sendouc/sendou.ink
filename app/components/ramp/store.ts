/* eslint-disable */
// @ts-nocheck

//
// From: https://github.com/intergi/pw-react-component
//

class Store {
  units = {};
  getUnitId = (unit) => {
    if (typeof this.units[unit] === "undefined") {
      this.units[unit] = 1;
      return `pw-${unit}`;
    } else {
      ++this.units[unit];
      return `pw-${unit}${this.units[unit]}`;
    }
  };
}
export default new Store();
