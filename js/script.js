// Globala konstanter och variabler
var boardElem;			// Referens till div-element för "spelplanen"
const carImgs = ["car_up.png","car_right.png","car_down.png","car_left.png"];
						// Array med filnamn för bilderna med bilen
var carDir = 1;			// Riktning för bilen, index till carImgs
var carElem;			// Referens till img-element för bilen
const xStep = 5;		// Antal pixlar som bilen ska förflytta sig i x-led
const yStep = 5;		// eller y-led i varje steg
const timerStep = 20;	// Tid i ms mellan varje steg i förflyttningen
var timerRef = null;	// Referens till timern för bilens förflyttning
var startBtn;			// Referens till startknappen
var stopBtn;			// Referens till stoppknappen
/* === Tillägg i uppgiften === */
var pigElem;		
let pigCount = 0;	//Antal grisar
var pigCountElem;	//Elementet för räknaren för antal grisar
let pigHit = 0;		//Antal påkörda grisar
var pigHitElem;		//Elementet för räknaren för antal påkörda grisar
let pigIsHit = false; //Boolean för att kolla ifall grisen är påkörd eller inte
let pigRespawnTimer = 0; //en räknare som fungerar som timer, används 	

let pigXCoordinates; //Grisens kordinater i x-led, räknar vänster till höger
let pigYCoordinates; //Grisens kordinater i y-led, räknar uppefrån och ner

let pigImgMinX = 60; //Grisens hitbox gräns längst till vänster i x-led
let pigImgMaxX = 30; //Grisens hitbox gräns längst till höger i x-led
let pigImgMinY = 60; //Grisens hitbox gräns längst upp, i y-led
let pigImgMaxY = 30; //Grisens hitbox gränst längst ner, i y-led

// ------------------------------
// Initiera globala variabler och koppla funktion till knapp
function init() {
	// Referenser till element i gränssnittet
		boardElem = document.getElementById("board");
		carElem = document.getElementById("car");
		startBtn = document.getElementById("startBtn");
		stopBtn = document.getElementById("stopBtn");
	// Lägg på händelsehanterare
		document.addEventListener("keydown",checkKey);
			// Känna av om användaren trycker på tangenter för att styra bilen
		startBtn.addEventListener("click",startGame);
		stopBtn.addEventListener("click",stopGame);
	// Aktivera/inaktivera knappar
		startBtn.disabled = false;
		stopBtn.disabled = true;
	/* === Tillägg i uppgiften === */
	    pigElem = document.getElementById("pig");
		pigHitElem = document.getElementById("hitCounter");
		pigCountElem = document.getElementById("pigNr");

} // End init
window.addEventListener("load",init);
// ------------------------------
// Kontrollera tangenter och styr bilen
function checkKey(e) {
	let k = e.keyCode;
	switch (k) {
		case 37: // Pil vänster
		case 90: // Z
			carDir--; // Bilens riktning 90 grader åt vänster
			if (carDir < 0) carDir = 3;
			carElem.src = "img/" + carImgs[carDir];
			break;
		case 39:  // Pil höger
		case 173: // -
			carDir++; // Bilens riktning 90 grader åt höger
			if (carDir > 3) carDir = 0;
			carElem.src = "img/" + carImgs[carDir];
			break;
	}
} // End checkKey
// ------------------------------
// Initiera spelet och starta bilens rörelse
function startGame() {
	startBtn.disabled = true;
	stopBtn.disabled = false;
	carElem.style.left = "0px";
	carElem.style.top = "0px";
	carDir = 1;
	carElem.src = "img/" + carImgs[carDir];
	moveCar();
	
	/* === Tillägg i uppgiften === */
	timerRef = setTimeout(placePig, 2000);
	pigHit = 0;
	pigCount = 0;
	pigHitElem.innerHTML = pigHit;
	pigCountElem.innerHTML = pigCount;
	pigRespawnTimer = 0;
} // End startGame
// ------------------------------
// Stoppa spelet
function stopGame() {
	if (timerRef != null) clearTimeout(timerRef);
	startBtn.disabled = false;
	stopBtn.disabled = true;
	/* === Tillägg i uppgiften === */
	pigCount = 0;
	pigElem.style.visibility = "hidden";
} // End stopGame
// ------------------------------
// Flytta bilen ett steg framåt i bilens riktning
function moveCar() {

	let xLimit = boardElem.offsetWidth - carElem.offsetWidth;
	let yLimit = boardElem.offsetHeight - carElem.offsetHeight;
	let x = parseInt(carElem.style.left);	// x-koordinat (left) för bilen
	let y = parseInt(carElem.style.top);	// y-koordinat (top) för bilen
	switch (carDir) {
		case 0: // Uppåt
			y -= yStep;
			if (y < 0) y = 0;
			break;
		case 1: // Höger
			x += xStep;
			if (x > xLimit) x = xLimit;
			break;
		case 2: // Nedåt
			y += yStep;
			if (y > yLimit) y = yLimit;
			break;
		case 3: // Vänster
			x -= xStep;
			if (x < 0) x = 0;
			break;
	}
	carElem.style.left = x + "px";
	carElem.style.top = y + "px";
	timerRef = setTimeout(moveCar,timerStep);
	/* === Tillägg i uppgiften === */
	checkCollision(x, y);
} // End moveCar
// ------------------------------

