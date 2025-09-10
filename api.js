
export async function createPip(name, content, timestamp) {
    // sende et post request til backend.
    // json encode pip objektet
    const dataObjectToSend = {
        name: name,
        content: content,
        timestamp: timestamp
    }

    const response = await fetch("http://127.0.0.1:8000/pips", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObjectToSend),
    });

    console.log(response);
    

}

export async function getData(offset) {
  const url = "http://127.0.0.1:8000/pips?limit=5&offset=" + offset;
  try {
    const response = await fetch(url);
    // console.log(response);
    
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    
    return result;

  } catch (error) {
    console.error(error.message);
  }
}