/**
 * Enter here the user flows and custom policies for your B2C application
 
 */
const b2cPolicies = {
    names: {
        signUpSignIn: "B2C_1_SignUpSignIn",
        editProfile: "B2C_1_ProfileEdit",
        forgotPassword:"B2C_1_PasswordReset"
    },
    authorities: {
        signUpSignIn: {
            authority: "https://workstreamautomation021.b2clogin.com/workstreamautomation021.onmicrosoft.com/B2C_1_SignUpSignIn"
        },
        editProfile: {
            authority: "https://workstreamautomation021.b2clogin.com/workstreamautomation021.onmicrosoft.com/B2C_1_ProfileEdit"
        },
        forgotPassword: {
            authority: "https://workstreamautomation021.b2clogin.com/workstreamautomation021.onmicrosoft.com/B2C_1_PasswordReset"
        }
    },
    authorityDomain: "workstreamautomation021.b2clogin.com"
}