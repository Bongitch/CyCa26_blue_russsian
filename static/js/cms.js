function formatDateToHugo(date) {
  // Get the local date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Get the timezone offset in hours and minutes
  const offset = -date.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  const sign = offset >= 0 ? '+' : '-';

  // Format the date to include the timezone offset
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
}


CMS.registerEventListener({
  name: 'preSave',
  handler: async ({ entry }) => {
    const data = JSON.stringify(entry.get('data'), null, 2);
    const dataObject = JSON.parse(data);
    let url = window.location.href;
    console.log(dataObject);

    // Check if url includes post/posts
    if ((url.includes("post") || url.includes("posts")) && !url.includes("featured")) {

      // Check if the authors field is empty or undefined
      if ((!Array.isArray(dataObject.authors) || dataObject.authors.length === 0)) {
        alert("At least one author is required.");
        throw new Error("Validation failed: At least one author is required."); // Prevent saving
      }

      if (!Array.isArray(dataObject.tags) || dataObject.tags.length === 0) {
        alert("At least one tag is required.");
        throw new Error("Validation failed: At least one tag is required."); // Prevent saving
      }
    }

    const formattedDate = formatDateToHugo(new Date());
    return entry.get('data').set('date', formattedDate);
  },
});

const handlePostEvent = async (eventName, { entry }) => {
  console.log(`${eventName} entry data:`, JSON.stringify(entry.get('data'), null, 2));

  // Make a POST request to local server to run the script
  try {
    const response = await fetch('http://localhost:3000/run-script', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ entry: entry.get('data') }), // Send data to the page
    });

    if (!response.ok) {
      throw new Error('Failed to run script');
    }

    const result = await response.text();
    console.log('Script result:', result);
  } catch (error) {
    console.error(`Error running script on ${eventName}:`, error);
  }
};

CMS.registerEventListener({
  name: 'postPublish',
  handler: (event) => handlePostEvent('Published', event),
});

CMS.registerEventListener({
  name: 'postUnpublish',
  handler: (event) => handlePostEvent('Unpublished', event),
});