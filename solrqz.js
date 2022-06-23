//////////////////////////
// Solar Solvr: Quizzes //
//////////////////////////

if(!String.prototype.includes) {
	String.prototype.includes = (search, start) => {
		"use strict";
		if(search instanceof RegExp) {
			throw TypeError("first argument must not be a RegExp")}
		if(start === undefined) {start = 0}
		return this.indexOf(search, start) !== -1
	}
}

function ssQzPocoChk(x) {
	let y = [
		{"pr": "newfoundland-labrador", "pc": ["a"]},
		{"pr": "nova-scotia", "pc": ["b"]},
		{"pr": "prince-edward-island", "pc": ["c"]},
		{"pr": "new-brunswick", "pc": ["e"]},
		{"pr": "quebec", "pc": ["g", "h", "j"]},
		{"pr": "ontario", "pc": ["k", "l", "m", "n", "p"]},
		{"pr": "manitoba", "pc": ["r"]},
		{"pr": "saskatchewan", "pc": ["s"]},
		{"pr": "alberta", "pc": ["t"]},
		{"pr": "british-columbia", "pc": ["v"]},
		{"pr": ["nunavut", "northwest-territories"], "pc": ["x"]},
		{"pr": "yukon-territory", "pc": ["y"]}
	], z = "";
	y.forEach(a => {
		a.pc.forEach(b => {
			if(x.substring(0, 1).toLowerCase() == b) {
				z = a.pr;
				if(Array.isArray(z)) {
					let c = x.substring(0, 3).toLowerCase();
					if(c == "x0a" || c == "x0b" || c == "x0c") {z = a.pr[0]}
					else if(c == "x0e" || c == "x0g" || c == "x1a") {z = a.pr[1]}
					else {z = ""}
				}
			}
		})
	});
	return z
}

function ssQzRedirectSet(x, ac, qz) {
	if(x === undefined || ac === undefined || qz === undefined) {return}
	if(!x.hasOwnProperty("el") || !qz.hasOwnProperty("input") || !qz.hasOwnProperty("form")) {return}
	let a = "", b = "?";
	qz.input.forEach(y => {
		if(y.el.hasAttribute("data-ss-qz-action") && y.el.value != "") {
			let z = y.el.getAttribute("data-ss-qz-action");
			if(z.includes("redirect")) {
				if(y.el.type == "radio" || y.el.type == "checkbox") {
					if(y.el.checked == false) {return}}
				if(z.includes("path")) {
					let c = y.el.value;
					if(ac.includes("poco")) {
						c = ssQzPocoChk(c);
						if(ac.includes("loco")) {
							let d = x.el.getAttribute("name");
							if(x.hasOwnProperty("options") && x.options.hasOwnProperty("name")) {d = x.options.name}
							if(c != "") {qz.loco[d] = c}
							else {delete qz.loco[d]}
							let e = JSON.stringify(qz.loco);
							if(e.length >= 3) {localStorage.setItem("ssqz", e)}
							else {localStorage.removeItem("ssqz")}
							ssQzRef.forEach(f => {f.loco = qz.loco})
						}
					}
					if(c != "") {a += "/" + c}
				}
				if(z.includes("param")) {
					let c = y.el.getAttribute("name");
					if(y.hasOwnProperty("options") && y.options.hasOwnProperty("name")) {
						c = y.options.name}
					if(b != "?") {c = "&" + c}
					b += c + "=" + y.el.value
				}
			}
		}
	});
	if(a != "" || b != "?") {
		let c = a; if(b != "?") {c += b}
		c = encodeURI(c);
		qz.form.forEach(y => {
			if(y.hasOwnProperty("el") && y.el.hasAttribute("data-ss-qz-redirect")) {
				c = y.el.getAttribute("data-ss-qz-redirect") + c;
				y.el.setAttribute("data-ss-qz-redirecturl", c)
			}
		})
	}
	else {qz.form.forEach(y => {
		if(y.hasOwnProperty("el")) {y.el.removeAttribute("data-ss-qz-redirecturl")}})}
}

function ssQzLocoSet(x, qz) {
	if(x === undefined || qz === undefined) {return}
	if(!x.hasOwnProperty("el") || !qz.hasOwnProperty("loco")) {return}
	if(x.el.tagName.toLowerCase() == "input" || x.el.tagName.toLowerCase() == "select") {
		let a = x.el.getAttribute("name");
		if(x.hasOwnProperty("options") && x.options.hasOwnProperty("name")) {a = x.options.name}
		if(x.el.value != "" || x.el.checked == true) {qz.loco[a] = x.el.value}
		else if(qz.loco.hasOwnProperty(a)) {delete qz.loco[a]}
		let b = JSON.stringify(qz.loco);
		if(b.length >= 3) {localStorage.setItem("ssqz", b)}
		else {localStorage.removeItem("ssqz")}
		ssQzRef.forEach(y => {y.loco = qz.loco})
	}
}

