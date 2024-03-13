// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const jwt = require('jsonwebtoken');
const myMSALObj = new msal.PublicClientApplication(msalConfig);
const jwt = JWT;

let accountId = "";
let username = "";
let emailAddress="";

function setAccount(account) {
    accountId = account.homeAccountId;
    console.log(accountId);
    username = account.idTokenClaims.given_name;
    console.log(username);
    welcomeUser(username); // Call the welcomeUser function with the username
    emailAddress = account.idTokenClaims.emails[0];
    console.log(emailAddress);
    displayEmail(emailAddress); // Call the displayEmail function with the email address
    console.log(account)
    //console.log(accounts);
    // loadDesktopContent();
}

function decodeAccessToken(accessToken) {
    try {
      const decodedToken = jwt.decode(accessToken, { complete: true });
      return decodedToken.payload;
    } catch (error) {
      console.error('Error decoding access token:', error);
      return null;
    }
  }

function toggleUserProfile() {
    var userProfileContainer = document.getElementById("userProfileContainer");
    if (userProfileContainer.style.display === "none") {
      userProfileContainer.style.display = "block";
    } else {
      userProfileContainer.style.display = "none";
    }
  }

function selectAccount() {
    

    const currentAccounts = myMSALObj.getAllAccounts();

    if (currentAccounts.length < 1) {
        return;
    } else if (currentAccounts.length > 1) {

        /**
         * Due to the way MSAL caches account objects, the auth response from initiating a user-flow
         * is cached as a new account, which results in more than one account in the cache. Here we make
         * sure we are selecting the account with homeAccountId that contains the sign-up/sign-in user-flow, 
         * as this is the default flow the user initially signed-in with.
         */
        const accounts = currentAccounts.filter(account =>
            account.homeAccountId.toUpperCase().includes(b2cPolicies.names.signUpSignIn.toUpperCase())
            &&
            account.idTokenClaims.iss.toUpperCase().includes(b2cPolicies.authorityDomain.toUpperCase())
            &&
            account.idTokenClaims.aud === msalConfig.auth.clientId 
            );

        if (accounts.length > 1) {
            // localAccountId identifies the entity for which the token asserts information.
            if (accounts.every(account => account.localAccountId === accounts[0].localAccountId)) {
                // All accounts belong to the same user
                setAccount(accounts[0]);
            } else {
                // Multiple users detected. Logout all to be safe.
                signOut();
            };
        } else if (accounts.length === 1) {
            setAccount(accounts[0]);
            fetchUserData();
        }

    } else if (currentAccounts.length === 1) {
        setAccount(currentAccounts[0]);
    }
}

// in case of page refresh
selectAccount();

function handleResponse(response) {
    

    if (response !== null) {
        setAccount(response.account);
        fetchUserData();
    } else {
        selectAccount();
    }
}

function signIn() {

   
// login window yahn se open hoti hai and azure pe call jati hai and azure ki login screen open hoti hai
    myMSALObj.loginPopup(loginRequest)
        .then(handleResponse)
        .catch(error => {
            console.log(error);
        });
}

function signOut() {


    const logoutRequest = {
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
        mainWindowRedirectUri: msalConfig.auth.redirectUri
    };

    myMSALObj.logoutPopup(logoutRequest);
}
function getTokenPopup(request) {
    request.account = myMSALObj.getAccountByHomeId(accountId);
    console.log("Request object:", request);
    console.log("Account object:", myMSALObj.getAccountByHomeId(accountId));
    return myMSALObj.acquireTokenSilent(request)
      .then((response) => {
        console.log("Access token from cache:", response.accessToken);
        if (!response.accessToken || response.accessToken === "") {
          throw new msal.InteractionRequiredAuthError;
        }
        return response;
      })
      .catch(error => {
        console.log("Silent token acquisition fails. Acquiring token using popup. \n", error);
        if (error instanceof msal.InteractionRequiredAuthError) {
          console.log("fallback to interaction when silent call fails");
          return myMSALObj.acquireTokenPopup(request)
            .then(response => {
              console.log("Access token from popup:", response.accessToken);
              return response;
            }).catch(error => {
              console.log(error);
            });
        } else {
          console.log(error);
        }
      });
  }
// function getTokenPopup(request) {

   
//     request.account = myMSALObj.getAccountByHomeId(accountId);


//     return myMSALObj.acquireTokenSilent(request)
//         .then((response) => {
//             // In case the response from B2C server has an empty accessToken field
//             // throw an error to initiate token acquisition
//             if (!response.accessToken || response.accessToken === "") {
//                 throw new msal.InteractionRequiredAuthError;
//             }
//             return response;
//         })
//         .catch(error => {
//             console.log("Silent token acquisition fails. Acquiring token using popup. \n", error);
//             if (error instanceof msal.InteractionRequiredAuthError) {
//                 // fallback to interaction when silent call fails
//                 return myMSALObj.acquireTokenPopup(request)
//                     .then(response => {
//                         console.log(response);
//                         return response;
//                     }).catch(error => {
//                         console.log(error);
//                     });
//             } else {
//                 console.log(error);
//             }
//         });
// }

function passTokenToApi() {
    getTokenPopup(tokenRequest)
      .then(response => {
        if (response) {
          console.log("access_token acquired at: " + new Date().toString());
          const decodedToken = decodeAccessToken(response.accessToken);
          if (decodedToken) {
            const table = document.createElement('table');
            const headerRow = document.createElement('tr');
            const keys = Object.keys(decodedToken);
            keys.forEach(key => {
              const th = document.createElement('th');
              th.textContent = key;
              headerRow.appendChild(th);
            });
            table.appendChild(headerRow);
            const valuesRow = document.createElement('tr');
            keys.forEach(key => {
              const td = document.createElement('td');
              td.textContent = decodedToken[key];
              valuesRow.appendChild(td);
            });
            table.appendChild(valuesRow);
            document.body.appendChild(table);
            try {
              callApi(apiConfig.webApi, response.accessToken);
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
  }

// function fetchUserData() {
//     const tokenRequest = {
//         scopes: ["user.ReadWrite.All"], // Specify the required scopes for accessing user data
//     };
//     getTokenPopup(tokenRequest)
//     .then(response => {
//         if (response) {
//             console.log("Access token acquired at: " + new Date().toString());
//             // Call Microsoft Graph API to fetch user data
//             fetch("https://graph.microsoft.com", {
//                 headers: {
//                     Authorization: `Bearer ${response.accessToken}`
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log("User data:", data);
//                 // Process the user data as required
//             })
//             .catch(error => {
//                 console.log("Error fetching user data:", error);
//             });
//         }
//     });
// }


function editProfile() {
    
    const editProfileRequest = b2cPolicies.authorities.editProfile;
    editProfileRequest.loginHint = myMSALObj.getAccountByHomeId(accountId).username;

    myMSALObj.loginPopup(editProfileRequest)
        .catch(error => {
            console.log(error);
        });
}

// function handlePolicyChange(response) {
//     

//     if (response.idTokenClaims['acr'] === b2cPolicies.names.editProfile) {
//         window.alert("Profile has been updated successfully. \nPlease sign-in again.");
//         myMSALObj.logout();
//     } else if (response.idTokenClaims['acr'] === b2cPolicies.names.forgotPassword) {
//         window.alert("Password has been reset successfully. \nPlease sign-in with your new password.");
//         myMSALObj.logout();
//     }
// }