/* === Tillägg av nya funktioner i uppgiften === */

//Placerar ut gris efter slumpmässiga koordinater och håller räkningen på summan av alla grisar, avslutar spelet ifall gris 11 ska placeras, 
function placePig(){
	pigCount++;
	if(pigCount > 10){
		stopGame();
	}else{
		pigSizer();
		pigCountElem.innerHTML = pigCount;
		xLimitPig = boardElem.offsetWidth - pigElem.offsetWidth;
		yLimitPig = boardElem.offsetHeight - pigElem.offsetHeight;

		pigXCoordinates = Math.floor(Math.random() * xLimitPig);
		pigYCoordinates = Math.floor(Math.random() * yLimitPig);
		
		//sätter ut grisen på slumpade kordinater
		pigElem.style.top = pigYCoordinates + "px";
		pigElem.style.left = pigXCoordinates + "px";
		pigElem.style.visibility = "visible";
		pigIsHit = false; //Nuvarande gris har inte blivit påkörd ännu, gör att checkCollisons första ifsats kan stämma.
	}
}

//Används när grisen förvinner utan att bli påkörd, kanske onödig egentligen.
function removePig(){
	//grisen sprang iväg och därför måste timern resettas
	pigRespawnTimer = 0;
	pigElem.style.visibility = "hidden";
	placePig();
}

//Kollar ifall grisbild och bilbild överlappar om:
//Ja: ändrar bilden på grisen till smack.png, ändrar storleken till någon rimligare och ökar antal pigHit
//Nej: timer ökar, om 400 omplaceras grisen
function checkCollision(x, y){
	if(x > pigXCoordinates - pigImgMinX 
		&& x < pigXCoordinates + pigImgMaxX 
		&& y > pigYCoordinates - pigImgMinY 
		&& y < pigYCoordinates + pigImgMaxY 
		&& pigIsHit === false){ 
		smackSizer();
		pigHit++;
		pigIsHit = true;
		pigRespawnTimer = 0;
		timerRef = setTimeout(placePig, 2000);
	} else{
		//Räknare för att vildsvin, vildsvin försvinner efter ca 9 sekunder
		pigRespawnTimer++;
		if(pigRespawnTimer === 400){
			removePig();
		}
	}
	pigHitElem.innerHTML = pigHit + "/10";
	pigCountElem.innerHTML = pigCount;
	return;
}

//Ändrar bilden till pig.png och ändrar storleken till grisens storlek
function pigSizer(){
	pigElem.src = "img/pig.png";
	pigElem.style.height = 40 + "px";
	pigElem.style.width = 40 + "px";
}

//Ändrar bilden till smack.png och ändrar storleken med 15 px i båda led. Ansåg att det var lite för litet
function smackSizer(){
	pigElem.src = "img/smack.png";
	pigElem.style.height = 55 + "px";
	pigElem.style.width = 55 + "px";
}