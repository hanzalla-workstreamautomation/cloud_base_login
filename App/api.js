function callApi(endpoint, token) {
    if (!token) {
        console.error("Invalid token provided");
        return;
    }
    
    const headers = new Headers();
    const bearer = `Bearer ${token}`;

    headers.append("Authorization", bearer);
    headers.append("Content-Type", "application/json");

    const options = {
        method: "GET",
        headers: headers
    };

    console.log('Calling web API...');
    
    fetch(endpoint, options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            return response.json();
        })
        .then(response => {
            if (response) {
                console.log('Web API responded: ' + response.given_name);
            }
            return response;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}
