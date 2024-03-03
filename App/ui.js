// Select DOM elements to work with
const signInButton = document.getElementById('signIn');
const signOutButton = document.getElementById('signOut')
const titleDiv = document.getElementById('title-div');
const welcomeDiv = document.getElementById('welcome-div');
const userProfileButton = document.getElementById('userProfileButton');
// const tableDiv = document.getElementById('table-div');
// const tableBody = document.getElementById('table-body-div');
const editProfileButton = document.getElementById('editProfileButton');
const callApiButton = document.getElementById('callApiButton');
const response = document.getElementById("response");
const label = document.getElementById('label');
const emailDiv = document.getElementById('email-div');
const containerDiv = document.getElementById('desktopContentContainer');



function welcomeUser(username) {
    // Ensure all required elements exist before accessing them
    if (welcomeDiv && signInButton && titleDiv && signOutButton && editProfileButton && callApiButton) {
        welcomeDiv.innerHTML = `Name: <strong>${username}</strong>`;

        // Check if elements have classList property before using it
        if (label.classList) label.classList.add('d-none');
        if (signInButton.classList) signInButton.classList.add('d-none');
        if (label.classList) label.classList.add('d-none');
        userProfileButton.style.display = 'block';
        if (signOutButton.classList) signOutButton.classList.remove('d-none');
        if (editProfileButton.classList) editProfileButton.classList.remove('d-none');
        if (welcomeDiv.classList) welcomeDiv.classList.remove('d-none');
        if (callApiButton.classList) callApiButton.classList.remove('d-none');
    } else {
        console.error('One or more required elements are missing.');
    }
}


function displayEmail(email) {
     // Ensure correct ID is used
    if (emailDiv) {
        emailDiv.innerHTML = `${email}`;
    } else {
        console.error('The email-div element is missing.');
    }
}

// function loadDesktopContent() {
//     fetch('http://localhost:8080/WRA/public/desktop.html')
//       .then(response => response.text())
//       .then(data => {
//         containerDiv.innerHTML = data;
//         console.log(data)
//       })
//       .catch(error => {
//         console.error('Error fetching file:', error);
//       });
//   }
  



function logMessage(s) {
    response.appendChild(document.createTextNode('\n' + s + '\n'));
}