function ssQzCalcSet(x, qz) {
	if(x === undefined || qz === undefined) {return}
	if(!x.hasOwnProperty("el") || !x.hasOwnProperty("options")) {return}
	if(!x.options.hasOwnProperty("calc") || !qz.hasOwnProperty("calc")) {return}
	let y = x.options.calc, z;
	//
	for(a in x.options) {
		if(a.includes("calcmatch")) {
			a = a.replace("calcmatch", "");
			qz.calc.forEach(b => {
				for(c in b.options) {
					if(a == c) {
						let d = b.options[c];
						let e = x.options["calcmatch" + a];
						if(e.includes("[loco]")) {
							e = e.replace("[loco]", "");
							if(qz.hasOwnProperty("loco") && qz.loco.hasOwnProperty(e)) {
								e = qz.loco[e]
							}
						}
						if(d == e) {z = b.options}
					}
				}
			})
		}
	}
	//
	if(z !== undefined) {
		for(a in z) {
			if(y.includes(a)) {
				let b = z[a];
				if(b.includes("[loco]")) {
					b = b.replace("[loco]", "");
					if(qz.hasOwnProperty("loco") && qz.loco.hasOwnProperty(b)) {
						b = qz.loco[b]
					}
				}
				// percentage
				if(b.includes("%")) {
					b = b.replace("%", "");
					b = Number(b) / 100
				}
				while(y.includes(a)) {y = y.replace(a, b)}
			}
		}
		if(typeof y == "string") {
			if(y.includes("[compound]") || y.includes("[compoundtotal]")) {
				let b = 1, c;
				if(y.includes("[compoundtotal]")) {
					c = 0; y = y.replace("[compoundtotal]", "")}
				else {y = y.replace("[compound]", "")}
				y = y.split(":");
				if(!isNaN(y[0])) {
					b = Number(y[0]);
					y.splice(0, 1);
				}
				if(y.length == 2 && typeof y[0] == "string" && !isNaN(y[1])) {
					y = [eval(y[0]), Number(y[1])];
					if(c !== undefined) {c += y[0]}
					for(let i = 0; i < b - 1; i++) {
						y[0] = y[0] + (y[0] * y[1]);
						if(c !== undefined) {c += y[0]}
					}
					if(c !== undefined) {y = c}
					else {y = y[0]}
				}
			}
			else {y = eval(y)}
			if(typeof y == "number") {
				if(x.options.hasOwnProperty("heightpercent")) {
					y = ((y / Number(x.options.heightpercent)) * 100).toFixed(2);
					x.el.style.height = y + "%"
				}
				else {
					y = Math.round(y);
					x.el.textContent = y
				}
			}
		}
	}
}

function ssQzActions(x, qz) {
	if(!x.hasOwnProperty("el") || !x.el.hasAttribute("data-ss-qz-action")) {return}
	let y = x.el.getAttribute("data-ss-qz-action").split("&"), z;
	if(x.el.hasAttribute("data-ss-qz-target")) {z = x.el.getAttribute("data-ss-qz-target").split("&")}
	y.forEach((ac, i) => {
		let tr, ta;
		if(ac.includes("=")) {tr = ac.split("=")[0]; ac = ac.split("=")[1]}
		if(z !== undefined && z.length <= i + 1 && document.querySelector(z[i])) {ta = z[i]}
		// actions
		if(tr !== undefined) {
			// local storage
			if(ac.includes("localstorage") && qz !== undefined && qz.hasOwnProperty("loco")) {
				x.el.addEventListener(tr, () => {ssQzLocoSet(x, qz)})}
			// redirect
			if(ac.includes("redirect") && qz !== undefined && qz.hasOwnProperty("input") && qz.hasOwnProperty("form")) {
				x.el.addEventListener(tr, () => {ssQzRedirectSet(x, ac, qz)})}
		}
	})
}

function ssQzLocoPop(x, qz) {
	if(x === undefined || qz === undefined) {return}
	if(!x.hasOwnProperty("el") || 
		x.hasOwnProperty("el") && x.el.getAttribute("data-ss-qz") != "input") {return}
	let y = x.el.name;
	if(x.hasOwnProperty("options")) {
		if(x.options.hasOwnProperty("autofill") && x.options.autofill == "false") {return}
		if(x.options.hasOwnProperty("name")) {y = x.options.name}
	}
	if(qz.hasOwnProperty("loco") && qz.loco.hasOwnProperty(y)) {
		if(x.el.type == "radio" || x.el.type == "checkbox") {
			if(x.el.value == qz.loco[y]) {window.addEventListener("load", () => {x.el.click()})}
		}
		else {x.el.value = qz.loco[y]}
	}
}

function ssQzToArray(x) {
	let y = [];
	if(x !== undefined) {for(let i = 0; i < x.length; i++) {y.push(x[i])}}
	return y
}

// setup
var ssQzRef = [];
if(document.querySelector("[data-ss='qz']")) {
	let x = ssQzToArray(document.querySelectorAll("[data-ss='qz']"));
	x.forEach((y, i) => {
		let loco = {};
		if(localStorage.getItem("ssqz")) {
			loco = JSON.parse(localStorage.getItem("ssqz"))
		}
		ssQzRef.push({"qz": y, "id": i, "loco": loco})
	});
	ssQzRef.forEach(qz => {
		let y = ssQzToArray(qz.qz.querySelectorAll("[data-ss-qz]"));
		y.forEach(z => {
			let a = z.getAttribute("data-ss-qz"); z = {"el": z, "options": {}}
			if(z.el.hasAttribute("data-ss-qz-options")) {
				let b = z.el.getAttribute("data-ss-qz-options").split("&");
				b.forEach(c => {c = c.split("="); z.options[c[0]] = c[1]})
			}
			if(qz.hasOwnProperty(a)) {
				if(!Array.isArray(qz[a])) {qz[a] = [qz[a]]}
				qz[a].push(z)
			}
			else {qz[a] = [z]}
			ssQzLocoPop(z, qz);
			ssQzCalcSet(z, qz);
			ssQzRedirectSet(z, "", qz);
			ssQzActions(z, qz)
		});
	})
}
// form submission redirect
$(document).ajaxComplete((ev, xhr, settings) => {
	let x = settings.data.split("&"), y = document.querySelector("form[data-ss-qz-redirecturl]");
	if(y !== null) {
		let z = y.getAttribute("data-ss-qz-redirecturl");
		x.forEach(a => {
			if(a.split("=")[0] == "name" && a.split("=")[1].replace("+", " ") == y.getAttribute("data-name")) {
				location.href = z}
		})
	}
});
console.log(ssQzRef)