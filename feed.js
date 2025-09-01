const  pip1 = {
    name: "Dayan",
    message: "Long text about something",
    timestamp: 23-4-2024,
}
const  pip2 = {
    name: "Signe",
    message: "Comment on an image",
    timestamp: 22-4-2024,
}
const  pip3 = {
    name: "Pavla",
    message: "Medium text about something",
    timestamp: 20-4-2024,
}
const  pip4 = {
    name: "Emil",
    message: "Short text about something",
    timestamp: 26-4-2024,
}

const pipFeed = [pip1, pip2, pip3, pip4]

pipFeed.forEach((pip) => {
    // html template som hedder student, som definerer en studerende i html
    let pipHtml = document.getElementById("pips"); 
     console.log(pipHtml);
    
    // opretter en kopi fordi jeg skal have en templates indhold per student
    let clon = pipHtml.content.cloneNode(true);
    // console.log(clon);
    
    // udvælger navnet, email og phone
    let pName = clon.querySelector(".userName");
    let pTime = clon.querySelector(".timeStamp");
    let pMessage = clon.querySelector(".userMessage");

    // Sætter jeg den studerendes værdier ind i klonen af templaten
    pName.innerText = pip.name;
    pTime.innerText = pip.timestamp;
    pMessage.innerText = pip.message;

    // indsætter vi templaten i html dokumentet (så brugeren kan se den)
    document.getElementById("yourPipFeed").appendChild(clon);
    
    // console.log(element);
    // alert("Now calling " + element.tlf + " to speak with " + element.name)
})