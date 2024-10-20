// @ts-nocheck

//
// From: https://github.com/intergi/pw-react-component
//

import React from "react";
import store from "./store";

window.ramp = window.ramp || {};
window.ramp.que = window.ramp.que || [];

const inPageUnits = [
	"leaderboard_atf",
	"leaderboard_btf",
	"med_rect_atf",
	"med_rect_btf",
	"sky_atf",
	"sky_btf",
];

// find a new unique element ID to place this ad
const getUniqueId = (type) => {
	return store.getUnitId(type);
};

// sets up the object and adds a selectorId if necessary
const getInitialUnit = (props) => {
	const unit = {
		type: props.type,
	};
	if (inPageUnits.includes(props.type)) {
		unit.selectorId = getUniqueId(props.type);
	}
	return unit;
};

// destroy the unit when componenent unmounts
const cleanUp = (parentId) => {
	// possible that component was removed before first ad was created
	if (!window.ramp.settings || !window.ramp.settings.slots) return;

	let slotToRemove = null;
	for (const [slotName, slot] of Object.entries(window.ramp.settings.slots)) {
		if (
			slot.element?.parentElement &&
			slot.element.parentElement.id === parentId
		) {
			slotToRemove = slotName;
		}
	}

	if (slotToRemove) {
		window.ramp.destroyUnits(slotToRemove);
	}
};

export default class RampUnit extends React.Component {
	constructor(props) {
		super(props);
		this.rendered = false;
		this.unitToAdd = getInitialUnit(props);
	}
	componentDidMount() {
		if (this.rendered) return;

		this.rendered = true;
		window.ramp.que.push(() => {
			window.ramp
				.addUnits([this.unitToAdd])
				.catch((e) => {
					console.warn(e);
				})
				.finally(() => {
					window.ramp.displayUnits();
				});
		});
	}
	componentWillUnmount() {
		window.ramp.que.push(() => {
			if (!this.unitToAdd) return;
			cleanUp(this.unitToAdd.selectorId);
		});
	}
	render() {
		return (
			<div id={this.unitToAdd.selectorId} className={this.props.cssClass} />
		);
	}
}
