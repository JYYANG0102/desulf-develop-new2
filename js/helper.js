let getHostAddr;
let getHostPort;

function loadWebAssembly(fileName){
	return fetch(fileName)
	.then(response => response.arrayBuffer())
	.then(buffer => WebAssembly.compile(buffer))
	.then(module => {return new WebAssembly.Instance(module) });
}

loadWebAssembly('./js/helper.wasm')
		.then(instance => {
			getHostPort = instance.exports._Z11getHostPortv;
			getHostAddr = instance.exports._Z11getHostAddrv;
			// console.log('Helper.wasm finished compiling! ');
			let buffer = new Uint8Array(instance.exports.memory.buffer);
			let ipaddr = "";
			for (let i=getHostAddr(); buffer[i]; i++) {
				ipaddr += String.fromCharCode(buffer[i]);
			}
			let port = getHostPort();
			startMqttClient(ipaddr, port);
});

function save_as_svg() {
	fetch('../css/procedures.css')
		.then(response => response.text())
		.then(text => {
			var svg_data = document.getElementById("svg_canvas").innerHTML
			var head = '<svg title="graph" version="1.1" xmlns="http://www.w3.org/2000/svg">'
			var style = "<style>" + text + "</style>"
			var full_svg = head + style + svg_data + "</svg>"
			var blob = new Blob([full_svg], {type: "image/svg+xml"});
			saveAs(blob, "graph.svg");
		})
}