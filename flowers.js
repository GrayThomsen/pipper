import { getData, createPip } from "./api.js";

const pips = await getData(0); // Hent de første 5. her kalder jeg php serveren gennem funktionen fra api.js filen.
console.log(pips);


document.getElementById("color").addEventListener("input", (e) => {
    const value = e.target.value;
    // console.log(value);
    document.getElementById("counter").innerText = value.length;

    // console.log(value.length);
    if (value.length > 256) {
        alert("Max 256 tegn")
        document.getElementById("color").value = value.substr(0,256);
    }  
})


document.getElementById("pip-form").addEventListener("submit", (event) => {
    event.preventDefault() // stopper standard opførslen, hvor browseren reloader siden

    const name = document.getElementById("name").value
    //const name2 = event.target[0].value; // henter også name
    const color = document.getElementById("message").value
    // const phone = document.getElementById("phone").value

    // console.log(name, email, phone)

    if (name === "") {
        alert("Der mangler et navn")
    } else if (color === "") {
        alert("Der mangler besked")
    } else {
        createPip(name, message);
    }
    // if (phone === "") {
    //     alert("Der mangler phone")
    // }

    addPipToDOM(name, message)    

    //console.log(event.target["name"].value);


})

function addPipToDOM(name, message) {
    let pipHtml = document.getElementById("pip"); 
    let clon = pipHtml.content.cloneNode(true);
    
    // Sætter jeg den studerendes værdier ind i klonen af templaten
    clon.querySelector(".name").innerText = name;
    clon.querySelector(".message").innerText = message;
    // clon.querySelector(".phone").innerText = phone;

    // indsætter vi templaten i html dokumentet (så brugeren kan se den)
    document.getElementById("pips").appendChild(clon);
}

pips.forEach((pip) => {
        addPipToDOM(pip.pipname, pip.pipmessage)
})

// 1: Lægge flower objekter i array
// 2: Loop igennem array og console.log() hvert objekt

document.getElementById("add").addEventListener("click", () => {
    
    let count = Number(document.getElementById("count").innerText);
    count++;
    document.getElementById("count").innerText = count;

    document.getElementById("total").innerText = count * price + " kr"
});

document.getElementById("remove").addEventListener("click", () => {
    let count = Number(document.getElementById("count").innerText);
    if (count > 0) {
        count--;
        document.getElementById("count").innerText = count;
        document.getElementById("total").innerText = count * price + " kr"
    }
});