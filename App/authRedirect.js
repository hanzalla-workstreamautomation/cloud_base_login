// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
const myMSALObj = new msal.PublicClientApplication(msalConfig);

let accountId = "";
let username = "";
let accessToken = null;

myMSALObj.handleRedirectPromise()
    .then(response => {
        if (response) {
            /**
             * For the purpose of setting an active account for UI update, we want to consider only the auth response resulting
             * from SUSI flow. "tfp" claim in the id token tells us the policy (NOTE: legacy policies may use "acr" instead of "tfp").
             * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
             */
            if (response.idTokenClaims['tfp'].toUpperCase() === b2cPolicies.names.signUpSignIn.toUpperCase()) {
                handleResponse(response);
            }
        }
    })
    .catch(error => {
        console.log(error);
    });


function setAccount(account) {

    accountId = account.homeAccountId;
    username = account.username;
    welcomeUser(username);
}

function selectAccount() {

    /**
     * See here for more information on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

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
        }

    } else if (currentAccounts.length === 1) {
        setAccount(currentAccounts[0]);
    }
}

// in case of page refresh
selectAccount();

async function handleResponse(response) {



    if (response !== null) {
        setAccount(response.account);
    } else {
        selectAccount();
    }
}



function signIn() {

    myMSALObj.loginRedirect(loginRequest);
}

function signOut() {


    const logoutRequest = {
        postLogoutRedirectUri: msalConfig.auth.redirectUri,
    };

    myMSALObj.logoutRedirect(logoutRequest);
}

// function getTokenRedirect(request) {

   
//     request.account = myMSALObj.getAccountByHomeId(accountId); 
   
//     return myMSALObj.acquireTokenSilent(request)
//         .then((response) => {
//             // In case the response from B2C server has an empty accessToken field
//             // throw an error to initiate token acquisition
//             if (!response.accessToken || response.accessToken === "") {
//                 throw new msal.InteractionRequiredAuthError;
//             } else {
//                 console.log("access_token acquired at: " + new Date().toString());
//                 accessToken = response.accessToken;
//                 passTokenToApi();
//             }
//         }).catch(error => {
//             console.log("Silent token acquisition fails. Acquiring token using popup. \n", error);
//             if (error instanceof msal.InteractionRequiredAuthError) {
//                 // fallback to interaction when silent call fails
//                 return myMSALObj.acquireTokenRedirect(request);
//             } else {
//                 console.log(error);   
//             }
//     });
// }

function getTokenRedirect(request) {
    request.account = myMSALObj.getAccountByHomeId(accountId);
    console.log("Calling acquireTokenSilent with request:", request);
    return myMSALObj.acquireTokenSilent(request)
      .then((response) => {
        console.log("acquireTokenSilent success with response:", response);
        if (!response.accessToken || response.accessToken === "") {
          throw new msal.InteractionRequiredAuthError;
        } else {
          console.log("access_token acquired at: " + new Date().toString());
          accessToken = response.accessToken;
          passTokenToApi();
        }
      })
      .catch(error => {
        console.log("acquireTokenSilent error:", error);
        console.log("Silent token acquisition fails. Acquiring token using popup. \n", error);
        if (error instanceof msal.InteractionRequiredAuthError) {
          console.log("fallback to interaction when silent call fails");
          return myMSALObj.acquireTokenRedirect(request);
        } else {
          console.log(error);
        }
      });
  }
 
// Acquires and access token and then passes it to the API call
function passTokenToApi() {
    if (!accessToken) {
        getTokenRedirect(tokenRequest);
    } else {
        try {
            callApi(apiConfig.webApi, accessToken);
        } catch(error) {
            console.log(error); 
        }
    }
}

/**
 * To initiate a B2C user-flow, simply make a login request using
 * the full authority string of that user-flow e.g.
 * https://fabrikamb2c.b2clogin.com/fabrikamb2c.onmicrosoft.com/B2C_1_edit_profile_v2 
 */
function editProfile() {


    const editProfileRequest = b2cPolicies.authorities.editProfile;
    editProfileRequest.loginHint = myMSALObj.getAccountByHomeId(accountId).username;

    myMSALObj.loginRedirect(editProfileRequest);
}
// function handlePolicyChange(response) {
//     /**
//      * We need to reject id tokens that were not issued with the default sign-in policy.
//      * "acr" claim in the token tells us what policy is used (NOTE: for new policies (v2.0), use "tfp" instead of "acr").
//      * To learn more about B2C tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview
//      */

//     if (response.idTokenClaims['acr'] === b2cPolicies.names.editProfile) {
//         window.alert("Profile has been updated successfully. \nPlease sign-in again.");
//         myMSALObj.logout();
//     } else if (response.idTokenClaims['acr'] === b2cPolicies.names.forgotPassword) {
//         window.alert("Password has been reset successfully. \nPlease sign-in with your new password.");
//         myMSALObj.logout();
//     }
// }