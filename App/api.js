function callApi(endpoint, token) {
    
    const headers = new Headers();
    const bearer = `Bearer ${token}`;
    console.log(token);
  
    headers.append("Authorization", bearer);
  
    const options = {
        method: "GET",
        headers: headers
      };
  
    logMessage('Calling web API...');
    
    fetch(endpoint, options)
      .then(response => response.json())
      .then(response => {
        if (response) {
          logMessage('Web API responded: ' + response.given_name);
        }
        return response;
      })
      .catch(error => {
        console.error('Fetch error: ', error);
      });

    }