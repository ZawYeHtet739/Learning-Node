function fetchTravelData() {
  const token = document.getElementById('token-input').value;
  const apiUrl = document.getElementById('api-url-input').value;

  if (!token || !apiUrl) {
    alert('Please enter both token and API URL');
    return;
  }

  // Use fetch to make the GET request
  fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Handle the API response data here
      displayResult(data);
    })
    .catch(error => {
      // Handle errors here
      console.error('Fetch error:', error);
    });
}

function displayResult(data) {
  const resultContainer = document.getElementById('result-container');
  resultContainer.innerHTML = ''; // Clear previous content

  // Create elements to display the data
  const metaInfo = document.createElement('p');
  metaInfo.textContent = `Total: ${data.meta.total}, Page: ${data.meta.page}, Limit: ${data.meta.limit}`;

  const dataList = document.createElement('ul');
  data.data.forEach(item => {
    const listItem = document.createElement('li');
    listItem.textContent = JSON.stringify(item);
    dataList.appendChild(listItem);
  });

  resultContainer.appendChild(metaInfo);
  resultContainer.appendChild(dataList);
}