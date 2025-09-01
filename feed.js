document.getElementById("workField").addEventListener("submit", (event) => {
  event.preventDefault(); // stopper standard opførslen, hvor browseren reloader siden

  const name = document.getElementById("writeTextName").value;
  //   const timestamp = document.getElementById("timestamp").value;
  const message = document.getElementById("writeTextMessage").value;

  if (name === "") {
    alert("Der mangler et navn");
  }
  if (message === "") {
    alert("Der mangler tekst");
  }

  if (name !== "" && message !== "") {
    addPipsToDOM(name, message);
  }
});

const pip1 = {
  name: "Dayan",
  message: "Long text about something",
  timestamp: "23-04-2024",
};
const pip2 = {
  name: "Signe",
  message: "Comment on an image",
  timestamp: "22-04-2024",
};
const pip3 = {
  name: "Pavla",
  message: "Medium text about something",
  timestamp: "20-04-2024",
};
const pip4 = {
  name: "Emil",
  message: "Short text about something",
  timestamp: "26-04-2024",
};

const pipFeed = [pip1, pip2, pip3, pip4];

function addPipsToDOM(name, message, timestamp) {
  let pipHtml = document.getElementById("pips");

  // opretter en kopi fordi jeg skal have en templates indhold per pip
  let clon = pipHtml.content.cloneNode(true);
  // console.log(clon);

  // Sætter den studerendes værdier ind i klonen af templaten
  clon.querySelector(".userName").innerText = name;
  clon.querySelector(".timeStamp").innerText = timestamp;
  clon.querySelector(".userMessage").innerText = message;

  // indsætter templaten i html dokumentet (så brugeren kan se den)
  document.getElementById("yourPipFeed").appendChild(clon);
}
