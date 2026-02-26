// Function to check if the current domain is localhost with default port number
function isLocalhost() {
    return window.location.hostname === 'localhost' && window.location.port === '1313'; //|| window.location.hostname === '127.0.0.1';
}

// Check if the user is on the admin page
if (window.location.pathname.startsWith('/admin')) {
    // If not on localhost, redirect to a different page (e.g., home page)
    if (!isLocalhost()) {
        window.location.href = '/'; // Redirect to home or any other page
    }
}